-- ═══════════════════════════════════════════════════════════════════
--  ANAAJ — THE ECOMMERCE  ·  H2 Database Schema (MySQL Compatible)
-- ═══════════════════════════════════════════════════════════════════

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
--  SEED DATA (Using standard INSERT to avoid H2 syntax issues with IGNORE)
-- ═══════════════════════════════════════════════════════════════════
SET REFERENTIAL_INTEGRITY FALSE;
TRUNCATE TABLE order_items;
TRUNCATE TABLE reviews;
TRUNCATE TABLE cart;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET REFERENTIAL_INTEGRITY TRUE;

INSERT INTO categories (id, name, description) VALUES
  (1, 'Rice',          'All varieties of rice — basmati, sona masuri, brown, red'),
  (2, 'Dals & Lentils','Toor dal, chana dal, masoor dal, moong dal, urad dal'),
  (3, 'Millets',       'Ragi, jowar, bajra, foxtail millet, little millet'),
  (4, 'Wheat & Flour', 'Whole wheat, sooji, chickpea flour (besan), rice flour'),
  (5, 'Oils',          'Cold-pressed groundnut, sesame, coconut, mustard oils'),
  (6, 'Spices',        'Whole and ground spices sourced from Indian farms');

INSERT INTO users (id, name, email, password, phone, address, role) VALUES
  (1, 'Admin', 'admin@anaaj.com',
   '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
   '9999999999', '123 Admin HQ, New Delhi — 110001', 'admin'),
  (2, 'Allan (Master)', 'allanmaazimdad@gmail.com',
   '4daaf5e02ed47721505ae76e4fac928a550644e05dfc6d14b9edfaf57d517056',
   '9999999999', 'Anaaj Headquarters', 'admin'),
  (3, 'Allan (Dev)', 'allsnmaazimdad@gmail.com',
   '4daaf5e02ed47721505ae76e4fac928a550644e05dfc6d14b9edfaf57d517056',
   '9999999999', 'Anaaj Development', 'admin');

