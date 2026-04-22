# 📘 JDBC Concept Explanation — Anaaj E-Commerce Project

> **Project:** Anaaj — The Ecommerce  
> **Tech Stack:** Java Servlets + JDBC + MySQL 8 (Backend) · React + Vite (Frontend)  
> **File Location:** `backend/src/main/java/com/anaaj/`

---

## 🔷 What is JDBC?

**JDBC (Java Database Connectivity)** is Java's standard API for connecting to relational databases.  
It lives in the `java.sql` package and allows Java programs to:

- Connect to any RDBMS (MySQL, PostgreSQL, Oracle, etc.)
- Execute SQL queries (SELECT, INSERT, UPDATE, DELETE)
- Retrieve and process query results
- Manage database transactions

---

## 🔷 How JDBC is Used in This Project

### The 5 Core JDBC Objects We Use

| JDBC Object | Class/Interface | Our Usage in Anaaj |
|---|---|---|
| `DriverManager` | `java.sql.DriverManager` | Creates a DB connection using URL, username, password |
| `Connection` | `java.sql.Connection` | Represents an open connection to MySQL |
| `PreparedStatement` | `java.sql.PreparedStatement` | Executes parameterized SQL queries safely |
| `ResultSet` | `java.sql.ResultSet` | Holds the rows returned by a SELECT query |
| `SQLException` | `java.sql.SQLException` | Exception class for all DB errors |

---

## 🔷 Step 1 — Establishing the Connection

**File:** `backend/src/main/java/com/anaaj/util/DBConnection.java`

```java
public class DBConnection {

    // JDBC URL format: jdbc:mysql://host:port/database?options
    private static final String URL = "jdbc:mysql://localhost:3306/anaajdb"
        + "?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true";

    private static final String USER     = "root";
    private static final String PASSWORD = "root"; // your MySQL password

    // Load the MySQL JDBC Driver once when class is loaded
    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL Driver not found!", e);
        }
    }

    // Factory method — returns a new Connection object
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
```

**Key concepts demonstrated:**
- `Class.forName()` — tells JVM to load the MySQL JDBC Driver class into memory
- `DriverManager.getConnection()` — opens a TCP connection to the MySQL server
- The URL specifies: **driver type → host → port → database name → options**

---

## 🔷 Step 2 — PreparedStatement (Safe SQL Queries)

**Why PreparedStatement and NOT Statement?**

| `Statement` ❌ | `PreparedStatement` ✅ |
|---|---|
| Concatenates SQL strings | Uses `?` placeholders |
| Vulnerable to SQL Injection | Completely injection-safe |
| Query re-compiled every run | Query compiled once, run many times |
| Bad practice | Industry standard |

**Example from `UserDAO.java` — Login:**

```java
public User loginUser(String email, String plainPassword) throws SQLException {
    // ? is a parameter placeholder — never concatenate user input!
    String sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    try (Connection con = DBConnection.getConnection();
         PreparedStatement ps = con.prepareStatement(sql)) {

        // Bind parameters by position (1-indexed)
        ps.setString(1, email);                    // replaces first ?
        ps.setString(2, hashPassword(plainPassword)); // replaces second ?

        // Execute and get ResultSet
        try (ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return mapRow(rs);      // map to User object
        }
    }
    return null; // login failed
}
```

**PreparedStatement setter methods used in this project:**

| Method | SQL Type | Used For |
|---|---|---|
| `ps.setString(idx, val)` | VARCHAR / TEXT | Names, emails, status |
| `ps.setInt(idx, val)` | INT | IDs, stock, scores |
| `ps.setBigDecimal(idx, val)` | DECIMAL | Prices, amounts |
| `ps.setBoolean(idx, val)` | BOOLEAN | is_organic |
| `ps.setObject(idx, val)` | Any | Generic binding |

---

## 🔷 Step 3 — Executing Queries

### SELECT → `ps.executeQuery()` returns a `ResultSet`

```java
// From ProductDAO.java — get all products
public List<Product> getAllProducts() throws SQLException {
    String sql = "SELECT p.*, c.name AS category_name, "
               + "COALESCE(AVG(r.rating), 0) AS avg_rating "
               + "FROM products p "
               + "LEFT JOIN categories c ON p.category_id = c.id "
               + "LEFT JOIN reviews r ON r.product_id = p.id "
               + "GROUP BY p.id ORDER BY p.created_at DESC";

    try (Connection con = DBConnection.getConnection();
         PreparedStatement ps = con.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {   // <-- returns rows

        List<Product> list = new ArrayList<>();
        while (rs.next()) {                    // iterate each row
            list.add(mapRow(rs));              // convert row → POJO
        }
        return list;
    }
}
```

### INSERT → `ps.executeUpdate()` returns rows affected

