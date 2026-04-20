package com.anaaj.servlet;

import com.anaaj.dao.OrderDAO;
import com.anaaj.model.CartItem;
import com.anaaj.model.Order;
import com.anaaj.model.OrderItem;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.*;

import com.google.gson.Gson;

/**
 * Handles checkout and order history.
 * POST /api/orders?action=place  → place order
 * GET  /api/orders               → order history for logged-in user
 * GET  /api/orders?id=X          → single order detail
 */
@WebServlet("/api/orders")
public class OrderServlet extends HttpServlet {

    private static final String CART_KEY = "cart";
    private final OrderDAO orderDAO = new OrderDAO();
    private final Gson     gson     = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401); out.print("{\"error\":\"Unauthorized\"}"); return;
        }

        int userId = (int) session.getAttribute("userId");

        try {
            String idParam = req.getParameter("id");
            if (idParam != null) {
                Order o = orderDAO.getOrderById(Integer.parseInt(idParam));
                if (o == null || o.getUserId() != userId) {
                    resp.setStatus(404); out.print("{\"error\":\"Order not found\"}"); return;
                }
                out.print(gson.toJson(o));
            } else {
                out.print(gson.toJson(orderDAO.getOrdersByUser(userId)));
            }
        } catch (Exception e) {
            resp.setStatus(500); out.print("{\"error\":\"" + e.getMessage() + "\"}");
            getServletContext().log("OrderServlet GET error", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401); out.print("{\"error\":\"Unauthorized\"}"); return;
        }

        int userId = (int) session.getAttribute("userId");

        @SuppressWarnings("unchecked")
        Map<Integer, CartItem> cart = (Map<Integer, CartItem>) session.getAttribute(CART_KEY);
        if (cart == null || cart.isEmpty()) {
            resp.setStatus(400); out.print("{\"error\":\"Cart is empty\"}"); return;
        }

        String deliveryAddress = req.getParameter("address");
        if (deliveryAddress == null || deliveryAddress.isBlank()) {
            resp.setStatus(400); out.print("{\"error\":\"Delivery address required\"}"); return;
        }

        try {
            // Build order items from cart
            List<OrderItem> items = new ArrayList<>();
            BigDecimal total = BigDecimal.ZERO;
            for (CartItem ci : cart.values()) {
                items.add(new OrderItem(ci.getProductId(), ci.getProductName(), ci.getQuantity(), ci.getUnitPrice()));
                total = total.add(ci.getLineTotal());
            }

            Order order = new Order();
            order.setUserId(userId);
            order.setTotalAmount(total);
            order.setDeliveryAddress(deliveryAddress.trim());
            order.setItems(items);

            int orderId = orderDAO.placeOrder(order);
            if (orderId == -1) {
                resp.setStatus(500); out.print("{\"error\":\"Failed to place order\"}"); return;
            }

            // Clear cart after successful order
            session.removeAttribute(CART_KEY);

            out.print("{\"success\":true,\"orderId\":" + orderId + "}");

        } catch (Exception e) {
            resp.setStatus(500); out.print("{\"error\":\"" + e.getMessage() + "\"}");
            getServletContext().log("OrderServlet POST error", e);
        }
    }
}
