# 🌾 Anaaj — Premium E-Commerce Platform

A high-end, full-stack e-commerce solution for premium grains, pulses, and organic staples. Built with a robust **Java/Jakarta** backend and a modern **React/Vite** frontend.

---

## ⚡ Quick Start (Development)

### 1. Backend (Java Servlet + H2 Database)
- **Database:** In-memory H2 (initializes automatically from `anaaj_schema_h2.sql`)
- **Server:** Apache Tomcat 10
- **Action:** Run `mvn clean package` and deploy to Tomcat.

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite-powered)
- **Styling:** Custom Vanilla CSS with a **Pitch Black Glassmorphism** design system.
- **Icons:** Lucide React & Custom SVG iconography.
- **State Management:** React Hooks (useState, useEffect, useContext).
- **Navigation:** React Router DOM v6.

### Backend
- **Language:** Java 17
- **Architecture:** Jakarta Servlets (Layered DAO Pattern).
- **Build Tool:** Maven 3.9
- **Security:** SHA-256 password hashing & Role-based Access Control (RBAC).
- **Server:** Apache Tomcat 10.

### Database
- **Engine:** H2 Embedded Database (In-memory).
- **Communication:** JDBC (Java Database Connectivity) with `PreparedStatement` for SQL injection protection.

---

## 📂 Navigation Guide

- `src/main/java/` — Core backend logic (DAO, Model, Servlet).
- `src/main/resources/` — Database schema & seed data.
- `frontend/src/` — React application logic.
- `frontend/public/images/` — Custom-generated premium product assets.
- `docs/` — Technical explanations & project documentation.

---

## 🔐 Credentials
- **Admin:** `admin@anaaj.com` / `admin123`
- **User:** Register via the UI.

---

## 🔒 Security

- All SQL via `PreparedStatement` — zero concatenation (SQL injection proof)
- Passwords stored as SHA-256 hashes — never plain text
- Session invalidated on logout via `session.invalidate()`
- Admin routes check `role == "admin"` on every request

---
*Developed for Java Mini Project · 2026*
