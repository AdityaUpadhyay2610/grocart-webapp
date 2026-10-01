# GroCart Backend Server (Node.js + Express + PostgreSQL)

The REST API backend for the GroCart web application. Handles authentication (JWT in-memory access tokens + httpOnly refresh cookies), product catalog, categories, shopping carts, order processing (transactions, atomic stock management), retailer analytics, and admin dashboard operations.

---

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials and JWT secrets:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `PORT` | HTTP server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@localhost:5432/grocart` |
| `JWT_ACCESS_SECRET` | Secret key for signing 15-minute access tokens | *strong-secret-key* |
| `JWT_REFRESH_SECRET` | Secret key for signing 7-day refresh tokens | *strong-secret-key* |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token lifespan | `7d` |
| `CLIENT_ORIGIN` | Allowed CORS frontend origin | `http://localhost:5173` |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds | `10` |
| `SEED_ADMIN_EMAIL` | Default admin email for seeding | `admin@grocart.com` |
| `SEED_ADMIN_PASSWORD` | Default admin password for seeding | *strong-admin-pass* |
| `SEED_ADMIN_NAME` | Default admin display name | `Admin User` |

### 3. Initialize Database Tables
```bash
npm run init-db
```
This runs `sql/schema.sql` against your configured PostgreSQL database to establish all tables and constraints.

### 4. Seed Starter Data
```bash
npm run seed
```
Creates the initial platform admin and starter grocery categories (e.g. Fruits & Vegetables, Dairy & Eggs, Bakery, Beverages, Snacks, Staples). Safe to execute multiple times (skips existing records).

### 5. Start the Server
- **Development (with hot reload via nodemon):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

---

## 📡 API Endpoints

### 1. Health
- `GET /api/health` — Server health & database connectivity check

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new customer or retailer account
- `POST /api/auth/login` — Sign in with email and password (sets httpOnly refresh cookie)
- `POST /api/auth/refresh` — Rotate refresh token cookie and issue new 15-minute access token
- `POST /api/auth/logout` — Invalidate refresh token and clear cookie
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/resend-verification` — Email verification stub

### 3. User Profile (`/api/users`)
- `PUT /api/users/me` — Update name, phone, address, store name, or avatar

### 4. Categories (`/api/categories`)
- `GET /api/categories` — Public list of all active categories

### 5. Products (`/api/products`)
- `GET /api/products` — Public list of all active products (supports `?category=...&search=...`)
- `GET /api/products/:id` — Get single product details

### 6. Cart (`/api/cart`)
- `GET /api/cart` — Get current customer's cart items
- `PUT /api/cart/items/:itemId` — Add or update item quantity in cart
- `DELETE /api/cart/items/:itemId` — Remove item from cart
- `DELETE /api/cart` — Clear entire cart

### 7. Orders (`/api/orders`)
- `POST /api/orders` — Place new order (atomic transaction: verifies & deducts stock, records items, updates analytics)
- `GET /api/orders/my` — Get current customer's order history
- `GET /api/orders/:id` — Get order details
- `PATCH /api/orders/:id/status` — Update order status / cancel order (restores inventory)

### 8. Retailer Endpoints (`/api/retailer`) *(Requires `retailer` or `admin` role)*
- `GET /api/retailer/products` — List all products owned by the authenticated retailer
- `PUT /api/retailer/products/:id` — Create or update product (upsert)
- `DELETE /api/retailer/products/:id` — Delete retailer's own product
- `GET /api/retailer/orders` — List orders containing retailer's products
- `GET /api/retailer/analytics` — Get retailer's revenue, order count, and gross profit

### 9. Admin Endpoints (`/api/admin`) *(Requires `admin` role)*
- `GET /api/admin/users` — List all registered users
- `GET /api/admin/orders` — List all orders across the entire platform
- `GET /api/admin/platform-analytics` — Platform-wide metrics (GMV, total orders, total profit)
- `POST /api/admin/create-admin` — Create an additional administrator account
- `POST /api/admin/categories` — Create or update a product category
- `DELETE /api/admin/users/:id` — Permanently delete a user (cascades related data)
