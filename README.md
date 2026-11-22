<div align="center">

<img src="https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet" alt=".NET 10"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19"/>
<img src="https://img.shields.io/badge/TypeScript-Vite-646CFF?style=for-the-badge&logo=vite" alt="Vite"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind v4"/>
<img src="https://img.shields.io/badge/Stripe-Connect-635BFF?style=for-the-badge&logo=stripe" alt="Stripe Connect"/>
<img src="https://img.shields.io/badge/SignalR-Real--Time-512BD4?style=for-the-badge" alt="SignalR"/>

# 🍕 Talabli — Multi-Vendor Food Delivery Platform

**A production-grade, full-stack food ordering and delivery marketplace.**
Customers order from nearby restaurants. Vendors manage their kitchens in real time. Admins oversee the entire platform — payments, KYC, and payouts included.

[Backend Docs](#-backend--aspnet-core-10) · [Frontend Docs](#-frontend--react-19--vite) · [Getting Started](#-getting-started) · [API Reference](#api-endpoints)

</div>

---

## 📌 Project Overview

Talabli is a **multi-vendor marketplace** similar to Talabat or Uber Eats, built entirely from scratch. It covers the full delivery lifecycle:

- 🧑‍💻 **Customers** browse nearby restaurants, build a cart, pay online or via COD, and track their order live.
- 🍳 **Vendors** receive real-time kitchen orders, manage their menu, and get paid via Stripe Connect split payments.
- 🛡️ **Admins** review KYC applications, monitor finances, adjust commissions, and trigger payouts.

### Tech Stack at a Glance

| Layer | Technology |
| :--- | :--- |
| **Backend API** | ASP.NET Core (.NET 10), Clean Architecture + CQRS (MediatR) |
| **Frontend SPA** | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| **Database** | SQL Server + EF Core (Code First) |
| **Caching** | HybridCache — in-memory L1 + Redis L2 |
| **Real-Time** | SignalR WebSockets (`/hubs/orders`) |
| **Payments** | Stripe Connect (split payments, webhooks, vendor onboarding) |
| **Auth** | ASP.NET Identity + JWT + Refresh Tokens |
| **Maps** | Leaflet + OpenStreetMap (pin-drop location selector) |

---

## 🏗️ Repository Structure

```
Multi Vendor Marketplace/
├── Backend/                              # ASP.NET Core .NET 10 solution
│   ├── Multi-Vendor Marketplace.Api/     # REST controllers, SignalR hub, middleware
│   ├── Multi-Vendor Marketplace.Application/   # CQRS commands, queries, validators
│   ├── Multi-Vendor Marketplace.Domain/        # Core entities, domain events, errors
│   ├── Multi-Vendor Marketplace.Infrastructures/  # EF Core, Redis, Stripe, Identity
│   ├── Multi-Vendor Marketplace.Contracts/     # Shared request/response DTOs
│   ├── Multi-Vendor Marketplace.Application.Tests/ # Unit tests (Stripe, webhooks)
│   └── Multi-Vendor Marketplace.slnx
│
└── frontend/                             # React 19 + Vite SPA
    ├── src/
    │   ├── assets/        # Global styles, design tokens, fonts
    │   ├── components/    # Shared UI primitives (Button, Modal, Badge, Tabs)
    │   ├── context/       # AuthContext, CartContext, LocationContext
    │   ├── features/      # Vertical slices: customer/, vendor/, admin/, auth/
    │   ├── hooks/         # useOrderHub (SignalR), custom hooks
    │   ├── layouts/       # CustomerLayout, VendorLayout, AdminLayout, AuthLayout
    │   ├── routes/        # AppRoutes (lazy), ProtectedRoute (RBAC)
    │   ├── services/      # Axios API clients (modular by domain)
    │   └── utils/         # Currency formatting, audio engine, image helpers
    ├── public/
    └── package.json
```

---

## ⚙️ Backend — ASP.NET Core 10

### Architecture

The backend follows **Clean Architecture** with **CQRS** via MediatR, organized into 5 projects:

```
Domain ← Application ← Infrastructures
                  ↑
                 Api
                  ↑
              Contracts
```

- **Domain**: Core business entities (`Customer`, `Merchant`, `Restaurant`, `Dish`, `Order`, `Payment`), domain events, enums, error definitions, and a custom `Result<T>` pattern for functional error handling.
- **Application**: Business use cases as MediatR Commands and Queries, FluentValidation pipeline validators, DTOs, and domain calculations (Haversine distance).
- **Infrastructures**: EF Core + SQL Server persistence, ASP.NET Core Identity with JWT and refresh tokens, dual-layer caching (HybridCache), and Stripe Connect integration.
- **Api**: REST controllers, SignalR order hub, rate limiters, global exception handling (ProblemDetails), Serilog structured logging, and Swagger docs.
- **Contracts**: Shared request/response models between Api and Application layers.

---

### Core Features

#### 1. Authentication & Role-Based Access

- **Dual Registration**: Separate endpoints for customers and restaurant owners. Owner registration automatically provisions an unapproved `Merchant` profile and an initial `Restaurant` record.
- **JWT & Refresh Tokens**: Short-lived JWT access tokens and database-backed refresh tokens with automatic rotation on refresh.
- **Permission & Role Authorization**: Secured using ASP.NET Identity roles (`Admin`, `RestaurantOwner`, `Customer`) and granular permission claims (e.g., `orders.update_status`, `dishes.create`).
- **Brute-Force Rate Limiting**: Auth endpoints are rate-limited to 5 requests/min per IP.

#### 2. Restaurant & Menu Management

- **Catalog Browsing**: Active, approved restaurants with pagination and category filtering.
- **Proximity Sorting**: Restaurants sorted nearest-first using the **Haversine formula** when user coordinates are provided, with an optional `onlyDeliverable` filter.
- **Operating Settings**: Vendors toggle open/close status (`IsOpen`), set delivery radius (`DeliveryRadiusKm`), and define minimum order value (`MinOrderValue`).
- **Media Uploads**: Multi-part form endpoints for restaurant logos, cover banners, and dish images.
- **Menu CRUD**: Full dish management scoped to the authenticated vendor's restaurant.

#### 3. Geolocation & Delivery Calculations

- **Haversine Distance**: Exact spherical distance in kilometers between customer and restaurant coordinates.
- **Dynamic Delivery Fees**: 15 EGP base fee for the first 2 km + 2.5 EGP per additional km.
- **Coverage Validation**: Auto-determines deliverability (`DistanceKm <= DeliveryRadiusKm`).
- **Estimated Delivery Time**: 15 min preparation + ~3 min/km travel time.

#### 4. Hybrid Cart Service

- **Two-Layer Caching**: .NET `HybridCache` — in-memory L1 (30-min expiration) + Redis L2 (14-day expiration).
- **Redis Resilience**: Falls back to local in-memory storage if Redis is unavailable.
- **Single-Vendor Enforcement**: Prevents mixing dishes from multiple restaurants. An `overrideExisting` flag allows explicit cart replacement.

#### 5. Order Lifecycle & Real-Time Tracking

- **Server-Side Pricing**: Order totals, delivery fees, and commissions are recalculated on the server at checkout — client prices are never trusted.
- **Order States**: `Pending` → `Processing` → `Shipped` → `Delivered` / `Cancelled`.
- **Live Updates via SignalR** (`/hubs/orders`): Real-time status events pushed to clients grouped by `userId`, `restaurantId`, and `orderId`.
- **Order History**: Paginated history (5 per page, newest first) for "Load More" UI patterns.

#### 6. Split Payments via Stripe Connect

- **Vendor Onboarding**: Generates Stripe Express onboarding links for KYC verification.
- **Automated Splits**: Platform commission automatically deducted; remainder transferred to vendor's Stripe account.
- **Webhook Verification**: Stripe webhooks verified via signature (`whsec_...`) before processing.
- **COD Support**: Cash on delivery orders bypass Stripe and are recorded with a manual payment status.

---

### API Endpoints

#### Auth (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/customer` | Register a new customer |
| `POST` | `/api/auth/register/vendor` | Register vendor + auto-provision merchant profile |
| `POST` | `/api/auth/login` | Login and receive JWT + refresh token |
| `POST` | `/api/auth/refresh` | Rotate refresh token |
| `POST` | `/api/auth/logout` | Revoke refresh token |

#### Restaurants & Menus (`/api/restaurants`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/restaurants` | Paginated list with proximity sorting |
| `GET` | `/api/restaurants/{id}` | Restaurant details with full menu |

#### Vendor Dashboard (`/api/vendor`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vendor/stats` | Sales and order overview |
| `GET` | `/api/vendor/orders` | List orders (filterable by status) |
| `PATCH` | `/api/vendor/orders/{id}/status` | Advance order status |
| `GET` | `/api/vendor/settings` | Get restaurant operating configuration |
| `PUT` | `/api/vendor/settings` | Update hours, radius, address, and coordinates |
| `POST` | `/api/vendor/media` | Upload restaurant logo and cover image |
| `GET` | `/api/vendor/dishes` | List vendor's dishes |
| `POST` | `/api/vendor/dishes` | Create dish with optional image upload |
| `POST` | `/api/vendor/stripe/onboard` | Generate Stripe Express onboarding link |
| `GET` | `/api/vendor/stripe/status` | Check Stripe account verification status |

#### Cart (`/api/cart`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current user's cart |
| `POST` | `/api/cart/items` | Add item (validates single-vendor rule) |
| `PUT` | `/api/cart/items/{dishId}` | Update item quantity |
| `DELETE` | `/api/cart/items/{dishId}` | Remove item from cart |
| `DELETE` | `/api/cart` | Clear cart |

#### Orders & Payments (`/api/orders`, `/api/payments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders/checkout` | Create order (COD or Card) |
| `GET` | `/api/orders/my-orders` | Paginated customer order history |
| `POST` | `/api/payments/checkout-session` | Create Stripe checkout session |
| `GET` | `/api/payments/order/{orderId}` | Check payment status |
| `POST` | `/api/payments/webhook` | Stripe webhook handler (signature verified) |

#### Admin (`/api/admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/merchants` | List merchants with status filter |
| `PUT` | `/api/admin/merchants/{id}/approve` | Approve a vendor profile |
| `PUT` | `/api/admin/merchants/{id}/reject` | Reject with mandatory reason |
| `PUT` | `/api/admin/merchants/{id}/toggle-status` | Toggle active status |
| `GET` | `/api/admin/finance/overview` | Platform financial overview |
| `GET` | `/api/admin/finance/merchants` | Merchant account balances |
| `PUT` | `/api/admin/merchants/{id}/commission` | Update merchant commission rate |
| `POST` | `/api/admin/finance/payout` | Record payout and settle balance |

#### Search, Locations & Reviews
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/search` | Search with distance and price filters |
| `GET` | `/api/search/categories` | Dynamic list of active food categories |
| `POST` | `/api/locations/customer` | Save customer delivery coordinates |
| `POST` | `/api/reviews` | Submit order review and rating |

---

### Rate Limiting

| Policy | Limit | Scope | Protected Endpoints |
| :--- | :--- | :--- | :--- |
| `auth-policy` | 5 req/min | Per IP | Login, Register |
| `checkout-policy` | 3 req/min | Per User/IP | Checkout |
| `search-policy` | 30 req/min | Per IP | Search |
| `reviews-policy` | 5 req/min | Per User | Reviews |

---

## 🎨 Frontend — React 19 + Vite

### Architecture & Portals

The SPA is organized into **three isolated portals**, each protected by role-based route guards (`ProtectedRoute`):

```
                    ┌──────────────────────────────┐
                    │         App Contexts          │
                    │  AuthContext · Cart · Location │
                    └──────────────┬────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
  Customer Portal           Vendor Portal             Admin Portal
  Public / Customer         Requires Vendor Role      Requires Admin Role
  /, /search, /checkout     /vendor/*                 /admin/*
```

### Tech Stack

| Tool | Version | Role |
| :--- | :--- | :--- |
| React | 19 | Client-side SPA, hooks and context |
| Vite | 8 | HMR, build tool |
| Tailwind CSS | v4 | Utility-first styling via `@tailwindcss/vite` |
| React Router | v7 | Protected role-based routes + `React.lazy` splitting |
| `@microsoft/signalr` | ^11 | WebSocket client for real-time order events |
| Leaflet + React-Leaflet | ^1.9 | Pin-drop address selector + OpenStreetMap |
| Axios | ^1.21 | HTTP client with JWT interceptors |
| Lucide React | ^1.72 | Icon set |
| Web Audio API | native | Zero-asset synthetic audio chimes for notifications |

---

### Key Features

#### 1. Customer Experience

- **Guest Cart with Auto-Migration**: Guests add items without an account. Guest carts persist locally (24-hour TTL). On login/register, cart items sync sequentially to the backend cache.
- **Location & Pin-Drop Map**: Interactive Leaflet map to pin exact delivery coordinates. Guest pins are saved to the customer profile on login via `POST /api/locations/customer`.
- **Search & Filtering**: Debounced header search, cuisine tags, minimum rating, and delivery radius filters.
- **Checkout & Payments**: COD and Stripe online payments. Stripe flow redirects through Stripe Checkout and returns to `/payment/success` which polls order status until confirmed.
- **Live Order Tracking**: Status stepper (`Placed → Processing → Shipped → Delivered`) updated in real-time via SignalR. Post-delivery rating modal.

#### 2. Vendor Portal

- **Live Kitchen Board (`/vendor/orders`)**: Real-time order cards with item quantities, special notes, and customer info. One-click status advancement with optimistic UI updates.
- **Menu Editor (`/vendor/menu`)**: Full CRUD for dishes via a data table and add/edit modal (name, price, category, image upload).
- **Restaurant Settings**: Store open/close toggle, delivery radius slider (km), minimum order value, map pin placement, and cover image upload.
- **Stripe Onboarding**: Generates a Stripe Express KYC link directly from the vendor dashboard.

#### 3. Admin Panel

- **Platform Overview (`/admin`)**: Revenue, active vendor count, order volume, and commission earnings.
- **Merchant KYC Review (`/admin/merchants`)**: Approve, suspend, or reject vendor applications with mandatory rejection reasons.
- **Financial Settlements (`/admin/finance`)**: Pending vs settled balances per merchant, payout registration modal with bank reference, and one-click CSV export.

#### 4. Real-Time Architecture & Audio System

- **SignalR Hub (`orderHubService.js`)**: Singleton WebSocket client with auto-reconnection. Subscribed at layout level so alerts persist across page navigations. Joins scoped groups (`user_{userId}`, `restaurant_{restaurantId}`).
- **Web Audio API Alerts (`soundEffects.js`)**:
  - **Vendor**: Ascending three-tone kitchen chime (E5 → G#5 → B5) on new order arrival.
  - **Customer**: Soft two-tone chime on order status update.
  - Zero external sound files, 0ms latency, immune to 404 or CORS issues.
- **Floating Toasts (`RealtimeToast.jsx`)**: Glassmorphic non-blocking notifications with direct links to updated orders.

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Minimum Version |
| :--- | :--- |
| .NET SDK | 10.0 |
| Node.js | 18.0 |
| SQL Server | LocalDB or full instance |
| Redis | Optional (falls back to in-memory) |

---

### Backend Setup

1. **Configure `appsettings.json`** in `Backend/Multi-Vendor Marketplace.Api/`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MarketplaceDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Issuer": "MarketplaceApi",
    "Audience": "MarketplaceClient",
    "Key": "YOUR_STRONG_SECRET_KEY_AT_LEAST_32_CHARACTERS",
    "ExpiryMinutes": 60
  },
  "Stripe": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_...",
    "AllowTestCheckoutWithoutSeller": true
  }
}
```

2. **Build and run:**

```bash
cd Backend

# Restore and build
dotnet build

# Run unit tests
dotnet test

# Start the API
dotnet run --project "Multi-Vendor Marketplace.Api"
```

| Endpoint | URL |
| :--- | :--- |
| **API Base** | `http://localhost:5107` |
| **Swagger UI** | `http://localhost:5107/swagger` |
| **SignalR Hub** | `http://localhost:5107/hubs/orders` |

> On first startup, `MarketplaceDataSeeder` automatically seeds roles (`Admin`, `RestaurantOwner`, `Customer`), permissions, and **40 demo restaurants** with menus and Cairo-based coordinates.

---

### Frontend Setup

1. **Install dependencies:**

```bash
cd frontend
npm install
```

2. **Configure environment:**

```bash
# Copy the example env file
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5107/api
```

3. **Start the dev server:**

```bash
npm run dev
# → http://localhost:5173
```

4. **Build for production:**

```bash
npm run build
npm run preview
```

---

## 🧪 Testing

```bash
# Backend unit tests (Stripe checkout, webhooks, vendor payouts)
cd Backend
dotnet test "Multi-Vendor Marketplace.Application.Tests"
```

---

## 🔐 Security Notes

- **Never commit** real API keys or secrets. Use `appsettings.Local.json` (gitignored) for local overrides.
- Stripe webhook signatures are verified on every incoming event — unsigned requests are rejected with `400 Bad Request`.
- JWT keys should be at least 32 characters and stored securely (environment variables or secrets manager in production).
- All auth endpoints are rate-limited to prevent brute-force attacks.

---

## 📄 License

Proprietary — Internal project for Talabli Marketplace.
