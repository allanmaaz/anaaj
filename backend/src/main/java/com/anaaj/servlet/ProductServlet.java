package com.anaaj.servlet;

import com.anaaj.dao.ProductDAO;
import com.anaaj.dao.ReviewDAO;
import com.anaaj.model.Product;
import com.anaaj.model.Review;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import com.google.gson.Gson;

/**
 * Serves product data as JSON (REST-style) for the SPA frontend.
 * GET  /api/products             → all products
 * GET  /api/products?search=...  → search
 * GET  /api/products?category=X  → filter by category
 * GET  /api/products?state=X     → filter by origin state
 * GET  /api/products?id=X        → single product with reviews
 * GET  /api/products?featured=1  → featured products
 * POST /api/products/review      → add review
 */
@WebServlet("/api/products/*")
public class ProductServlet extends HttpServlet {

    private final ProductDAO productDAO = new ProductDAO();
    private final ReviewDAO  reviewDAO  = new ReviewDAO();
    private final Gson       gson       = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            String idParam       = req.getParameter("id");
            String searchParam   = req.getParameter("search");
            String categoryParam = req.getParameter("category");
            String stateParam    = req.getParameter("state");
            String featuredParam = req.getParameter("featured");

            if (idParam != null) {
                int productId = Integer.parseInt(idParam);
                Product p = productDAO.getProductById(productId);
                if (p == null) { resp.setStatus(404); out.print("{\"error\":\"Not found\"}"); return; }
                List<Review> reviews = reviewDAO.getReviewsByProduct(productId);

                // Build composite response
                out.print("{\"product\":" + gson.toJson(p) + ",\"reviews\":" + gson.toJson(reviews) + "}");

            } else if (searchParam != null && !searchParam.isBlank()) {
                out.print(gson.toJson(productDAO.searchProducts(searchParam.trim())));

            } else if (categoryParam != null) {
                out.print(gson.toJson(productDAO.getByCategory(Integer.parseInt(categoryParam))));

            } else if (stateParam != null) {
                out.print(gson.toJson(productDAO.getByOriginState(stateParam)));

            } else if ("1".equals(featuredParam)) {
                out.print(gson.toJson(productDAO.getFeaturedProducts()));

            } else {
                // Return all + origin states for filters
                List<Product> products = productDAO.getAllProducts();
                List<String>  states   = productDAO.getOriginStates();
                out.print("{\"products\":" + gson.toJson(products) + ",\"states\":" + gson.toJson(states) + "}");
            }

        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
            getServletContext().log("ProductServlet GET error", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(401);
            out.print("{\"error\":\"Unauthorized — please log in\"}");
            return;
        }

        try {
            int    userId    = (int) session.getAttribute("userId");
            int    productId = Integer.parseInt(req.getParameter("productId"));
            int    rating    = Integer.parseInt(req.getParameter("rating"));
            String comment   = req.getParameter("comment");

            if (rating < 1 || rating > 5) {
                resp.setStatus(400);
                out.print("{\"error\":\"Rating must be 1–5\"}");
                return;
            }

            if (reviewDAO.hasReviewed(userId, productId)) {
                resp.setStatus(409);
                out.print("{\"error\":\"You have already reviewed this product\"}");
                return;
            }

            Review review = new Review();
            review.setUserId(userId);
            review.setProductId(productId);
            review.setRating(rating);
            review.setComment(comment);

            reviewDAO.addReview(review);
            out.print("{\"success\":true,\"avgRating\":" + reviewDAO.getAvgRating(productId) + "}");

        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
            getServletContext().log("ProductServlet POST error", e);
        }
    }
}
