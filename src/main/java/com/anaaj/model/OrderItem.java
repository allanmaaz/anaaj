package com.anaaj.model;

import java.math.BigDecimal;

/** A single line-item within an order. */
public class OrderItem {
    private int id;
    private int orderId;
    private int productId;
    private String productName; // joined field
    private int quantity;
    private BigDecimal unitPrice;

    public OrderItem() {}

    public OrderItem(int productId, String productName, int quantity, BigDecimal unitPrice) {
        this.productId   = productId;
        this.productName = productName;
        this.quantity    = quantity;
        this.unitPrice   = unitPrice;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public int getId()                { return id; }
    public void setId(int id)        { this.id = id; }
    public int getOrderId()          { return orderId; }
    public void setOrderId(int oid)  { this.orderId = oid; }
    public int getProductId()        { return productId; }
    public void setProductId(int pid){ this.productId = pid; }
    public String getProductName()   { return productName; }
    public void setProductName(String pn){ this.productName = pn; }
    public int getQuantity()         { return quantity; }
    public void setQuantity(int q)   { this.quantity = q; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal up){ this.unitPrice = up; }

    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
