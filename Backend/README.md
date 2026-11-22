# Multi-Vendor Marketplace API

A backend API for a multi-vendor food delivery and restaurant marketplace, built with ASP.NET Core (.NET 10).

The system handles the full marketplace lifecycle: customer ordering, multi-vendor restaurant and menu management, distance-based delivery calculations, real-time order tracking with SignalR, and automated split payments using Stripe Connect.

---

## Architecture

The project follows Clean Architecture principles with CQRS (via MediatR):

- **Domain**: Core business entities (`Customer`, `Merchant`, `Resturant`, `Dish`, `Order`, `Payment`), domain events, enums, error definitions, and a custom `Result<T>` pattern for functional error handling.
- **Application**: Business use cases split into MediatR Commands and Queries, FluentValidation pipeline validators, DTOs, and domain calculations (e.g. Haversine distance).
- **Infrastructures**: Persistence with EF Core and SQL Server, ASP.NET Core Identity with JWT and refresh token storage, dual-layer caching (`HybridCache` with in-memory L1 and Redis L2), and Stripe Connect integration.
- **Api**: REST controllers, SignalR order hub, endpoint rate limiters, global exception handling (`ProblemDetails`), Serilog structured logging, and Swagger docs.
- **Contracts**: Shared request and response models.
- **Tests**: Unit tests for payment sessions, Stripe webhooks, and vendor payouts.

---

## Core Features

### 1. Authentication & Role-Based Access
- **Dual Registration**: Separate registration endpoints for customers and restaurant owners. Registering as an owner automatically provisions an unapproved `Merchant` profile and an initial `Resturant` record.
- **JWT & Refresh Tokens**: Issues short-lived JWT access tokens and database-backed refresh tokens with automatic token rotation on refresh.
- **Permission & Role Authorization**: Endpoints are secured using standard ASP.NET Identity roles (`Admin`, `ResturantOwner`, `Customer`) and granular permission claims (e.g., `orders.update_status`, `dishes.create`).
- **Brute-Force Rate Limiting**: Auth endpoints are rate-limited to 5 requests per minute per IP.

