-- ═══════════════════════════════════════════════════════════════════
--  ANAAJ — THE ECOMMERCE  ·  PostgreSQL Schema
-- ═══════════════════════════════════════════════════════════════════

-- ── USERS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  phone        VARCHAR(15),
  address      TEXT,
  role         VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── CATEGORIES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  description  TEXT
);

-- ── PRODUCTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  description      TEXT,
  price            DECIMAL(10,2) NOT NULL,
  unit             VARCHAR(20) DEFAULT 'kg',
  stock            INT DEFAULT 0,
  category_id      INT REFERENCES categories(id) ON DELETE SET NULL,
  origin_state     VARCHAR(50),
  freshness_score  INT DEFAULT 100,
  is_organic       BOOLEAN DEFAULT FALSE,
  image_url        VARCHAR(255),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── ORDERS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id),
  total_amount     DECIMAL(10,2) NOT NULL,
  status           VARCHAR(20) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed','Packed','Shipped','Delivered')),
  delivery_address TEXT NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── ORDER ITEMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id),
  quantity    INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL
);

-- ── REVIEWS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, product_id)
);

-- ── CART ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT DEFAULT 1
);

-- ═══════════════════════════════════════════════════════════════════
--  SEED DATA (only if tables are empty)
-- ═══════════════════════════════════════════════════════════════════

-- Categories
INSERT INTO categories (id, name, description) VALUES
  (1, 'Rice',          'All varieties of rice — basmati, sona masuri, brown, red'),
  (2, 'Dals & Lentils','Toor dal, chana dal, masoor dal, moong dal, urad dal'),
  (3, 'Millets',       'Ragi, jowar, bajra, foxtail millet, little millet'),
  (4, 'Wheat & Flour', 'Whole wheat, sooji, chickpea flour (besan), rice flour'),
  (5, 'Oils',          'Cold-pressed groundnut, sesame, coconut, mustard oils'),
  (6, 'Spices',        'Whole and ground spices sourced from Indian farms')
ON CONFLICT (id) DO NOTHING;

