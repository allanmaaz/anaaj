package com.anaaj.dao;

import com.anaaj.model.Review;
import com.anaaj.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Review entity.
 * Enforces one review per user per product via the UNIQUE constraint in DB.
 */
public class ReviewDAO {

    /** Returns all reviews for a product, newest first. */
    public List<Review> getReviewsByProduct(int productId) throws SQLException {
        String sql = "SELECT r.*, u.name AS user_name FROM reviews r "
                + "JOIN users u ON r.user_id = u.id "
                + "WHERE r.product_id = ? ORDER BY r.created_at DESC";
        List<Review> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    /**
     * Inserts a new review.
     * Will throw a SQLIntegrityConstraintViolationException if user already reviewed this product.
     */
    public boolean addReview(Review review) throws SQLException {
        String sql = "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, review.getUserId());
            ps.setInt(2, review.getProductId());
            ps.setInt(3, review.getRating());
            ps.setString(4, review.getComment());
            return ps.executeUpdate() > 0;
        }
    }

    /** Checks if a user has already reviewed a specific product. */
    public boolean hasReviewed(int userId, int productId) throws SQLException {
        String sql = "SELECT 1 FROM reviews WHERE user_id=? AND product_id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, productId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /** Returns the average rating for a product (0.0 if no reviews). */
    public double getAvgRating(int productId) throws SQLException {
        String sql = "SELECT COALESCE(AVG(rating), 0.0) FROM reviews WHERE product_id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getDouble(1) : 0.0;
            }
        }
    }

    // ── Helper ─────────────────────────────────────────────────
    private Review mapRow(ResultSet rs) throws SQLException {
        Review r = new Review();
        r.setId(rs.getInt("id"));
        r.setUserId(rs.getInt("user_id"));
        try { r.setUserName(rs.getString("user_name")); } catch (SQLException ignored) {}
        r.setProductId(rs.getInt("product_id"));
        r.setRating(rs.getInt("rating"));
        r.setComment(rs.getString("comment"));
        r.setCreatedAt(rs.getTimestamp("created_at"));
        return r;
    }
}
