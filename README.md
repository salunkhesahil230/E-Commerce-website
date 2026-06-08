# ShopZone - Full Stack E-Commerce Application

A Flipkart-style e-commerce web application built with Angular and Node.js.

## Tech Stack
- **Frontend:** Angular 21, Plain CSS
- **Backend:** Node.js, Express, TypeORM
- **Database:** BetterSQLite3
- **Authentication:** JWT, HTTP-only cookies, In-memory sessions

## Features
- Guest, Customer and Admin roles
- Product taxonomy (Type → Category → SubCategory → Product)
- Full text search and filtering
- Persistent cart and checkout
- Order history with price snapshot
- Admin panel with product, customer and order management
- Secure authentication with bcrypt and session management

## Setup Instructions

### Backend
cd backend
npm install
npm run dev

### Frontend
cd frontend
npm install
ng serve

## Default Accounts
- Admin: admin@gmail.com / admin123
- Customer: customer@shop.com / customer123