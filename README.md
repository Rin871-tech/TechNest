TechNest --- Smart Tech Store

Technology, thoughtfully chosen.

TechNest is a full-stack e-commerce platform for discovering and
purchasing carefully selected technology products. It includes a modern
React storefront, secure authentication, product and order management,
an admin dashboard, Google OAuth, MongoDB persistence, and an AI-powered
order intelligence workflow.

🌐 Live Demo

Frontend: https://tech-nest-kohl.vercel.app

Backend API: https://technest-jz4v.onrender.com

Repository: https://github.com/Rin871-tech/TechNest

The AI order-intelligence workflow currently uses a local n8n + Ollama
setup for development/demo purposes. The production storefront and API
are deployed independently.

✨ Features

Customer Experience

Modern responsive storefront

Product browsing and search

Category filtering

Product detail pages

Sorting

Shopping cart

Checkout flow

Order creation and order history

Individual order details

Account page

Cash-on-delivery and simulated online payment flow

Google OAuth login

JWT-based authentication

Admin Dashboard

Admin users can access:

Dashboard statistics

Product management

Create products

Edit products

Delete products

Customer management

Order management

Order status updates

AI Order Intelligence

Customer type classification

Purchase-intent analysis

Complementary product categories

Customer insights

Admin recommendations

Order-priority classification

AI Order Intelligence

TechNest integrates an n8n workflow with a locally hosted Ollama model.

Current workflow:

New Order
   ↓
n8n Webhook
   ↓
Order/Product Classification
   ↓
Ollama — Llama 3.2 3B
   ↓
AI Response Parser
   ↓
TechNest Internal API
   ↓
MongoDB
   ↓
Admin Dashboard

The AI workflow is designed to generate cautious, order-grounded
insights rather than unsupported assumptions about customers.

🏗️ Architecture

                         ┌─────────────────────┐
                         │      Vercel         │
                         │ React + Vite        │
                         │ TechNest Frontend   │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS REST API
                                    ▼
                         ┌─────────────────────┐
                         │       Render        │
                         │ Node + Express      │
                         │ TechNest Backend    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    MongoDB Atlas    │
                         │ Users / Products    │
                         │ Orders / Insights   │
                         └─────────────────────┘

                    Development / AI Workflow
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │        n8n          │
                         │ Workflow Automation │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Ollama         │
                         │   Llama 3.2 3B      │
                         └─────────────────────┘

🛠️ Tech Stack

Frontend

React

Vite

JavaScript / JSX

React Router

CSS

Vercel

Backend

Node.js

Express.js

Mongoose

JWT

bcryptjs

Google OAuth

Helmet

express-rate-limit

CORS

Render

Database

MongoDB Atlas

AI / Automation

n8n

Ollama

Llama 3.2 3B

Development Tools

Git

GitHub

npm

Docker Desktop

Visual Studio Code / compatible IDE

📁 Project Structure

TechNest/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── products.js
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── data/
│   │   │   └── products.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── Account.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   └── AdminCustomers.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vercel.json
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── Product.js
│   │   ├── User.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── README.md

🚀 Local Development

1. Clone the repository

git clone https://github.com/Rin871-tech/TechNest.git
cd TechNest

2. Install backend dependencies

cd backend
npm install

3. Configure backend environment variables

Create:

backend/.env

Example:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

N8N_INTERNAL_SECRET=your_internal_n8n_secret

# Optional for local AI automation
N8N_ORDER_WEBHOOK_URL=http://localhost:5678/webhook/technest-order

Never commit .env files or secrets to GitHub.

4. Start the backend

npm run dev

Backend:

http://localhost:5000

5. Install frontend dependencies

Open another terminal:

cd TechNest/frontend
npm install

Create:

frontend/.env

with:

VITE_API_URL=http://localhost:5000

6. Start the frontend

npm run dev

Frontend:

http://localhost:5173

🔐 Authentication

TechNest supports:

Email/password authentication

Passwords are hashed using bcryptjs.

Google OAuth

Google authentication is handled through the backend OAuth flow.

For production, configure the Google OAuth client with:

Authorized JavaScript Origin:
https://tech-nest-kohl.vercel.app

and:

