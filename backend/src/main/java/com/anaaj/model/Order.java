package com.anaaj.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

/** Represents a placed order on Anaaj. */
public class Order {
    private int id;
    private int userId;
    private String userName;        // joined field
    private BigDecimal totalAmount;
    private String status;          // Confirmed | Packed | Shipped | Delivered
    private String deliveryAddress;
    private Timestamp createdAt;
    private List<OrderItem> items;  // populated when needed

    public Order() {}

    // ── Getters & Setters ─────────────────────────────────────
    public int getId()                         { return id; }
    public void setId(int id)                 { this.id = id; }
    public int getUserId()                    { return userId; }
    public void setUserId(int uid)            { this.userId = uid; }
    public String getUserName()               { return userName; }
    public void setUserName(String un)        { this.userName = un; }
    public BigDecimal getTotalAmount()        { return totalAmount; }
    public void setTotalAmount(BigDecimal ta) { this.totalAmount = ta; }
    public String getStatus()                 { return status; }
    public void setStatus(String status)      { this.status = status; }
    public String getDeliveryAddress()        { return deliveryAddress; }
    public void setDeliveryAddress(String da) { this.deliveryAddress = da; }
    public Timestamp getCreatedAt()           { return createdAt; }
    public void setCreatedAt(Timestamp t)     { this.createdAt = t; }
    public List<OrderItem> getItems()         { return items; }
    public void setItems(List<OrderItem> i)   { this.items = i; }

    /** Returns the CSS class for the current status step (0–3). */
    public int getStatusStep() {
        return switch (status) {
            case "Confirmed" -> 0;
            case "Packed"    -> 1;
            case "Shipped"   -> 2;
            case "Delivered" -> 3;
            default          -> 0;
        };
    }
}