```java
// From UserDAO.java — register new user
public int registerUser(User user) throws SQLException {
    String sql = "INSERT INTO users (name, email, password, phone, address, role) "
               + "VALUES (?,?,?,?,?,?)";

    try (Connection con = DBConnection.getConnection();
         PreparedStatement ps = con.prepareStatement(sql,
             Statement.RETURN_GENERATED_KEYS)) {  // <-- get auto-gen ID

        ps.setString(1, user.getName());
        ps.setString(2, user.getEmail());
        ps.setString(3, hashPassword(user.getPassword())); // hashed!
        ps.setString(4, user.getPhone());
        ps.setString(5, user.getAddress());
        ps.setString(6, "user");

        ps.executeUpdate(); // executes INSERT

        // Get the auto-generated primary key
        try (ResultSet keys = ps.getGeneratedKeys()) {
            return keys.next() ? keys.getInt(1) : -1;
        }
    }
}
```

---

## 🔷 Step 4 — Reading a ResultSet

**From `ProductDAO.java` — mapping a DB row to a Java object:**

```java
private Product mapRow(ResultSet rs) throws SQLException {
    Product p = new Product();
    p.setId(rs.getInt("id"));                        // column name
    p.setName(rs.getString("name"));
    p.setPrice(rs.getBigDecimal("price"));            // DECIMAL → BigDecimal
    p.setStock(rs.getInt("stock"));
    p.setOriginState(rs.getString("origin_state"));
    p.setFreshnessScore(rs.getInt("freshness_score"));
    p.setOrganic(rs.getBoolean("is_organic"));
    p.setCreatedAt(rs.getTimestamp("created_at"));    // TIMESTAMP → Timestamp
    p.setAvgRating(rs.getDouble("avg_rating"));       // computed column
    return p;
}
```

**ResultSet getter methods used:**

| rs Method | Java Type | MySQL Type |
|---|---|---|
| `rs.getInt("col")` | `int` | INT |
| `rs.getString("col")` | `String` | VARCHAR, TEXT |
| `rs.getBigDecimal("col")` | `BigDecimal` | DECIMAL |
| `rs.getDouble("col")` | `double` | DOUBLE, AVG() result |
| `rs.getBoolean("col")` | `boolean` | BOOLEAN / TINYINT(1) |
| `rs.getTimestamp("col")` | `Timestamp` | TIMESTAMP |

---

## 🔷 Step 5 — JDBC Transactions (ACID)

The most important JDBC concept: **atomic transactions** ensure data integrity.

**From `OrderDAO.java` — placing an order:**
When a user places an order, we must insert into BOTH `orders` and `order_items` tables.
If `order_items` insert fails, the `orders` row must also be rolled back.

```java
public int placeOrder(Order order) throws SQLException {
    String insertOrder = "INSERT INTO orders (user_id, total_amount, status, delivery_address) VALUES (?,?,?,?)";
    String insertItem  = "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)";

    try (Connection con = DBConnection.getConnection()) {

        con.setAutoCommit(false); // ← START TRANSACTION

        try {
            // Step 1: Insert the order header
            int orderId;
            try (PreparedStatement ps = con.prepareStatement(insertOrder,
                                            Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, order.getUserId());
                ps.setBigDecimal(2, order.getTotalAmount());
                ps.setString(3, "Confirmed");
                ps.setString(4, order.getDeliveryAddress());
                ps.executeUpdate();

                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (!rs.next()) { con.rollback(); return -1; } // ← ROLLBACK
                    orderId = rs.getInt(1);
                }
            }

            // Step 2: Insert all order line items (batch)
            try (PreparedStatement ps = con.prepareStatement(insertItem)) {
                for (OrderItem item : order.getItems()) {
                    ps.setInt(1, orderId);
                    ps.setInt(2, item.getProductId());
                    ps.setInt(3, item.getQuantity());
                    ps.setBigDecimal(4, item.getUnitPrice());
                    ps.addBatch(); // ← adds to batch — not executed yet
                }
                ps.executeBatch(); // ← execute all at once (efficient!)
            }

            con.commit(); // ← COMMIT — both inserts succeed together
            return orderId;

        } catch (SQLException e) {
            con.rollback(); // ← ROLLBACK — undo everything if anything fails
            throw e;
        } finally {
            con.setAutoCommit(true); // ← restore default
        }
    }
}
```

**ACID properties demonstrated:**
- **A**tomicity — either both `orders` + `order_items` commit, or neither does
- **C**onsistency — Foreign key `order_id` in `order_items` is always valid
- **I**solation — other transactions don't see partial state
- **D**urability — committed data survives crashes

---

## 🔷 Step 6 — Connection Management with try-with-resources

**Every DAO in this project uses `try-with-resources` to prevent connection leaks:**

