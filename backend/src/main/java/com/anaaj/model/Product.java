package com.anaaj.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

/** Represents a grain/food product listed on Anaaj. */
public class Product {
    private int id;
    private String name;
    private String description;
    private BigDecimal price;
    private String unit;           // e.g. "kg", "500g"
    private int stock;
    private int categoryId;
    private String categoryName;   // joined field — not a DB column
    private String originState;    // Indian state origin
    private int freshnessScore;    // 0–100
    private boolean isOrganic;
    private String imageUrl;
    private Timestamp createdAt;
    private double avgRating;      // computed via SQL AVG

    public Product() {}

    // ── Getters & Setters ─────────────────────────────────────
    public int getId()                       { return id; }
    public void setId(int id)               { this.id = id; }
    public String getName()                 { return name; }
    public void setName(String name)        { this.name = name; }
    public String getDescription()          { return description; }
    public void setDescription(String d)    { this.description = d; }
    public BigDecimal getPrice()            { return price; }
    public void setPrice(BigDecimal price)  { this.price = price; }
    public String getUnit()                 { return unit; }
    public void setUnit(String unit)        { this.unit = unit; }
    public int getStock()                   { return stock; }
    public void setStock(int stock)         { this.stock = stock; }
    public int getCategoryId()              { return categoryId; }
    public void setCategoryId(int cid)      { this.categoryId = cid; }
    public String getCategoryName()         { return categoryName; }
    public void setCategoryName(String cn)  { this.categoryName = cn; }
    public String getOriginState()          { return originState; }
    public void setOriginState(String os)   { this.originState = os; }
    public int getFreshnessScore()          { return freshnessScore; }
    public void setFreshnessScore(int fs)   { this.freshnessScore = fs; }
    public boolean isOrganic()              { return isOrganic; }
    public void setOrganic(boolean o)       { this.isOrganic = o; }
    public String getImageUrl()             { return imageUrl; }
    public void setImageUrl(String url)     { this.imageUrl = url; }
    public Timestamp getCreatedAt()         { return createdAt; }
    public void setCreatedAt(Timestamp t)   { this.createdAt = t; }
    public double getAvgRating()            { return avgRating; }
    public void setAvgRating(double r)      { this.avgRating = r; }

    @Override
    public String toString() {
        return "Product{id=" + id + ", name='" + name + "', price=" + price + "}";
    }
}
