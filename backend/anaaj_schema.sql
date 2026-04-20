-- ═══════════════════════════════════════════════════════════════════
--  ANAAJ — THE ECOMMERCE  ·  MySQL 8+ Database Schema
--  Run this script on your MySQL server before starting Tomcat.
--  Command: mysql -u root -p < anaaj_schema.sql
-- ═══════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS anaajdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE anaajdb;

-- ── USERS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(100)          NOT NULL,
  email        VARCHAR(150)          UNIQUE NOT NULL,
  password     VARCHAR(255)          NOT NULL,   -- SHA-256 hex hash
  phone        VARCHAR(15),
  address      TEXT,
  role         ENUM('user','admin')  DEFAULT 'user',
  created_at   TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

-- ── CATEGORIES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL,
  description  TEXT
);

-- ── PRODUCTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  name             VARCHAR(150)   NOT NULL,
  description      TEXT,
  price            DECIMAL(10,2)  NOT NULL,
  unit             VARCHAR(20)    DEFAULT 'kg',
  stock            INT            DEFAULT 0,
  category_id      INT,
  origin_state     VARCHAR(50),
  freshness_score  INT            DEFAULT 100,
  is_organic       BOOLEAN        DEFAULT FALSE,
  image_url        VARCHAR(255),
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ── ORDERS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  user_id          INT            NOT NULL,
  total_amount     DECIMAL(10,2)  NOT NULL,
  status           ENUM('Confirmed','Packed','Shipped','Delivered') DEFAULT 'Confirmed',
  delivery_address TEXT           NOT NULL,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── ORDER ITEMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  order_id    INT            NOT NULL,
  product_id  INT            NOT NULL,
  quantity    INT            NOT NULL,
  unit_price  DECIMAL(10,2)  NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ── REVIEWS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT  NOT NULL,
  product_id  INT  NOT NULL,
  rating      INT  CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, product_id),             -- one review per user per product
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ── CART (optional persistent cart) ────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT  NOT NULL,
  product_id  INT  NOT NULL,
  quantity    INT  DEFAULT 1,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════════════════

-- Categories
INSERT IGNORE INTO categories (id, name, description) VALUES
  (1, 'Rice',          'All varieties of rice — basmati, sona masuri, brown, red'),
  (2, 'Dals & Lentils','Toor dal, chana dal, masoor dal, moong dal, urad dal'),
  (3, 'Millets',       'Ragi, jowar, bajra, foxtail millet, little millet'),
  (4, 'Wheat & Flour', 'Whole wheat, sooji, chickpea flour (besan), rice flour'),
  (5, 'Oils',          'Cold-pressed groundnut, sesame, coconut, mustard oils'),
  (6, 'Spices',        'Whole and ground spices sourced from Indian farms');

-- Admin user — password: admin123 (SHA-256 hashed)
-- To use a different password, compute: echo -n "yourpassword" | sha256sum
INSERT IGNORE INTO users (id, name, email, password, phone, address, role) VALUES
  (1, 'Admin', 'admin@anaaj.com',
   '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a',
   '9999999999', '123 Admin HQ, New Delhi — 110001', 'admin');

-- Sample products
INSERT IGNORE INTO products (id, name, description, price, unit, stock, category_id, origin_state, freshness_score, is_organic, image_url) VALUES
  (1,  'Premium Basmati Rice',    'Long-grain aromatic rice from the Himalayan foothills of Punjab. Aged 2 years for superior aroma.',  90.00, 'kg',  500, 1, 'Punjab',       95, FALSE, NULL),
  (2,  'Sona Masuri Rice',        'Light, medium-grain rice ideal for everyday cooking. Sourced directly from Andhra Pradesh farms.',    55.00, 'kg',  350, 1, 'Andhra Pradesh',88, FALSE, NULL),
  (3,  'Organic Brown Rice',      'Unpolished whole-grain brown rice. Rich in fiber and nutrnients from Uttarakhand mountain terraces.',  75.00, 'kg',  200, 1, 'Uttarakhand',  92, TRUE,  NULL),
  (4,  'Kolam Rice',              'Fine-textured short-grain rice from Maharashtra. Ideal for khichdi and soft preparations.',            48.00, 'kg',  400, 1, 'Maharashtra',  85, FALSE, NULL),
  (5,  'Toor Dal (Arhar)',        'Split pigeon peas — the most widely used dal in Indian households. Zero artificial polish.',           110.00,'kg',  300, 2, 'Madhya Pradesh',90, FALSE, NULL),
  (6,  'Moong Dal (Yellow)',      'Split green gram lentils. Light, easy to digest — perfect for dal tadka and khichdi.',                 95.00, 'kg',  250, 2, 'Rajasthan',    93, TRUE,  NULL),
  (7,  'Chana Dal',               'Split Bengal gram — the base of dals, ladoos and besan. High protein content.',                        85.00, 'kg',  320, 2, 'Karnataka',    87, FALSE, NULL),
  (8,  'Masoor Dal (Red Lentils)','Spit red lentils that cook quickly. High in iron and protein. From Bihar farms.',                      80.00, 'kg',  280, 2, 'Bihar',        91, FALSE, NULL),
  (9,  'Ragi (Finger Millet)',    'Calcium-rich ancient grain from Karnataka. Excellent for ragi mudde, dosa batter and porridge.',       65.00, 'kg',  180, 3, 'Karnataka',    96, TRUE,  NULL),
  (10, 'Bajra (Pearl Millet)',    'Drought-resistant millet from Rajasthan. High iron content. Used in rotis and porridge.',              55.00, 'kg',  220, 3, 'Rajasthan',    89, FALSE, NULL),
  (11, 'Jowar (Sorghum)',         'Gluten-free sorghum millet from Maharashtra. Light on stomach, heavy on nutrition.',                   60.00, 'kg',  190, 3, 'Maharashtra',  88, TRUE,  NULL),
  (12, 'Foxtail Millet (Kangni)', 'Ancient millet variety from Andhra Pradesh. High fiber and good for diabetics.',                       70.00, 'kg',  110, 3, 'Andhra Pradesh',94, TRUE,  NULL),
  (13, 'Whole Wheat (Gehu)',      'Hard red winter wheat from Punjab. Ground fresh for atta — best chapatis guaranteed.',                 40.00, 'kg',  600, 4, 'Punjab',       90, FALSE, NULL),
  (14, 'Organic Wheat Flour',     'Stone-ground whole wheat atta from Organic farms in Haryana. No bleaching, no additives.',             55.00, 'kg',  300, 4, 'Haryana',      92, TRUE,  NULL),
  (15, 'Cold-Pressed Groundnut Oil','Traditionally expeller-pressed groundnut oil from Gujarat. Natural peanut flavour intact.',         180.00,'litre',150, 5, 'Gujarat',      88, TRUE,  NULL);

-- ── Done ────────────────────────────────────────────────────────────
-- After running this script, update DBConnection.java with your MySQL
-- root password and deploy the WAR to Tomcat.
