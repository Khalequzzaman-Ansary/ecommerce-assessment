# Ecommerce-Assessment

A full-stack E-Commerce assessment project organized as a simple monorepo with two separate apps:

- `frontend` → Next.js client application
- `backend` → Express + MongoDB API

The app covers the core e-commerce flow:

- browse products
- search products
- register and log in
- add/remove items in cart
- place orders
- manage products as an admin
- view basic sales summary reports

---

## Project Overview

This repository is split into two independent projects inside one repo:

- **Frontend:** a Next.js (App Router) UI built with TypeScript, Ant Design, Tailwind CSS v4, and Framer Motion
- **Backend:** a TypeScript Express API using MongoDB (via Mongoose), JWT authentication, and bcrypt password hashing

There is **no root workspace setup** (no shared root `package.json` / Turborepo / pnpm workspace).  
That means you install and run each app separately.

---

## Features

### Customer Features

- User registration
- User login with JWT-based authentication
- Product listing with:
  - search by name
  - pagination
- Add products to cart
- Remove products from cart
- View cart subtotal
- Place order from cart
- Stock validation before checkout

### Admin Features

- Admin-only product creation
- Admin-only product editing
- Admin-only product deletion
- Admin dashboard with:
  - total products
  - total orders
  - total revenue
  - top-selling products

### Backend Features

- Password hashing with `bcryptjs`
- JWT auth with role-based access control
- Protected routes for authenticated users
- Admin middleware for restricted routes
- MongoDB models for users, products, carts, and orders
- Health check endpoint

---

## Monorepo Structure

```text
ecommerce-assessment/
├── backend/
│   📦src
      ┣ 📂config
      ┃ ┣ 📜db.ts
      ┃ ┗ 📜env.ts
      ┣ 📂controllers
      ┃ ┣ 📜auth.controller.ts
      ┃ ┣ 📜cart.controller.ts
      ┃ ┣ 📜order.controller.ts
      ┃ ┣ 📜product.controller.ts
      ┃ ┗ 📜report.controller.ts
      ┣ 📂middlewares
      ┃ ┣ 📜admin.middleware.ts
      ┃ ┗ 📜auth.middleware.ts
      ┣ 📂models
      ┃ ┣ 📜Cart.ts
      ┃ ┣ 📜Order.ts
      ┃ ┣ 📜Product.ts
      ┃ ┗ 📜User.ts
      ┣ 📂routes
      ┃ ┣ 📜auth.routes.ts
      ┃ ┣ 📜cart.routes.ts
      ┃ ┣ 📜order.routes.ts
      ┃ ┣ 📜product.routes.ts
      ┃ ┗ 📜report.routes.ts
      ┣ 📂types
      ┃ ┗ 📜express.d.ts
      ┣ 📂utils
      ┃ ┣ 📜hash.ts
      ┃ ┗ 📜jwt.ts
      ┣ 📜app.ts
│     ┗ 📜server.ts
│├── .env
│├── .env.example
│├── package.json
│└── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├──📦src
        ┣ 📂app
        ┃ ┣ 📂admin
        ┃ ┃ ┗ 📜page.tsx
        ┃ ┣ 📂cart
        ┃ ┃ ┗ 📜page.tsx
        ┃ ┣ 📂login
        ┃ ┃ ┗ 📜page.tsx
        ┃ ┣ 📂products
        ┃ ┃ ┗ 📜page.tsx
        ┃ ┣ 📂register
        ┃ ┃ ┗ 📜page.tsx
        ┃ ┣ 📜favicon.ico
        ┃ ┣ 📜globals.css
        ┃ ┣ 📜layout.tsx
        ┃ ┗ 📜page.tsx
        ┣ 📂components
        ┃ ┣ 📜Navbar.tsx
        ┃ ┗ 📜ProductForm.tsx
        ┗ 📂lib
        ┃ ┣ 📜api.ts
        ┃ ┗ 📜auth.ts
│   │
│   │
│   │
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
│
└── .gitignore
```

### Tech Stack

**Frontend**

- Next.js (App Router)
- React
- TypeScript
- Ant Design
- Tailwind CSS v4
- Framer Motion

**Backend**

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- Zod (installed, though validation is mostly handled manually in current code)

# How Authentication Works

- Users register with **name, email, password**
- Passwords are hashed before saving
- On login, the backend returns:
  - a JWT token
  - basic user info
- The frontend stores both in `localStorage`
- Protected frontend requests send the token as:

```http
Authorization: Bearer <token>
```

## Prerequisites

Before running the project, make sure you have:

- a recent Node.js LTS version
- npm
- a working MongoDB connection string (local MongoDB or MongoDB Atlas)

## Environment Variables

### (1) Backend (`backend/.env`)

Create a `backend/.env` file with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/shopflow
JWT_SECRET=change_this_to_a_long_random_secret
NODE_ENV=development
```

### (2) Frontend (`frontend/.env.local`)

Create a `frontend/.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Important Notes

