package com.anaaj.servlet;

import com.anaaj.dao.ProductDAO;
import com.anaaj.model.CartItem;
import com.anaaj.model.Product;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;

/**
 * Session-based shopping cart API.
 * GET  /api/cart          → returns cart as JSON
 * POST /api/cart?action=add    → adds product to cart
 * POST /api/cart?action=update → updates quantity
 * POST /api/cart?action=remove → removes item
 * POST /api/cart?action=clear  → clears cart
 */
@WebServlet("/api/cart")
public class CartServlet extends HttpServlet {

    private static final String CART_KEY = "cart";
    private final ProductDAO productDAO = new ProductDAO();
    private final Gson       gson       = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        Map<Integer, CartItem> cart = getCart(req);

        BigDecimal total = cart.values().stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("items", cart.values());
        result.put("total", total);
        result.put("count", cart.values().stream().mapToInt(CartItem::getQuantity).sum());

        resp.getWriter().print(gson.toJson(result));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        // Must be logged in to use cart
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401);
            out.print("{\"error\":\"Please log in to use the cart\"}");
            return;
        }

        String action = req.getParameter("action");
        if (action == null) { resp.setStatus(400); out.print("{\"error\":\"Missing action\"}"); return; }

        Map<Integer, CartItem> cart = getCart(req);

        try {
            switch (action) {
                case "add" -> {
                    int productId = Integer.parseInt(req.getParameter("productId"));
                    int qty       = Integer.parseInt(req.getParameter("qty") != null ? req.getParameter("qty") : "1");
                    if (qty < 1) qty = 1;

                    Product product = productDAO.getProductById(productId);
                    if (product == null) { resp.setStatus(404); out.print("{\"error\":\"Product not found\"}"); return; }

                    if (cart.containsKey(productId)) {
                        cart.get(productId).setQuantity(cart.get(productId).getQuantity() + qty);
                    } else {
                        cart.put(productId, new CartItem(
                                productId, product.getName(), product.getPrice(), qty,
                                product.getImageUrl(), product.getUnit()));
                    }
                }
                case "update" -> {
                    int productId = Integer.parseInt(req.getParameter("productId"));
                    int qty       = Integer.parseInt(req.getParameter("qty"));
                    if (qty <= 0) { cart.remove(productId); }
                    else if (cart.containsKey(productId)) { cart.get(productId).setQuantity(qty); }
                }
                case "remove" -> {
                    int productId = Integer.parseInt(req.getParameter("productId"));
                    cart.remove(productId);
                }
                case "clear" -> cart.clear();
                default -> { resp.setStatus(400); out.print("{\"error\":\"Unknown action\"}"); return; }
            }

            session.setAttribute(CART_KEY, cart);
            out.print("{\"success\":true,\"count\":" + cart.values().stream().mapToInt(CartItem::getQuantity).sum() + "}");

        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
            getServletContext().log("CartServlet error", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<Integer, CartItem> getCart(HttpServletRequest req) {
        HttpSession session = req.getSession(true);
        Map<Integer, CartItem> cart = (Map<Integer, CartItem>) session.getAttribute(CART_KEY);
        if (cart == null) {
            cart = new HashMap<>();
            session.setAttribute(CART_KEY, cart);
        }
        return cart;
    }
}
