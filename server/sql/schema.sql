-- GroCart PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  id                     TEXT PRIMARY KEY,
  name                   TEXT NOT NULL DEFAULT '',
  email                  TEXT NOT NULL UNIQUE,          -- always saved in lowercase
  password_hash          TEXT NOT NULL,                 -- bcrypt hash
  role                   TEXT NOT NULL DEFAULT 'customer'
                         CHECK (role IN ('admin','retailer','customer')),
  store_name             TEXT NOT NULL DEFAULT '',
  phone_number           TEXT NOT NULL DEFAULT '',
  address                TEXT NOT NULL DEFAULT '',
  avatar_style           TEXT NOT NULL DEFAULT '',
  avatar_seed            TEXT NOT NULL DEFAULT '',
  avatar_url             TEXT NOT NULL DEFAULT '',      -- can hold a base64 image, so TEXT
  email_verified         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at             BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,                     -- SHA-256 of the token, never the token itself
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL DEFAULT '',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS products (
  id                   TEXT PRIMARY KEY,
  retailer_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  retailer_store_name  TEXT NOT NULL DEFAULT '',
  title                TEXT NOT NULL,
  description          TEXT NOT NULL DEFAULT '',
  category_id          TEXT NOT NULL DEFAULT '',        -- plain text on purpose (old data may not match a category)
  category_name        TEXT NOT NULL DEFAULT '',
  cost_price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  selling_price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity       INTEGER NOT NULL DEFAULT 0,
  unit                 TEXT NOT NULL DEFAULT 'pcs',
  unit_size            NUMERIC(10,2),
  item_quantity        TEXT NOT NULL DEFAULT '',
  image_url            TEXT NOT NULL DEFAULT '',
  status               TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','out_of_stock','inactive')),
  created_at           BIGINT NOT NULL,
  updated_at           BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id        TEXT NOT NULL,                         -- e.g. "prod_123_0_500g" (the frontend's cart item id)
  product_id     TEXT NOT NULL DEFAULT '',              -- the real product id
  item_name      TEXT NOT NULL DEFAULT '',
  item_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_quantity  TEXT NOT NULL DEFAULT '500g',
  image_url      TEXT NOT NULL DEFAULT '',
  quantity       INTEGER NOT NULL DEFAULT 1,
  item_stock     INTEGER NOT NULL DEFAULT 0,
  retailer_id    TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  customer_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_paid       NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_discount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'placed'
                   CHECK (status IN ('placed','processing','delivered','cancelled','returned')),
  created_at       BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id             SERIAL PRIMARY KEY,
  order_id       TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id        TEXT NOT NULL DEFAULT '',              -- frontend cart item id
  product_id     TEXT NOT NULL DEFAULT '',
  item_name      TEXT NOT NULL DEFAULT '',
  item_price     NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_quantity  TEXT NOT NULL DEFAULT '500g',
  image_url      TEXT NOT NULL DEFAULT '',
  quantity       INTEGER NOT NULL DEFAULT 1,
  retailer_id    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS retailer_analytics (
  retailer_id            TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_revenue          NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cost             NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_profit           NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_orders_fulfilled INTEGER NOT NULL DEFAULT 0,
  last_updated           BIGINT NOT NULL DEFAULT 0
);

-- Always exactly one row (id = 1)
CREATE TABLE IF NOT EXISTS platform_analytics (
  id                    INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_gmv             NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_platform_profit NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_orders          INTEGER NOT NULL DEFAULT 0
);
INSERT INTO platform_analytics (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_products_retailer   ON products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer     ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_retailer ON order_items(retailer_id);
CREATE INDEX IF NOT EXISTS idx_refresh_user        ON refresh_tokens(user_id);
