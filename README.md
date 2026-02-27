# Ecommerce-Assessment

A full-stack E-Commerce assessment project organized as a simple monorepo with two separate apps:

- `frontend` → Next.js client application
- `backend` → Express + MongoDB API

The app covers the core e-commerce flow without trying to cosplay as Amazon:

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
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
│
└── .gitignore
```