Authorized Redirect URI:
https://technest-jz4v.onrender.com/api/auth/google/callback

For local development:

http://localhost:5173
http://localhost:5000/api/auth/google/callback

👤 Roles

TechNest currently supports two roles:

CUSTOMER
ADMIN

Newly registered users are customers by default.

Admin authorization is enforced by the backend through:

JWT authentication
        ↓
User lookup
        ↓
role === ADMIN
        ↓
Admin API access

Admin users can access:

/api/admin/*

🔌 API Overview

Products

GET    /api/products
GET    /api/products/:id

Authentication

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/google
GET    /api/auth/google/callback

Orders

POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders/:id
PATCH  /api/orders/:id/simulate-payment
PATCH  /api/orders/internal/ai-insight

Admin

GET    /api/admin/dashboard
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id

GET    /api/admin/customers
GET    /api/admin/orders
GET    /api/admin/ai-insights

The internal AI-insight endpoint is protected with a server-side shared
secret and is intended for the n8n workflow.

🧠 AI Order Intelligence

When an order is created, the backend can send an order event to n8n.

The workflow analyzes explicit order information and produces structured
output such as:

{
  "customerType": "Computing Buyer",
  "purchaseIntent": "Inference: The customer is purchasing computing equipment.",
  "complementaryCategories": [
    "Accessories",
    "Storage"
  ],
  "customerInsight": "The order contains a computing product.",
  "adminRecommendation": "Consider relevant compatible accessories for this order.",
  "orderPriority": "NORMAL"
}

The resulting insight is stored with the order and displayed in the
Admin Dashboard.

The workflow is intentionally designed to avoid unsupported inferences
about demographics, personality, profession, hobbies, previous
purchases, or other attributes not present in the order.

💳 Payments

The current project uses a simulated online payment flow for
development and demonstration.

This avoids requiring production payment-gateway credentials while the
project is being developed.

The order model supports:

COD
ONLINE

with payment states:

PENDING
PAID
FAILED

A real payment gateway can be integrated later.

🌍 Deployment

Frontend --- Vercel

Production environment variable:

VITE_API_URL=https://technest-jz4v.onrender.com

The frontend uses a Vercel rewrite so React Router routes such as:

/products
/products/:id
/cart
/login
/admin

work correctly when directly opened or refreshed.

Backend --- Render

Production API:

https://technest-jz4v.onrender.com

Production frontend URL:

https://tech-nest-kohl.vercel.app

The backend CORS configuration allows the production frontend through:

FRONTEND_URL=https://tech-nest-kohl.vercel.app

Database --- MongoDB Atlas

The application stores:

Users

Products

Orders

AI order insights

in MongoDB Atlas.

🔒 Security Considerations

TechNest includes:

Password hashing with bcrypt

JWT authentication

Role-based admin authorization

HTTP security headers with Helmet

API rate limiting

CORS restrictions

Protected admin routes

Protected internal AI endpoint

Environment variables for secrets

No secrets committed to Git

Never commit:

.env
.env.local
API keys
JWT secrets
Google OAuth secrets
MongoDB credentials
n8n internal secrets

🧪 Production Verification Checklist

Before considering a deployment complete:

Frontend deployed

Backend deployed

MongoDB connected

Products API working

Products displayed on frontend

React Router production routing working

Google OAuth production login working

Admin role working

Admin dashboard accessible

Customer authentication working

Order APIs available

AI insight storage integrated

Frontend environment variables configured

Backend CORS configured

Environment secrets excluded from Git

📌 Future Improvements

Potential next steps include:

Production payment gateway integration

Cloud-hosted n8n deployment

Cloud-hosted AI inference instead of local Ollama

Image storage/CDN optimization

Product reviews and ratings

Wishlist functionality

Email notifications

Advanced analytics

Inventory management

Order tracking

Automated testing

CI/CD pipeline

Improved mobile navigation

👩‍💻 Author

Vaishnavi Chavan

B.Tech --- Computer Science & Engineering
Artificial Intelligence & Machine Learning

GitHub: https://github.com/Rin871-tech

📄 License

This project is developed as a full-stack e-commerce project and
internship portfolio project.

Add an appropriate open-source license before distributing the project
as open-source.
