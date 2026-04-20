package com.anaaj.model;

import java.sql.Timestamp;

/** Represents a user review and star rating for a product. */
public class Review {
    private int id;
    private int userId;
    private String userName;    // joined field
    private int productId;
    private int rating;         // 1–5
    private String comment;
    private Timestamp createdAt;

    public Review() {}

    // ── Getters & Setters ─────────────────────────────────────
    public int getId()               { return id; }
    public void setId(int id)       { this.id = id; }
    public int getUserId()          { return userId; }
    public void setUserId(int uid)  { this.userId = uid; }
    public String getUserName()     { return userName; }
    public void setUserName(String n){ this.userName = n; }
    public int getProductId()       { return productId; }
    public void setProductId(int pid){ this.productId = pid; }
    public int getRating()          { return rating; }
    public void setRating(int r)    { this.rating = r; }
    public String getComment()      { return comment; }
    public void setComment(String c){ this.comment = c; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp t){ this.createdAt = t; }
}