- `NEXT_PUBLIC_API_URL` should be the **backend base URL**
- Keep it **without a trailing slash** (use `http://localhost:5000`, not `http://localhost:5000/`)
- Do **not** commit real secrets to version control
- The current `backend/.env.example` in this codebase is not usable as-is and should be replaced with a clean template like the one above

## Local Development Setup

### (1) Install backend dependencies

```bash
cd backend
npm install
```

### (2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### (3) Start the backend

```bash
cd backend
npm run dev
```

Backend should start on:

```text
http://localhost:5000
```

### (4) Start the frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend should start on:

```text
http://localhost:3000
```

### (5) Open the app

Visit:

```text
http://localhost:3000
```

The root route (`/`) redirects to `/products`.

## Available Scripts

### Backend (`/backend`)

```bash
npm run dev     # Start backend in development mode using ts-node-dev
npm run build   # Compile TypeScript to /dist
npm run start   # Run compiled server from /dist
```

### Frontend (`/frontend`)

```bash
npm run dev     # Start Next.js dev server
npm run build   # Create production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Frontend Routes

- `/` → redirects to `/products`
- `/products` → product listing page
- `/cart` → authenticated user cart page
- `/login` → login page
- `/register` → registration page
- `/admin` → admin dashboard (client-side guarded and server-side protected)

---

## Backend API Endpoints

All responses follow a consistent shape like this:

```json
{
  "success": true,
  "message": "Readable status message",
  "data": {}
}
```

## Health / Auth State

`GET /health`  
Checks whether the API is alive.

`GET /me`  
Protected route. Returns the currently authenticated user payload from the token.

Requires:

```http
Authorization: Bearer <token>
```

## Auth

`POST /auth/register`  
Create a new user account.

### Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Notes:

- Registration creates a user with role: `user`
- This endpoint does **not** log the user in automatically
- The frontend redirects the user to the login page after successful registration
  `POST /auth/login`  
  Log in an existing user.

### Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Returns:

- JWT token
- basic user object

## Products

`GET /products`  
Get products with optional pagination and search.

### Query params:

- `page` (default: `1`)
- `limit` (default: `10`)
- `search` (case-insensitive name search)

### Example:

```http
GET /products?page=1&limit=10&search=mouse
```

`GET /products/:id`  
Get a single product by ID.

`POST /products`  
Create a new product.  
**Admin only.**

Requires auth header.

### Request body:

```json
{
  "name": "Wireless Mouse",
  "price": 29.99,
  "stock": 50,
  "description": "Ergonomic wireless mouse"
}
```

`PUT /products/:id`  
Update an existing product.  
**Admin only.**

Requires auth header.

`DELETE /products/:id`  
Delete a product.  
**Admin only.**

Requires auth header.

## Cart

`GET /cart`  
Get the current authenticated user’s cart.

Requires auth header.

`POST /cart`  
Add an item to cart.

Requires auth header.

### Request body:

```json
{
  "productId": "PRODUCT_ID_HERE",
  "quantity": 2
}
```

### Behavior:

- Creates a cart automatically if one does not exist
- If the product is already in cart, quantity is increased
- Quantity cannot exceed current stock

`DELETE /cart/:productId`  
Remove an item from cart.

Requires auth header.

## Orders

`POST /orders`  
Place an order using the current contents of the authenticated user’s cart.

Requires auth header.

### Behavior:

- Fails if cart is empty
- Revalidates stock before order creation
- Deducts product stock
- Clears the cart after successful order creation

## Reports

`GET /reports/summary`  
Get admin sales summary.

**Admin only.**  
Requires auth header.

### Returns:

- total order count
- total revenue
- top 3 selling products

## Database Models

### User

- `name`
- `email`
- `password` (hashed, excluded by default)
- `role` (`user` | `admin`)

### Product

- `name`
- `price`
- `stock`
- `description`

### Cart

- `user`
- `items[]`
  - `product`
  - `quantity`

### Order

- `user`
- `items[]`
  - `product`
  - `name`
  - `price`
  - `quantity`
  - `lineTotal`
- `totalAmount`

## Creating Your First Admin User

There is currently no public registration flow for admin accounts.  
Every new account is created as a normal `user`.

To create an admin:

1. Register a normal account from the UI
2. Update that user’s `role` in MongoDB to `admin`
3. Log out
4. Log back in so a fresh JWT is issued with the updated role

### Example using MongoDB shell

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

If you change the role directly in the database but keep using an old token, the old token still contains the old role. That token will not magically become smarter.

## Production Build

### Backend

```bash
cd backend
npm run build
npm run start
```

### Frontend

```bash
cd frontend
npm run build
npm run start
```

Make sure production environment variables are configured correctly in your hosting platform.

## Summary

This repository demonstrates a clean separation between frontend and backend, covers the main ecommerce workflow, and includes a usable admin dashboard on top of a straightforward JWT + MongoDB stack.
