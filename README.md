# GroCart

A modern grocery commerce platform built for fast, scalable shopping experiences across customer, retailer, and admin workflows.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/AdityaUpadhyay2610/grocart-webapp/actions)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](https://github.com/AdityaUpadhyay2610/grocart-webapp/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-v19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

GroCart combines a fast React storefront with a secure Express backend and PostgreSQL data layer to support real-time cart behavior, controlled inventory flow, secure authentication, and streamlined order management.

## Highlights

- Customer shopping experience with product browsing, search, cart updates, and checkout
- Retailer controls for product management, order visibility, and operational analytics
- Admin tools for platform oversight, category management, and user administration
- Role-based access for customer, retailer, and admin users
- Secure JWT authentication with refresh-token flow and cookie handling
- Google Sign-In integration and Razorpay-ready checkout flow
- Scalable server-side validation, rate limiting, and safety checks

## Tech Stack

### Frontend
- React 19
- Vite
- TypeScript and JavaScript mix
- Redux Toolkit
- React Router
- TanStack Query
- Tailwind CSS

### Backend
- Node.js
- Express
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Helmet, CORS, and rate limiting

### Integrations
- Google OAuth 2.0
- Razorpay payment flow

## Architecture

GroCart follows a modular monolith structure with clear separation between application domains:

- `src/` contains the React frontend and feature modules
- `server/src/` contains the API server, routes, controllers, middleware, validators, and auth logic
- `server/sql/` contains database schema and migration scripts
- `public/` stores static assets for the front end

The application is designed around role-based flows and secure API boundaries, with server-side validation and inventory control at checkout to reduce common e-commerce risks.

## Local Setup

### Requirements

- Node.js 20+
- npm
- PostgreSQL 14+
- A running local PostgreSQL instance

### 1. Install dependencies

```bash
npm install
cd server
npm install
cd ..
```

### 2. Create environment files

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Update the values in both `.env` files before running the app.

### 3. Initialize the database

```bash
cd server
npm run init-db
npm run seed
cd ..
```

### 4. Start the app

Open two terminals:

Terminal 1 - backend:

```bash
cd server
npm run dev
```

Terminal 2 - frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend runs at `http://localhost:5000`.

## Environment Variables

### Frontend variables

```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=
VITE_RAZORPAY_KEY_ID=
```

### Backend variables

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/grocart
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ISSUER=grocart-api
JWT_AUDIENCE=grocart-web
GOOGLE_CLIENT_ID=
TRUST_PROXY=0
```

Use strong random values for the JWT secrets and keep them different from each other.

## Google Sign-In Setup

Google auth is configured with a matching client ID on both the frontend and backend.

1. Create an OAuth 2.0 Web client in Google Cloud Console.
2. Add these JavaScript origins:
   - `http://localhost`
   - `http://localhost:5173`
   - your production frontend origin(s)
3. Set the same client ID in both files:
   - root `.env` as `VITE_GOOGLE_CLIENT_ID`
   - `server/.env` as `GOOGLE_CLIENT_ID`
4. If your app is still in Testing mode, add test users in the OAuth consent screen.
5. Keep `Cross-Origin-Opener-Policy` configured for Google popup compatibility.

## Project Structure

```text
.
+-- src/
¦   +-- global/
¦   +-- modules/
¦   +-- App.tsx
¦   +-- main.tsx
+-- public/
+-- server/
¦   +-- src/
¦   +-- scripts/
¦   +-- sql/
¦   +-- README.md
+-- .env.example
+-- README.md
+-- package.json
+-- vite.config.js
```

## Development Notes

- The app uses a Vite proxy for local API calls.
- Server-side validation and rate limits are enforced in the backend.
- The root app is kept intentionally straightforward and easy to reason about for feature work and maintenance.

## Contributing

Contributions are welcome. Please keep changes focused, readable, and consistent with the existing project patterns.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the relevant checks
5. Open a pull request

Before submitting, run:

```bash
npm run lint
npm run build
```

## License

This project is licensed under the [MIT License](LICENSE).