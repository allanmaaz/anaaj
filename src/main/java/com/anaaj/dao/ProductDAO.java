package com.anaaj.dao;

import com.anaaj.model.Product;
import com.anaaj.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Product entity.
 * Supports full CRUD, search by name (LIKE), and filter by category/state.
 */
public class ProductDAO {

    /** Returns all products joined with category names, including avg rating. */
    public List<Product> getAllProducts() throws SQLException {
        return queryProducts("SELECT p.*, c.name AS category_name, COALESCE(AVG(r.rating),0) AS avg_rating "
                + "FROM products p "
                + "LEFT JOIN categories c ON p.category_id = c.id "
                + "LEFT JOIN reviews r ON r.product_id = p.id "
                + "GROUP BY p.id, c.name ORDER BY p.created_at DESC", null);
    }

    /** Searches products by name substring (case-insensitive). */
    public List<Product> searchProducts(String query) throws SQLException {
        String sql = "SELECT p.*, c.name AS category_name, COALESCE(AVG(r.rating),0) AS avg_rating "
                + "FROM products p "
                + "LEFT JOIN categories c ON p.category_id = c.id "
                + "LEFT JOIN reviews r ON r.product_id = p.id "
                + "WHERE LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? "
                + "GROUP BY p.id, c.name ORDER BY p.name";
        String pattern = "%" + query.toLowerCase() + "%";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            return extractList(ps.executeQuery());
        }
    }

    /** Filters products by category ID. */
    public List<Product> getByCategory(int categoryId) throws SQLException {
        String sql = "SELECT p.*, c.name AS category_name, COALESCE(AVG(r.rating),0) AS avg_rating "
                + "FROM products p "
                + "LEFT JOIN categories c ON p.category_id = c.id "
                + "LEFT JOIN reviews r ON r.product_id = p.id "
                + "WHERE p.category_id = ? "
                + "GROUP BY p.id, c.name ORDER BY p.name";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, categoryId);
            return extractList(ps.executeQuery());
        }
    }

    /** Filters products by origin state. */
    public List<Product> getByOriginState(String state) throws SQLException {
        String sql = "SELECT p.*, c.name AS category_name, COALESCE(AVG(r.rating),0) AS avg_rating "
                + "FROM products p "
                + "LEFT JOIN categories c ON p.category_id = c.id "
                + "LEFT JOIN reviews r ON r.product_id = p.id "
                + "WHERE p.origin_state = ? "
                + "GROUP BY p.id, c.name ORDER BY p.name";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, state);
            return extractList(ps.executeQuery());
        }
    }

    /** Returns a single product by ID with avg rating. */
    public Product getProductById(int id) throws SQLException {
        String sql = "SELECT p.*, c.name AS category_name, COALESCE(AVG(r.rating),0) AS avg_rating "
                + "FROM products p "
                + "LEFT JOIN categories c ON p.category_id = c.id "
                + "LEFT JOIN reviews r ON r.product_id = p.id "
                + "WHERE p.id = ? GROUP BY p.id, c.name";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    /** Returns featured products (top 8 by freshness score). */
    public List<Product> getFeaturedProducts() throws SQLException {
        String sql = "SELECT p.*, c.name AS category_name, COALESCE(AVG(r.rating),0) AS avg_rating "
                + "FROM products p "
                + "LEFT JOIN categories c ON p.category_id = c.id "
                + "LEFT JOIN reviews r ON r.product_id = p.id "
                + "GROUP BY p.id, c.name ORDER BY p.freshness_score DESC LIMIT 8";
        return queryProducts(sql, null);
    }

    /** Inserts a new product (admin operation). */
    public int addProduct(Product p) throws SQLException {
        String sql = "INSERT INTO products (name, description, price, unit, stock, category_id, origin_state, freshness_score, is_organic, image_url) "
                + "VALUES (?,?,?,?,?,?,?,?,?,?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, p.getName());
            ps.setString(2, p.getDescription());
            ps.setBigDecimal(3, p.getPrice());
            ps.setString(4, p.getUnit());
            ps.setInt(5, p.getStock());
            ps.setInt(6, p.getCategoryId());
            ps.setString(7, p.getOriginState());
            ps.setInt(8, p.getFreshnessScore());
            ps.setBoolean(9, p.isOrganic());
            ps.setString(10, p.getImageUrl());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                return rs.next() ? rs.getInt(1) : -1;
            }
        }
    }

    /** Updates an existing product (admin operation). */
    public boolean updateProduct(Product p) throws SQLException {
        String sql = "UPDATE products SET name=?, description=?, price=?, unit=?, stock=?, category_id=?, "
                + "origin_state=?, freshness_score=?, is_organic=?, image_url=? WHERE id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, p.getName());
            ps.setString(2, p.getDescription());
            ps.setBigDecimal(3, p.getPrice());
            ps.setString(4, p.getUnit());
            ps.setInt(5, p.getStock());
            ps.setInt(6, p.getCategoryId());
            ps.setString(7, p.getOriginState());
            ps.setInt(8, p.getFreshnessScore());
            ps.setBoolean(9, p.isOrganic());
            ps.setString(10, p.getImageUrl());
            ps.setInt(11, p.getId());
            return ps.executeUpdate() > 0;
        }
    }

    /** Deletes a product by ID (admin operation). */
    public boolean deleteProduct(int id) throws SQLException {
        String sql = "DELETE FROM products WHERE id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    /** Returns distinct origin states for the regional filter. */
    public List<String> getOriginStates() throws SQLException {
        List<String> states = new ArrayList<>();
        String sql = "SELECT DISTINCT origin_state FROM products WHERE origin_state IS NOT NULL ORDER BY origin_state";
        try (Connection con = DBConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) states.add(rs.getString(1));
        }
        return states;
    }

    // ── Helpers ────────────────────────────────────────────────
    private List<Product> queryProducts(String sql, Object param) throws SQLException {
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            if (param != null) ps.setObject(1, param);
            return extractList(ps.executeQuery());
        }
    }

    private List<Product> extractList(ResultSet rs) throws SQLException {
        List<Product> list = new ArrayList<>();
        while (rs.next()) list.add(mapRow(rs));
        return list;
    }

    private Product mapRow(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setId(rs.getInt("id"));
        p.setName(rs.getString("name"));
        p.setDescription(rs.getString("description"));
        p.setPrice(rs.getBigDecimal("price"));
        p.setUnit(rs.getString("unit"));
        p.setStock(rs.getInt("stock"));
        p.setCategoryId(rs.getInt("category_id"));
        try { p.setCategoryName(rs.getString("category_name")); } catch (SQLException ignored) {}
        p.setOriginState(rs.getString("origin_state"));
        p.setFreshnessScore(rs.getInt("freshness_score"));
        p.setOrganic(rs.getBoolean("is_organic"));
        p.setImageUrl(rs.getString("image_url"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        try { p.setAvgRating(rs.getDouble("avg_rating")); } catch (SQLException ignored) {}
        return p;
    }
}
