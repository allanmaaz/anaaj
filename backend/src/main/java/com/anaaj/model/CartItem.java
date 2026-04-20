package com.anaaj.model;

import java.math.BigDecimal;

/** Represents an item in the session-based shopping cart. */
public class CartItem {
    private int productId;
    private String productName;
    private BigDecimal unitPrice;
    private int quantity;
    private String imageUrl;
    private String unit;

    public CartItem() {}

    public CartItem(int productId, String productName, BigDecimal unitPrice, int quantity, String imageUrl, String unit) {
        this.productId   = productId;
        this.productName = productName;
        this.unitPrice   = unitPrice;
        this.quantity    = quantity;
        this.imageUrl    = imageUrl;
        this.unit        = unit;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public int getProductId()          { return productId; }
    public void setProductId(int pid)  { this.productId = pid; }
    public String getProductName()     { return productName; }
    public void setProductName(String n){ this.productName = n; }
    public BigDecimal getUnitPrice()   { return unitPrice; }
    public void setUnitPrice(BigDecimal p){ this.unitPrice = p; }
    public int getQuantity()           { return quantity; }
    public void setQuantity(int q)     { this.quantity = q; }
    public String getImageUrl()        { return imageUrl; }
    public void setImageUrl(String u)  { this.imageUrl = u; }
    public String getUnit()            { return unit; }
    public void setUnit(String unit)   { this.unit = unit; }

    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