-- Admin users
INSERT INTO users (id, name, email, password, phone, address, role) VALUES
  (1, 'Admin', 'admin@anaaj.com',
   '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
   '9999999999', '123 Admin HQ, New Delhi — 110001', 'admin'),
  (2, 'Allan (Master)', 'allanmaazimdad@gmail.com',
   '4daaf5e02ed47721505ae76e4fac928a550644e05dfc6d14b9edfaf57d517056',
   '9999999999', 'Anaaj Headquarters', 'admin'),
  (3, 'Allan (Dev)', 'allsnmaazimdad@gmail.com',
   '4daaf5e02ed47721505ae76e4fac928a550644e05dfc6d14b9edfaf57d517056',
   '9999999999', 'Anaaj Development', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Products
INSERT INTO products (id, name, description, price, unit, stock, category_id, origin_state, freshness_score, is_organic, image_url) VALUES
  (1,  'Premium Basmati Rice',    'Long-grain aromatic rice from the Himalayan foothills. Aged 2 years for peak aroma.',           98.00, 'kg',  500, 1, 'Punjab',       98, FALSE, 'basmati_rice_premium_1776935561058.png'),
  (2,  'Sona Masuri Rice',        'Lightweight and aromatic medium-grain rice.',         62.00, 'kg',  350, 1, 'Andhra Pradesh',92, FALSE, 'sona_masuri_rice_premium_1776935810610.png'),
  (3,  'Organic Black Rice',      'Nutrient-dense Forbidden Rice. Rich in anthocyanins.',                         145.00,'kg',  120, 1, 'Manipur',      96, TRUE,  NULL),
  (4,  'Toor Dal (Premium)',      'Unpolished Pigeon Peas. High protein content.',                    115.00,'kg',  300, 2, 'Maharashtra',  94, FALSE, 'toor_dal_unpolished_1776935827005.png'),
  (5,  'Moong Dal (Yellow)',      'Easily digestible split yellow lentils.',                               105.00,'kg',  250, 2, 'Rajasthan',    95, TRUE,  'moong_dal_yellow_1776935621533.png'),
  (6,  'Urad Dal (Split)',        'Essential for creamy dals and batters.',                           120.00,'kg',  200, 2, 'Madhya Pradesh',88, FALSE, 'urad_dal_split_premium_1776935928107.png'),
  (7,  'Ragi (Finger Millet)',    'Calcium-rich supergrain.',                                           68.00, 'kg',  180, 3, 'Karnataka',    97, TRUE,  'ragi.png'),
  (8,  'Kodo Millet',             'Ancient gluten-free grain.',                                85.00, 'kg',  150, 3, 'Tamil Nadu',   94, TRUE,  'kodo_millet_premium_1776935944109.png'),
  (9,  'Whole Wheat (Sharbati)',  'Premium Sharbati wheat from Sehore.',                               44.00, 'kg',  600, 4, 'Madhya Pradesh',91, FALSE, 'sharbati_wheat_grains_1776935847537.png'),
  (10, 'Cold-Pressed Mustard Oil','Traditionally extracted using wooden Ghani.',                                195.00,'litre',150, 5, 'Haryana',      89, TRUE,  'mustard_oil_pure_1776935701451.png'),
  (11, 'Red Rajma (Kashmiri)',    'Small dark red kidney beans from Kashmir.',                    160.00,'kg',  100, 2, 'J&K',          93, TRUE,  'red_rajma_premium_1776935963522.png'),
  (12, 'Kabuli Chana (Large)',    'Extra-large chickpeas from the Malwa region.',                 130.00,'kg',  280, 2, 'Madhya Pradesh',90, FALSE, 'kabuli_chana_raw_1776935683751.png'),
  (13, 'Black Pepper (Wayanad)',  'Bold high-piperine pepper from Wayanad.',                    750.00,'kg',   50, 6, 'Kerala',       99, TRUE,  'black_pepper_whole_1776935641046.png'),
  (14, 'Turmeric (Lakadong)',     'World-renowned turmeric with 7-12% curcumin.',                                          350.00,'kg',   80, 6, 'Meghalaya',    98, TRUE,  'turmeric_powder_premium_1776935863438.png'),
  (15, 'Saffron (Kashmiri)',      'Authentic Grade A++ Lacha Saffron from Pampore.',                               450.00,'gm',   20, 6, 'Jammu & Kashmir',99, TRUE,  'kashmiri_saffron_premium_1776935907730.png'),
  (16, 'Desi Ghee (A2)',          'Traditional Bilona method A2 cow ghee.',                                 950.00,'lt',  100, 5, 'Gujarat',       94, TRUE,  'desi_ghee_a2_1776935576015.png'),
  (17, 'Green Cardamom (Bold)',   'Extra bold 8mm cardamom from Idukki.',                                           2200.00,'kg',  40, 6, 'Kerala',        97, TRUE,  'green_cardamom_pods_1776935774130.png'),
  (18, 'Brown Chickpeas',         'Kala Chana from Karnataka.',                                         75.00, 'kg',  300, 2, 'Karnataka',    88, FALSE, NULL),
  (19, 'Cold-Pressed Coconut Oil','Extracted from sun-dried Kerala copra.',                                     280.00,'lt',  180, 5, 'Kerala',       91, TRUE,  NULL),
  (20, 'Guntur Red Chilli',       'Vibrant S4 variety from Guntur.',                                                   240.00,'kg',  200, 6, 'Andhra Pradesh',92, FALSE, 'red_chilli.png'),
  (21, 'Bajra (Pearl Millet)',    'Drought-resistant nutritious millet.',                                                          55.00, 'kg',  220, 3, 'Rajasthan',    89, FALSE, 'bajra_millet_whole_1776935737323.png'),
  (22, 'Jowar (Sorghum)',         'Gluten-free sorghum millet.',                                                 60.00, 'kg',  190, 3, 'Maharashtra',  88, TRUE,  'jowar_millet_whole_1776935755675.png'),
  (23, 'Little Millet',           'High fiber ancient grain.',                                                     70.00, 'kg',  110, 3, 'Tamil Nadu',   94, TRUE,  NULL),
  (24, 'Chana Dal',               'Polished split Bengal gram.',                                                   85.00, 'kg',  320, 2, 'Karnataka',    87, FALSE, NULL),
  (25, 'Masoor Dal (Red)',        'Quick-cooking red lentils.',                                                    80.00, 'kg',  280, 2, 'Bihar',        91, FALSE, NULL),
  (26, 'Cloves (Whole)',          'Intense aroma dried flower buds.',                                                              950.00,'kg',   60, 6, 'Kerala',       96, TRUE,  NULL),
  (27, 'Cinnamon Sticks',         'True Ceylon cinnamon.',                                                          1200.00,'kg',  45, 6, 'Kerala',       98, TRUE,  NULL),
  (28, 'Brown Mustard Seeds',     'Essential tempering spice.',                                                    110.00,'kg',  150, 6, 'Rajasthan',    89, FALSE, NULL),
  (29, 'Cold-Pressed Sesam Oil',  'Pressed from white sesame seeds.',                                              240.00,'lt',   80, 5, 'Tamil Nadu',   92, TRUE,  NULL),
  (30, 'Foxnuts (Makhana)',       'Puffed lotus seeds.',                                                           850.00,'kg',   70, 4, 'Bihar',        98, TRUE,  NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