INSERT INTO products (id, name, description, price, unit, stock, category_id, origin_state, freshness_score, is_organic, image_url) VALUES
  (1,  'Premium Basmati Rice',    'Long-grain aromatic rice from the Himalayan foothills. Aged 2 years for peak aroma.',           98.00, 'kg',  500, 1, 'Punjab',       98, FALSE, 'basmati.png'),
  (2,  'Sona Masuri Rice',        'Lightweight and aromatic medium-grain rice. Sourced from the Tungabhadra river belt.',         62.00, 'kg',  350, 1, 'Andhra Pradesh',92, FALSE, 'sona_masuri.png'),
  (3,  'Organic Black Rice',      'Nutrient-dense Forbidden Rice. Rich in anthocyanins and antioxidants.',                         145.00,'kg',  120, 1, 'Manipur',      96, TRUE,  'https://images.unsplash.com/photo-1607532210035-2606883902bc?auto=format&fit=crop&q=80&w=800'),
  (4,  'Toor Dal (Premium)',      'Unpolished Pigeon Peas. High protein content with no artificial colouring.',                    115.00,'kg',  300, 2, 'Maharashtra',  94, FALSE, 'toor_dal.png'),
  (5,  'Moong Dal (Yellow)',      'Easily digestible split yellow lentils. Pesticide-free farming.',                               105.00,'kg',  250, 2, 'Rajasthan',    95, TRUE,  'moong_dal.png'),
  (6,  'Urad Dal (Split)',        'Essential for creamy dals and batters. Sourced from Madhya Pradesh.',                           120.00,'kg',  200, 2, 'Madhya Pradesh',88, FALSE, 'https://images.unsplash.com/photo-1626082927342-d615369651ba?auto=format&fit=crop&q=80&w=800'),
  (7,  'Ragi (Finger Millet)',    'Calcium-rich supergrain. Essential for bone health.',                                           68.00, 'kg',  180, 3, 'Karnataka',    97, TRUE,  'ragi.png'),
  (8,  'Kodo Millet',             'Ancient gluten-free grain. High in dietary fiber and minerals.',                                85.00, 'kg',  150, 3, 'Tamil Nadu',   94, TRUE,  'https://images.unsplash.com/photo-1626074351052-5cd638fc03a7?auto=format&fit=crop&q=80&w=800'),
  (9,  'Whole Wheat (Sharbati)',  'Premium Sharbati wheat from Sehore. Makes the softest chapatis.',                               44.00, 'kg',  600, 4, 'Madhya Pradesh',91, FALSE, 'wheat.png'),
  (10, 'Cold-Pressed Mustard Oil','Traditionally extracted using wooden Ghani. Pure and pungent.',                                195.00,'litre',150, 5, 'Haryana',      89, TRUE,  'mustard_oil.png'),
  (11, 'Red Rajma (Kashmiri)',    'Small, dark red kidney beans from the high altitudes of Jammu & Kashmir.',                    160.00,'kg',  100, 2, 'J&K',          93, TRUE,  'https://images.unsplash.com/photo-1512058560374-180bf9cf2c5d?auto=format&fit=crop&q=80&w=800'),
  (12, 'Kabuli Chana (Large)',    'Extra-large chickpeas for the perfect Chole. Sourced from the Malwa region.',                 130.00,'kg',  280, 2, 'Madhya Pradesh',90, FALSE, 'chana.png'),
  (13, 'Black Pepper (Wayanad)',  'King of Spices. Bold, high-piperine pepper from the Wayanad hill tracts.',                    750.00,'kg',   50, 6, 'Kerala',       99, TRUE,  'black_pepper.png'),
  (14, 'Turmeric (Lakadong)',     'World-renowned turmeric with 7-12% curcumin content.',                                          350.00,'kg',   80, 6, 'Meghalaya',    98, TRUE,  'turmeric.png'),
  (15, 'Saffron (Kashmiri)',      'Authentic Grade A++ Lacha Saffron from Pampore. Hand-harvested.',                               450.00,'gm',   20, 6, 'Jammu & Kashmir',99, TRUE,  'saffron.png'),
  (16, 'Desi Ghee (A2)',          'Traditional Bilona method A2 cow ghee. Sourced from Gir cows.',                                 950.00,'lt',  100, 5, 'Gujarat',       94, TRUE,  'ghee.png'),
  (17, 'Green Cardamom (Bold)',   'Extra bold 8mm cardamom from Idukki. Intense aroma.',                                           2200.00,'kg',  40, 6, 'Kerala',        97, TRUE,  'cardamom.png'),
  (18, 'Brown Chickpeas',         'Kala Chana sourced from the dry regions of Karnataka.',                                         75.00, 'kg',  300, 2, 'Karnataka',    88, FALSE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800'),
  (19, 'Cold-Pressed Coconut Oil','Extracted from sun-dried Kerala copra. Pure and aromatic.',                                     280.00,'lt',  180, 5, 'Kerala',       91, TRUE,  'https://images.unsplash.com/photo-1612141527780-60724330685c?auto=format&fit=crop&q=80&w=800'),
  (20, 'Guntur Red Chilli',       'Vibrant and pungent S4 variety from Guntur.',                                                   240.00,'kg',  200, 6, 'Andhra Pradesh',92, FALSE, 'red_chilli.png'),
  (21, 'Bajra (Pearl Millet)',    'Drought-resistant nutritious millet.',                                                          55.00, 'kg',  220, 3, 'Rajasthan',    89, FALSE, 'bajra.png'),
  (22, 'Jowar (Sorghum)',         'Gluten-free sorghum millet. Light on stomach.',                                                 60.00, 'kg',  190, 3, 'Maharashtra',  88, TRUE,  'jowar.png'),
  (23, 'Little Millet',           'High fiber ancient grain.',                                                                     70.00, 'kg',  110, 3, 'Tamil Nadu',   94, TRUE,  NULL),
  (24, 'Chana Dal',               'Polished split Bengal gram.',                                                                   85.00, 'kg',  320, 2, 'Karnataka',    87, FALSE, NULL),
  (25, 'Masoor Dal (Red)',        'Quick-cooking red lentils.',                                                                    80.00, 'kg',  280, 2, 'Bihar',        91, FALSE, NULL),
  (26, 'Cloves (Whole)',          'Intense aroma dried flower buds.',                                                              950.00,'kg',   60, 6, 'Kerala',       96, TRUE,  NULL),
  (27, 'Cinnamon Sticks',         'True Ceylon cinnamon from Sri Lanka.',                                                          1200.00,'kg',  45, 6, 'Kerala',       98, TRUE,  NULL),
  (28, 'Brown Mustard Seeds',     'Essential tempering spice.',                                                                    110.00,'kg',  150, 6, 'Rajasthan',    89, FALSE, NULL),
  (29, 'Cold-Pressed Sesam Oil',  'Pressed from white sesame seeds.',                                                              240.00,'lt',   80, 5, 'Tamil Nadu',   92, TRUE,  NULL),
  (30, 'Kabuli Chana (Small)',    'Smaller variety chickpeas.',                                                                    110.00,'kg',  240, 2, 'Gujarat',      85, FALSE, NULL),
  (31, 'Matar (Dried Peas)',      'Dried green peas.',                                                                             75.00, 'kg',  200, 2, 'UP',           84, FALSE, NULL),
  (32, 'Moth Beans',              'Staple bean from Rajasthan.',                                                                   95.00, 'kg',  180, 2, 'Rajasthan',    90, TRUE,  NULL),
  (33, 'Broken Basmati Rice',     'Economical aromatic rice.',                                                                     65.00, 'kg',  400, 1, 'Punjab',       88, FALSE, NULL),
  (34, 'Indrayani Rice',          'Sticky aromatic rice from Maharashtra.',                                                        70.00, 'kg',  220, 1, 'Maharashtra',  91, FALSE, NULL),
  (35, 'Barnyard Millet',         'Sanwa millet for fasting.',                                                                     90.00, 'kg',  130, 3, 'Uttarakhand',  95, TRUE,  NULL),
  (36, 'Foxnuts (Makhana)',       'Puffed lotus seeds.',                                                                           850.00,'kg',   70, 4, 'Bihar',        98, TRUE,  NULL),
  (37, 'Peanuts (Raw)',           'High protein nuts.',                                                                            120.00,'kg',  500, 5, 'Gujarat',      89, FALSE, NULL),
  (38, 'Whole Moong Beans',       'Green gram whole.',                                                                             115.00,'kg',  250, 2, 'Rajasthan',    93, TRUE,  NULL),
  (39, 'Star Anise',              'Exotic spice for biryani.',                                                                     1400.00,'kg',  30, 6, 'Arunachal',    97, TRUE,  NULL),
  (40, 'Bay Leaves (Tejpatta)',   'Aromatic dried leaves.',                                                                        180.00,'kg',  100, 6, 'Assam',        94, TRUE,  NULL);