```java
// This pattern guarantees Connection, Statement, ResultSet are ALWAYS closed
try (Connection con = DBConnection.getConnection();          // auto-closed
     PreparedStatement ps = con.prepareStatement(sql);       // auto-closed
     ResultSet rs = ps.executeQuery()) {                     // auto-closed

    // use connection here

} // ← all three are closed automatically here, even if exception occurs
```

**Without try-with-resources (bad — leaks connections):**
```java
// ❌ OLD WAY — don't do this
Connection con = null;
try {
    con = DBConnection.getConnection();
    // ...
} finally {
    if (con != null) con.close(); // easy to forget, messy code
}
```

---

## 🔷 Step 7 — SQL Injection Prevention

Our project uses `PreparedStatement` exclusively. Here's why it matters:

```java
// ❌ VULNERABLE (never do this):
String email = req.getParameter("email"); // user input: "' OR '1'='1"
String sql = "SELECT * FROM users WHERE email = '" + email + "'";
// Resulting SQL: SELECT * FROM users WHERE email = '' OR '1'='1'
// ← This returns ALL users! Hacker logs in as anyone.

// ✅ SAFE (our approach):
String sql = "SELECT * FROM users WHERE email = ?";
ps.setString(1, email);  // JDBC escapes the value safely
// Even if email = "' OR '1'='1", it's treated as a literal string
```

---

## 🔷 Step 8 — DAO Pattern (Data Access Object)

All DB interaction is isolated into DAO classes. Servlets never write SQL directly.

```
Servlet (Controller) ─── calls ──→ DAO (Data Layer) ─── calls ──→ MySQL via JDBC
        │                                  │
LoginServlet.java              UserDAO.java
ProductServlet.java            ProductDAO.java
CartServlet.java               (no separate DAO — cart is in session)
OrderServlet.java              OrderDAO.java
AdminServlet.java              ProductDAO + OrderDAO
```

**Benefits of this separation:**
1. Change DB (MySQL → PostgreSQL) → only change DAO, servlets untouched
2. Each DAO can be tested independently
3. Single Responsibility Principle — servlet handles HTTP, DAO handles SQL

---

## 🔷 Full Flow Diagram — "User Adds Product to Cart"

```
Browser (React)
     │
     │  POST /api/cart?action=add&productId=3&qty=2
     ▼
CartServlet.java  (Java Servlet — Controller)
     │
     │  productDAO.getProductById(3)
     ▼
ProductDAO.java  (DAO — Data Layer)
     │
     │  DBConnection.getConnection()  ← JDBC Connection
     │  PreparedStatement: SELECT * FROM products WHERE id = ?
     │  ps.setInt(1, 3)
     │  ResultSet rs = ps.executeQuery()
     │  rs.next() → map to Product object
     ▼
Product object returned to CartServlet
     │
     │  Add to HttpSession cart map
     ▼
JSON response: {"success": true, "count": 1}
     │
     ▼
React frontend updates cart badge count
```

---

## 🔷 Summary — JDBC Concepts Demonstrated in Anaaj

| JDBC Concept | Where Used | File |
|---|---|---|
| `Class.forName()` — Driver loading | Static block | `DBConnection.java` |
| `DriverManager.getConnection()` — Connection | Every DAO method | `DBConnection.java` |
| `PreparedStatement` — Safe queries | All SQL operations | All DAO files |
| `ps.executeQuery()` — SELECT | getAllProducts, getOrders, etc. | `ProductDAO`, `OrderDAO` |
| `ps.executeUpdate()` — INSERT/UPDATE/DELETE | registerUser, addProduct, etc. | `UserDAO`, `ProductDAO` |
| `ps.executeBatch()` — Batch insert | Order items | `OrderDAO.java` |
| `ResultSet` — Query results | All SELECT operations | All DAO files |
| `Statement.RETURN_GENERATED_KEYS` — Auto-increment | registerUser, placeOrder | `UserDAO`, `OrderDAO` |
| `setAutoCommit(false)` — Transactions | Order placement | `OrderDAO.java` |
| `con.commit()` — Commit transaction | Successful order | `OrderDAO.java` |
| `con.rollback()` — Rollback on error | Failed order | `OrderDAO.java` |
| `try-with-resources` — Resource management | Every DAO method | All DAO files |
| SHA-256 via `MessageDigest` | Password hashing | `UserDAO.java` |

---

## 🔷 Database Schema Used

```
users ←── orders ←── order_items ──→ products ──→ categories
                                          ↑
                                       reviews
                                          │
                                        users
```

**Foreign key relationships enforced via SQL constraints — JDBC respects them automatically.**

---

*Anaaj — The Ecommerce · B.Tech College Project 2025*  
*Backend: Java 17 + JDBC + MySQL | Frontend: React + Vite*
