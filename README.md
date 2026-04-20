# 🌾 Anaaj — The Ecommerce

> **College Project · B.Tech · 2025**  
> Full-stack e-commerce web application for grain-based food products — Rice, Dals, Millets, Organic Staples.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17 + Jakarta Servlets |
| Database Access | JDBC (`java.sql.*`) — PreparedStatement only |
| Database | MySQL 8+ |
| Frontend | HTML5 / CSS3 (Glassmorphism) / Vanilla JS |
| Server | Apache Tomcat 10 |
| Build | Maven |

---

## 🚀 Setup & Run

### 1. Database Setup
```bash
# Start MySQL and run the schema script
mysql -u root -p < anaaj_schema.sql
```

### 2. Configure DB Password
Edit `src/main/java/com/anaaj/util/DBConnection.java`:
```java
private static final String PASSWORD = "your_mysql_password";
```

### 3. Build with Maven
```bash
mvn clean package
```

### 4. Deploy to Tomcat 10
Copy the generated `target/AnaajApp.war` to Tomcat's `webapps/` directory:
```bash
cp target/AnaajApp.war /path/to/tomcat10/webapps/
```

### 5. Access the app
```
http://localhost:8080/AnaajApp/pages/index.html
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@anaaj.com | admin123 |
| User | Register new account | — |

---

## 📂 Project Structure

```
AnaajApp/
├── src/main/java/com/anaaj/
│   ├── model/          User, Product, Order, OrderItem, CartItem, Review
│   ├── dao/            UserDAO, ProductDAO, OrderDAO, ReviewDAO
│   ├── servlet/        Login, Register, Product, Cart, Order, Profile, Admin
│   └── util/           DBConnection
├── src/main/webapp/
│   ├── WEB-INF/web.xml
│   ├── css/style.css      ← Glassmorphism design system
│   ├── js/main.js         ← Cart badge, toast, bulk calculator
│   ├── images/            ← Product images (add manually)
│   └── pages/
│       ├── index.html      ← Home: hero + featured + bulk calculator
│       ├── shop.html       ← All products: search + filter + sort
│       ├── product-detail.html ← Single product + reviews + add-to-cart
│       ├── cart.html       ← Cart: qty controls + summary
│       ├── checkout.html   ← Delivery address + order placement
│       ├── order-success.html  ← Confirmation + timeline
│       ├── profile.html    ← User profile + order history
│       ├── login.html      ← Login form
│       ├── register.html   ← Registration form
│       └── admin/
│           ├── products.html ← CRUD product management
│           └── orders.html  ← Order list + inline status update
├── anaaj_schema.sql        ← Run this first!
└── pom.xml
```

---

## ✨ Features

| Feature | Status |
|---|---|
| User Registration + Login (SHA-256) | ✅ |
| Session-based authentication | ✅ |
| Role-based access (user/admin) | ✅ |
| Product listing, search (LIKE), category filter | ✅ |
| Regional origin filter (by Indian state) | ✅ |
| Freshness score progress bar | ✅ |
| Shopping cart (session-based) | ✅ |
| Checkout + order placement (ACID transaction) | ✅ |
| Order status timeline (4-step) | ✅ |
| Product reviews + star ratings | ✅ |
| Bulk order calculator (5–100 kg, 4 discount tiers) | ✅ |
| Admin panel: product CRUD | ✅ |
| Admin panel: order status management | ✅ |
| Admin stats: total orders + revenue | ✅ |
| Glassmorphism responsive UI | ✅ |

---

## 🔒 Security

- All SQL via `PreparedStatement` — zero concatenation (SQL injection proof)
- Passwords stored as SHA-256 hashes — never plain text
- Session invalidated on logout via `session.invalidate()`
- Admin routes check `role == "admin"` on every request

---

## 📦 Bulk Discount Tiers

| Quantity | Discount |
|---|---|
| 10+ kg | 5% off |
| 25+ kg | 10% off |
| 50+ kg | 15% off |
| 80+ kg | 20% off |

---

*Anaaj — The Ecommerce · College Project 2025*
