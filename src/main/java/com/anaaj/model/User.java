package com.anaaj.model;

import java.sql.Timestamp;

/** Represents a registered user of the Anaaj platform. */
public class User {
    private int id;
    private String name;
    private String email;
    private String password; // stored as SHA-256 hash
    private String phone;
    private String address;
    private String role;     // "user" | "admin"
    private Timestamp createdAt;

    public User() {}

    public User(String name, String email, String password, String phone, String address, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
        this.role = role;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public int getId()                    { return id; }
    public void setId(int id)            { this.id = id; }
    public String getName()              { return name; }
    public void setName(String name)     { this.name = name; }
    public String getEmail()             { return email; }
    public void setEmail(String email)   { this.email = email; }
    public String getPassword()          { return password; }
    public void setPassword(String p)    { this.password = p; }
    public String getPhone()             { return phone; }
    public void setPhone(String phone)   { this.phone = phone; }
    public String getAddress()           { return address; }
    public void setAddress(String a)     { this.address = a; }
    public String getRole()              { return role; }
    public void setRole(String role)     { this.role = role; }
    public Timestamp getCreatedAt()      { return createdAt; }
    public void setCreatedAt(Timestamp t){ this.createdAt = t; }

    @Override
    public String toString() {
        return "User{id=" + id + ", name='" + name + "', email='" + email + "', role='" + role + "'}";
    }
}