### 2. Restaurant & Menu Management
- **Catalog Browsing**: Lists active and approved restaurants with pagination and category filtering.
- **Proximity Sorting**: When user coordinates are provided (or stored in the customer's profile), restaurants are sorted nearest-first using the Haversine formula, with an optional `onlyDeliverable` filter.
- **Operating Settings**: Vendors can toggle store open/close status (`IsOpen`), set delivery radius (`DeliveryRadiusKm`), and define minimum order value (`MinOrderValue`).
- **Media Uploads**: Multi-part form endpoints for uploading restaurant logos, cover banners, and dish images to server storage.
- **Menu CRUD**: Full management of dishes (name, description, price, image) scoped to the authenticated vendor's restaurant.

### 3. Geolocation & Delivery Calculations
- **Distance Calculation**: Uses the Haversine formula to compute exact spherical distance in kilometers between customer and restaurant coordinates.
- **Dynamic Delivery Fees**: Calculated server-side (15 EGP base fee for the first 2 km, plus 2.5 EGP per additional km).
- **Coverage Validation**: Automatically determines whether a customer is deliverable (`DistanceKm <= DeliveryRadiusKm`).
- **Estimated Delivery Time**: Calculated dynamically based on preparation time (15 mins) plus travel time (approx. 3 mins per km).

### 4. Hybrid Cart Service
- **Two-Layer Caching**: Uses .NET `HybridCache` with an in-memory L1 layer (30-minute expiration) and a distributed Redis L2 layer (14-day expiration) for low-latency cart operations.
- **Redis Resilience**: If Redis goes down, the cache service falls back to local in-memory storage without failing customer requests.
- **Single-Vendor Enforcement**: Prevents customers from mixing dishes from multiple restaurants in a single cart. An `overrideExisting` flag allows users to explicitly clear their previous cart when adding from a new restaurant.

### 5. Order Lifecycle & Real-Time Tracking
- **Server-Side Pricing**: Order totals, delivery fees, and commissions are recalculated on the server during checkout; client-submitted prices are never trusted.
- **Order States**: Orders follow a strict progression: `Pending` -> `Processing` (preparing) -> `Shipped` (out for delivery) -> `Delivered` (completed), or `Cancelled`.
- **Live Updates via SignalR (`/hubs/orders`)**: Real-time events push status changes directly to connected clients grouped by user ID, restaurant ID, and order ID.
- **Customer Order History**: Paginated order history (defaults to 5 orders per page, newest first) designed for "Load More" UI flows.
- **Vendor Order Management**: Vendor dashboard endpoints to filter orders by status and update order progress.

### 6. Stripe Connect & Payments
- **Express Accounts**: Restaurant onboarding via Stripe Express accounts. The API generates Stripe-hosted onboarding links and tracks account verification status (`charges_enabled`, `payouts_enabled`).
- **Destination Charges**: Customer card payments create Stripe Checkout Sessions that automatically transfer net earnings to the vendor while deducting the platform's commission (`application_fee_amount`).
- **Webhook Processing & Idempotency**: Stripe webhook events (`checkout.session.completed`, `account.updated`) verify the webhook signature and store processed event IDs in a `ProcessedWebhookEvents` table to prevent duplicate handling.
- **Cash on Delivery (COD)**: Supports COD checkout, tracking pending platform commissions and vendor balances accordingly.
- **Local Dev Fallback**: A configuration flag (`AllowTestCheckoutWithoutSeller`) allows testing end-to-end checkout on demo restaurants without live Stripe accounts.

### 7. Admin Finance & Platform Operations
- **Merchant Approval Workflow**: Admins review pending vendor applications with endpoints to approve, reject (with reason), or suspend accounts.
- **Custom Commission Rates**: Admins can set per-merchant commission percentages (defaults to 10%).
- **Financial Overview**: Platform-wide metrics including Gross Merchandise Value (GMV), net collected commission, total merchant earnings, and outstanding balances.
- **Payout Settlement**: Manual and batch payout recording with reference numbers and notes to reconcile merchant bank transfers and settle balances.

### 8. Global Search & Reviews
- **Unified Catalog Search**: Single search endpoint querying restaurants and dishes by text, category, price range, and minimum rating, sorted by nearest location.
- **Verified Reviews**: Customers can submit star ratings (1-5) and written reviews only for orders they have actually received (`Delivered`). Restaurant average rating and review counts update automatically.

---

## API Endpoints Summary

### Auth (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register-customer` | Register a new customer |
| `POST` | `/api/auth/register-restaurant-owner` | Register a vendor and restaurant |
| `POST` | `/api/auth/login` | Login and get JWT + refresh token |
| `POST` | `/api/auth/refresh-token` | Rotate refresh token and get new JWT |
| `POST` | `/api/auth/logout` | Revoke current refresh token |
| `GET` | `/api/auth/me` | Get current user profile and claims |

### Restaurants & Dishes (`/api/restaurants`, `/api/dishes`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/restaurants` | List restaurants (paginated, proximity sorted) |
| `GET` | `/api/restaurants/{id}` | Get restaurant details and menu |
| `GET` | `/api/dishes/{id}` | Get dish details |

### Vendor Dashboard (`/api/vendor`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/vendor/stats` | Vendor sales and order overview |
| `GET` | `/api/vendor/orders` | List vendor orders (filterable by status) |
| `PATCH` | `/api/vendor/orders/{id}/status` | Advance order status |
| `GET` | `/api/vendor/settings` | Get restaurant operating configuration |
| `PUT` | `/api/vendor/settings` | Update hours, radius, address, and coordinates |
| `POST` | `/api/vendor/media` | Upload restaurant logo and cover image |
| `GET` | `/api/vendor/dishes` | List vendor's dishes |
| `POST` | `/api/vendor/dishes` | Create dish with optional image upload |
| `POST` | `/api/vendor/stripe/onboard` | Generate Stripe Express onboarding link |
| `GET` | `/api/vendor/stripe/status` | Check Stripe account verification status |

### Cart (`/api/cart`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current user's cart |
| `POST` | `/api/cart/items` | Add item (validates single-vendor rule) |
| `PUT` | `/api/cart/items/{dishId}` | Update item quantity |
| `DELETE` | `/api/cart/items/{dishId}` | Remove item from cart |
| `DELETE` | `/api/cart` | Clear cart |

### Orders & Payments (`/api/orders`, `/api/payments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders/checkout` | Create order (COD or Card) |
| `GET` | `/api/orders/my-orders` | Paginated customer order history |
| `POST` | `/api/payments/checkout-session` | Create Stripe checkout session for order |
| `GET` | `/api/payments/order/{orderId}` | Check payment record status |
| `POST` | `/api/payments/webhook` | Handle Stripe webhooks (public, signature verified) |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/merchants` | List merchants with status filter |
| `PUT` | `/api/admin/merchants/{id}/approve` | Approve a vendor profile |
| `PUT` | `/api/admin/merchants/{id}/reject` | Reject vendor application with reason |
| `PUT` | `/api/admin/merchants/{id}/toggle-status` | Toggle active status |
| `GET` | `/api/admin/finance/overview` | Platform financial overview |
| `GET` | `/api/admin/finance/merchants` | Merchant account balances |
| `PUT` | `/api/admin/merchants/{id}/commission` | Update merchant commission rate |
| `POST` | `/api/admin/finance/payout` | Record merchant payout and settle balance |

### Search, Locations & Reviews (`/api/search`, `/api/locations`, `/api/reviews`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/search` | Search catalog with distance and price filters |
| `GET` | `/api/search/categories` | Get dynamic list of active food categories |
| `POST` | `/api/locations/customer` | Save customer delivery coordinates and label |
| `POST` | `/api/reviews` | Submit order review and rating |

---

## Rate Limiting

The API defines four rate-limiting policies in `Program.cs` using ASP.NET Core RateLimiter:

- **`auth-policy`**: 5 requests / min per IP (protects login and register endpoints).
- **`checkout-policy`**: 3 requests / min per User/IP (prevents checkout spam).
- **`search-policy`**: 30 requests / min per IP (protects search queries from scraping).
- **`reviews-policy`**: 5 requests / min per User (prevents automated review flooding).

---

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- SQL Server (LocalDB or full instance)
- Redis (optional — falls back to in-memory cache if not running)

### Configuration
Update `Multi-Vendor Marketplace.Api/appsettings.json` with your database and Stripe credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MarketplaceDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
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

### Running the Project

```bash
# Restore dependencies and build
dotnet build

# Run unit tests
dotnet test

# Run the API
dotnet run --project "Multi-Vendor Marketplace.Api"
```

Once running:
- **API URL**: `http://localhost:5107`
- **Swagger Docs**: `http://localhost:5107/swagger`
- **SignalR Orders Hub**: `http://localhost:5107/hubs/orders`

On initial startup, `MarketplaceDataSeeder` automatically seeds default roles (`Admin`, `ResturantOwner`, `Customer`), permissions, and 40 demo restaurants with menus and Cairo-based coordinates.

---

## Running Tests

The test suite covers Stripe Checkout sessions, webhook verification, and vendor payout logic:

```bash
dotnet test "Multi-Vendor Marketplace.Application.Tests"
```
