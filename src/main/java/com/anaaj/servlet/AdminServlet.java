package com.anaaj.servlet;

import com.anaaj.dao.OrderDAO;
import com.anaaj.dao.ProductDAO;
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
 * Admin-only panel API. All methods check role=admin via session.
 *
 * GET  /api/admin?action=products  → list all products
 * GET  /api/admin?action=orders    → list all orders
 * GET  /api/admin?action=stats     → total orders + revenue
 * POST /api/admin?action=addProduct
 * POST /api/admin?action=editProduct
 * POST /api/admin?action=deleteProduct
 * POST /api/admin?action=updateOrderStatus
 */
@WebServlet("/api/admin")
public class AdminServlet extends HttpServlet {

    private final ProductDAO productDAO = new ProductDAO();
    private final OrderDAO   orderDAO   = new OrderDAO();
    private final Gson       gson       = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        if (!isAdmin(req)) { resp.setStatus(403); out.print("{\"error\":\"Forbidden\"}"); return; }

        String action = req.getParameter("action");
        if (action == null) { resp.setStatus(400); out.print("{\"error\":\"Missing action\"}"); return; }

        try {
            switch (action) {
                case "products" -> out.print(gson.toJson(productDAO.getAllProducts()));
                case "orders"   -> out.print(gson.toJson(orderDAO.getAllOrders()));
                case "stats"    -> {
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("totalOrders",  orderDAO.getTotalOrderCount());
                    stats.put("totalRevenue", orderDAO.getTotalRevenue());
                    out.print(gson.toJson(stats));
                }
                default -> { resp.setStatus(400); out.print("{\"error\":\"Unknown action\"}"); }
            }
        } catch (Exception e) {
            resp.setStatus(500); out.print("{\"error\":\"" + e.getMessage() + "\"}");
            getServletContext().log("AdminServlet GET error", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        if (!isAdmin(req)) { resp.setStatus(403); out.print("{\"error\":\"Forbidden\"}"); return; }

        String action = req.getParameter("action");
        if (action == null) { resp.setStatus(400); out.print("{\"error\":\"Missing action\"}"); return; }

        try {
            switch (action) {
                case "addProduct" -> {
                    Product p = buildProductFromRequest(req);
                    int id = productDAO.addProduct(p);
                    out.print("{\"success\":true,\"id\":" + id + "}");
                }
                case "editProduct" -> {
                    Product p = buildProductFromRequest(req);
                    p.setId(Integer.parseInt(req.getParameter("id")));
                    boolean ok = productDAO.updateProduct(p);
                    out.print("{\"success\":" + ok + "}");
                }
                case "deleteProduct" -> {
                    int id = Integer.parseInt(req.getParameter("id"));
                    boolean ok = productDAO.deleteProduct(id);
                    out.print("{\"success\":" + ok + "}");
                }
                case "updateOrderStatus" -> {
                    int    orderId = Integer.parseInt(req.getParameter("orderId"));
                    String status  = req.getParameter("status");
                    boolean ok = orderDAO.updateOrderStatus(orderId, status);
                    out.print("{\"success\":" + ok + "}");
                }
                default -> { resp.setStatus(400); out.print("{\"error\":\"Unknown action\"}"); }
            }
        } catch (Exception e) {
            resp.setStatus(500); out.print("{\"error\":\"" + e.getMessage() + "\"}");
            getServletContext().log("AdminServlet POST error", e);
        }
    }

    // ── Helpers ────────────────────────────────────────────────
    private boolean isAdmin(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return false;
        Object role = session.getAttribute("role");
        return "admin".equals(role);
    }

    private Product buildProductFromRequest(HttpServletRequest req) {
        Product p = new Product();
        p.setName(req.getParameter("name"));
        p.setDescription(req.getParameter("description"));
        p.setPrice(new BigDecimal(req.getParameter("price")));
        p.setUnit(req.getParameter("unit") != null ? req.getParameter("unit") : "kg");
        p.setStock(Integer.parseInt(req.getParameter("stock")));
        p.setCategoryId(Integer.parseInt(req.getParameter("categoryId")));
        p.setOriginState(req.getParameter("originState"));
        p.setFreshnessScore(req.getParameter("freshnessScore") != null
                ? Integer.parseInt(req.getParameter("freshnessScore")) : 100);
        p.setOrganic("true".equalsIgnoreCase(req.getParameter("isOrganic")));
        p.setImageUrl(req.getParameter("imageUrl"));
        return p;
    }
}
