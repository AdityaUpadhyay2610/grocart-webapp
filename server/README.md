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
| `ACCESS_TOKEN_EXPIRES` | Access token lifespan | `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Refresh token lifespan in days | `7` |
| `JWT_ISSUER` | JWT issuer | `grocart-api` |
| `JWT_AUDIENCE` | JWT audience | `grocart-web` |
| `CLIENT_URL` | Allowed CORS frontend origin (trailing slash is ignored) | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID used by `/api/auth/google` | `123...apps.googleusercontent.com` |
| `GOOGLE_RATE_LIMIT_CAPACITY` | Google login token bucket capacity | `10` |
| `GOOGLE_RATE_LIMIT_WINDOW_MINUTES` | Google login rate-limit window | `15` |
| `BCRYPT_ROUNDS` | Bcrypt salt rounds | `12` |
| `LOG_LEVEL` | Minimum server log level | `info` |
| `REFRESH_TOKEN_CLEANUP_INTERVAL_MINUTES` | Expired refresh-token cleanup interval | `60` |
| `JSON_BODY_LIMIT` | Default JSON request body limit | `100kb` |
| `PROFILE_JSON_BODY_LIMIT` | Profile JSON request body limit | `3mb` |
| `AVATAR_MAX_BYTES` | Maximum decoded avatar size | `1048576` |
| `AVATAR_VALIDATION_MESSAGE` | Avatar validation error message | Image formats and configured size |
| `PRODUCT_IMAGE_VALIDATION_MESSAGE` | Product image validation error message | HTTPS or local public path |
| `PAGINATION_DEFAULT_LIMIT` | Default list page size | `25` |
| `PAGINATION_MAX_LIMIT` | Maximum list page size | `100` |
| `PAGINATION_MAX_OFFSET` | Maximum list offset | `1000000` |
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

### 6. Google Sign-In Setup

1. In Google Cloud Console create an OAuth 2.0 Web client.
2. Add `http://localhost` and `http://localhost:5173` to Authorized JavaScript origins; add your production frontend origin as well.
3. Set the same client ID in `server/.env` as `GOOGLE_CLIENT_ID` and in the frontend root `.env` as `VITE_GOOGLE_CLIENT_ID`.
4. If the OAuth consent screen is in Testing mode, add your Google test account to the list of users.
5. Existing databases should run `server/sql/migrate_google_auth.sql` once if Google columns are missing.

---

## 📡 API Endpoints

## Rate limiting

The API uses in-memory token buckets for general requests, refresh, order placement, and profile updates. Login failures are tracked separately by email and IP, while registration requests are tracked by IP. Configure `TRUST_PROXY`, `RATE_LIMIT_STORE_CLEANUP_INTERVAL_MS`, `RATE_LIMIT_STORE_IDLE_TIMEOUT_MS`, `RATE_LIMIT_MESSAGE`, `LOGIN_LOCK_MESSAGE`, `COOKIE_REQUEST_HEADER_MESSAGE`, `AUTH_INVALID_CREDENTIALS_MESSAGE`, `API_RATE_LIMIT_CAPACITY`, `API_RATE_LIMIT_REFILL_PER_SECOND`, `API_RATE_LIMIT_WINDOW_SECONDS`, `REFRESH_RATE_LIMIT_CAPACITY`, `REFRESH_RATE_LIMIT_REFILL_PER_SECOND`, `REFRESH_RATE_LIMIT_WINDOW_SECONDS`, `ORDER_RATE_LIMIT_CAPACITY`, `ORDER_RATE_LIMIT_REFILL_PER_SECOND`, `ORDER_RATE_LIMIT_WINDOW_SECONDS`, `PROFILE_RATE_LIMIT_CAPACITY`, `PROFILE_RATE_LIMIT_REFILL_PER_SECOND`, `PROFILE_RATE_LIMIT_WINDOW_SECONDS`, `LOGIN_EMAIL_FAILURE_CAPACITY`, `LOGIN_EMAIL_FAILURE_WINDOW_MINUTES`, `LOGIN_EMAIL_LOCK_MINUTES`, `LOGIN_IP_FAILURE_CAPACITY`, `LOGIN_IP_FAILURE_WINDOW_MINUTES`, `REGISTER_RATE_LIMIT_CAPACITY`, and `REGISTER_RATE_LIMIT_WINDOW_MINUTES` in `.env`. The store exposes `get` and `set` methods so it can be replaced with Redis when the application needs multiple server instances.

### 1. Health
- `GET /api/health` — Server health & database connectivity check

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer or retailer account; returns `409` if the email is already registered
- `POST /api/auth/google` — Sign in with Google; send `intent: "register"` to reject existing accounts during signup (retailer signup also sends `role` and `storeName`)
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
