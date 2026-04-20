package com.anaaj.dao;

import com.anaaj.model.Order;
import com.anaaj.model.OrderItem;
import com.anaaj.util.DBConnection;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Order entity.
 * placeOrder() uses a transaction — either both inserts succeed or neither does.
 */
public class OrderDAO {

    /**
     * Places a new order inside a DB transaction.
     * Inserts into orders, then order_items. Rolls back on any failure.
     *
     * @return generated order ID, or -1 on failure
     */
    public int placeOrder(Order order) throws SQLException {
        String insertOrder = "INSERT INTO orders (user_id, total_amount, status, delivery_address) VALUES (?,?,?,?)";
        String insertItem  = "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)";

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                int orderId;
                try (PreparedStatement ps = con.prepareStatement(insertOrder, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, order.getUserId());
                    ps.setBigDecimal(2, order.getTotalAmount());
                    ps.setString(3, "Confirmed");
                    ps.setString(4, order.getDeliveryAddress());
                    ps.executeUpdate();
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (!rs.next()) { con.rollback(); return -1; }
                        orderId = rs.getInt(1);
                    }
                }

                try (PreparedStatement ps = con.prepareStatement(insertItem)) {
                    for (OrderItem item : order.getItems()) {
                        ps.setInt(1, orderId);
                        ps.setInt(2, item.getProductId());
                        ps.setInt(3, item.getQuantity());
                        ps.setBigDecimal(4, item.getUnitPrice());
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }

                con.commit();
                return orderId;

            } catch (SQLException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    /** Returns all orders for a specific user (most recent first). */
    public List<Order> getOrdersByUser(int userId) throws SQLException {
        String sql = "SELECT o.*, u.name AS user_name FROM orders o "
                + "JOIN users u ON o.user_id = u.id "
                + "WHERE o.user_id = ? ORDER BY o.created_at DESC";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            return extractOrders(ps.executeQuery());
        }
    }

    /** Returns ALL orders for admin view. */
    public List<Order> getAllOrders() throws SQLException {
        String sql = "SELECT o.*, u.name AS user_name FROM orders o "
                + "JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC";
        try (Connection con = DBConnection.getConnection();
             Statement st = con.createStatement()) {
            return extractOrders(st.executeQuery(sql));
        }
    }

    /** Returns a single order by ID with its line items. */
    public Order getOrderById(int id) throws SQLException {
        String sql = "SELECT o.*, u.name AS user_name FROM orders o "
                + "JOIN users u ON o.user_id = u.id WHERE o.id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Order order = mapOrder(rs);
                    order.setItems(getItemsForOrder(id, con));
                    return order;
                }
            }
        }
        return null;
    }

    /** Updates the status of an order (admin operation). */
    public boolean updateOrderStatus(int orderId, String status) throws SQLException {
        String sql = "UPDATE orders SET status=? WHERE id=?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, orderId);
            return ps.executeUpdate() > 0;
        }
    }

    /** Returns total order count (admin stats). */
    public int getTotalOrderCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM orders";
        try (Connection con = DBConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    /** Returns total revenue (admin stats). */
    public BigDecimal getTotalRevenue() throws SQLException {
        String sql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders";
        try (Connection con = DBConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            return rs.next() ? rs.getBigDecimal(1) : BigDecimal.ZERO;
        }
    }

    // ── Helpers ────────────────────────────────────────────────
    private List<OrderItem> getItemsForOrder(int orderId, Connection con) throws SQLException {
        String sql = "SELECT oi.*, p.name AS product_name FROM order_items oi "
                + "JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?";
        List<OrderItem> items = new ArrayList<>();
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, orderId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    OrderItem item = new OrderItem();
                    item.setId(rs.getInt("id"));
                    item.setOrderId(orderId);
                    item.setProductId(rs.getInt("product_id"));
                    item.setProductName(rs.getString("product_name"));
                    item.setQuantity(rs.getInt("quantity"));
                    item.setUnitPrice(rs.getBigDecimal("unit_price"));
                    items.add(item);
                }
            }
        }
        return items;
    }

    private List<Order> extractOrders(ResultSet rs) throws SQLException {
        List<Order> list = new ArrayList<>();
        while (rs.next()) list.add(mapOrder(rs));
        return list;
    }

    private Order mapOrder(ResultSet rs) throws SQLException {
        Order o = new Order();
        o.setId(rs.getInt("id"));
        o.setUserId(rs.getInt("user_id"));
        try { o.setUserName(rs.getString("user_name")); } catch (SQLException ignored) {}
        o.setTotalAmount(rs.getBigDecimal("total_amount"));
        o.setStatus(rs.getString("status"));
        o.setDeliveryAddress(rs.getString("delivery_address"));
        o.setCreatedAt(rs.getTimestamp("created_at"));
        return o;
    }
}
