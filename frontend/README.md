# Talabli - Frontend Application

Web frontend for **Talabli**, a multi-vendor food delivery platform. Built with React 19, Vite, Tailwind CSS v4, and integrated with an ASP.NET Core backend using REST APIs and SignalR for real-time order updates.

---

## Tech Stack

| Layer / Tool | Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | React 19 | Client-side SPA with hooks and context |
| **Build Tool** | Vite 8 | Fast HMR and lightweight production builds |
| **Styling** | Tailwind CSS v4 | Utility-first styling with `@tailwindcss/vite` |
| **Routing** | React Router v7 | Protected role-based route guards and lazy-loaded routes |
| **Real-time** | `@microsoft/signalr` | WebSocket connection for live order events and kitchen bells |
| **Maps** | Leaflet & React-Leaflet | Pin-drop address selector and OpenStreetMap tiles |
| **HTTP Client** | Axios | Configured with JWT interceptors and validation error parsing |
| **Icons** | Lucide React | Clean, consistent UI icon set |
| **Audio** | Web Audio API | Zero-asset synthetic audio chimes (no static MP3 assets needed) |

---

## Architecture & Portals

The application is structured into three isolated portals protected by role guards (`ProtectedRoute`):

```
                     ┌───────────────────────────────────┐
                     │            App Contexts           │
                     │  AuthContext · Cart · Location    │
                     └─────────────────┬─────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
  Customer Portal                Vendor Portal                   Admin Portal
  Public / Customer              Requires Vendor Role            Requires Admin Role
  (/, /search, /checkout)        (/vendor/orders, /menu)         (/admin, /merchants)
```

---

## Key Features

### 1. Customer Experience

- **Guest Cart with Auto-Migration**:
  - Customers can browse menus and add items without creating an account first.
  - Guest carts are stored locally with a 24-hour time-to-live (`TTL`). Stale carts are cleaned up automatically.
  - Enforces a single-restaurant rule (shows a clear replacement prompt if the user picks items from another restaurant).
  - When a guest proceeds to checkout and logs in or registers, their local cart items are synced sequentially to the backend cache, preserving their selections without losing their place.
  - Local cart storage is cleared on logout to prevent cross-account leakage.

- **Location & Pin-Drop Map**:
  - Interactive map powered by Leaflet to pin exact delivery coordinates.
  - Guests can select their location upfront to receive accurate, proximity-filtered restaurant lists (calculated via backend Haversine distance).
  - Upon logging in, any guest pin is saved to the customer's profile via `POST /api/locations/customer` in the background.

- **Search & Filtering**:
  - Live header search bar with debounced auto-complete.
  - Search page (`/search`) supporting cuisine tags, minimum rating, and delivery radius filters.
  - Restaurant detail page with categorized menus, dietary tags, and fallback image handling.

- **Checkout & Payments**:
  - Cash on Delivery (COD) and online card payments via Stripe.
  - Stripe flow redirects through Stripe Checkout and returns to `/payment/success`, which polls the order status until confirmed.

- **Live Order Tracking**:
  - Order status stepper (`Placed` -> `Processing` -> `Shipped` -> `Delivered`).
  - Active steps light up in real-time as the vendor advances the kitchen ticket.
  - Post-delivery rating and review modal.

---

### 2. Vendor Portal

- **Live Kitchen Board (`/vendor/orders`)**:
  - Real-time order cards showing item quantities, notes, customer details, and payment method.
  - Tabbed filters with live order counters (*All*, *Pending*, *Preparing*, *Out for Delivery*, *Delivered*, *Cancelled*).
  - Progressive status action button that steps through the workflow linearly:
    - `Pending` &rarr; **Start Preparing** (`Processing`)
    - `Processing` &rarr; **Hand Over to Driver** (`Shipped`)
    - `Shipped` &rarr; **Mark Delivered** (`Delivered`)
  - Order cancellation is moved to a secondary card action with a confirmation modal to avoid accidental cancellations during rush hours.

- **Driver Dispatch & Map Sharing**:
  - Map modal displays the exact delivery coordinates and customer pin.
  - "Open in Google Maps" shortcut for couriers.
  - One-click WhatsApp message generator formatted with order ID, customer name, contact number, map link, items, and total COD amount.

- **Menu Management (`/vendor/menu`)**:
  - Add, edit, and categorize menu items.
  - Quick availability toggle to mark items sold-out without deleting them.

- **Restaurant Settings (`/vendor/settings`)**:
  - Update branch details, contact numbers, and cuisine categories.
  - Set opening/closing operational status with a single toggle.
  - Update store coordinates and delivery coverage.

---

### 3. Super Admin Portal

- **Operational & Financial KPIs (`/admin`)**:
  - Real-time metrics: Gross Merchandise Value (GMV), net platform commissions, active merchants, and total volume.

- **Merchant Management & KYC Review (`/admin/merchants`)**:
  - Overview table of partner restaurants with status filters (*Pending*, *Approved*, *Rejected*).
  - KYC document viewer to inspect national IDs, commercial registration certificates, and branch information.
  - Action buttons to approve, suspend, or reject applications with mandatory reason feedback.

- **Financial Settlements & Payouts (`/admin/finance`)**:
  - Account balances grouped by settlement status (pending payout vs settled).
  - Explicit LTR number formatting for all currency values to prevent BiDi text flipping.
  - Payout registration modal to record bank transfers and reference numbers.
  - One-click CSV export for offline accounting and reconciliation.

---

## Real-Time Architecture & Audio System

- **SignalR Hub (`orderHubService.js`)**:
  - Managed singleton WebSocket client with automatic reconnection logic.
  - Subscribed globally at the layout level (`CustomerLayout` and `VendorLayout`), so alerts trigger across all pages without dropping connections.
  - Joins scoped SignalR groups: `user_{userId}` for customers and `restaurant_{restaurantId}` for vendors.

- **Web Audio API Alerts (`soundEffects.js`)**:
  - Synthesizes notification tones in-memory using pure sine oscillators:
    - **Vendor**: Ascending three-tone kitchen chime (`E5` &rarr; `G#5` &rarr; `B5`) when a new order arrives.
    - **Customer**: Soft melodic two-tone chime when an order status updates.
  - Zero external sound files, 0ms latency, and immune to 404 or CORS issues.
  - Handles modern browser Autoplay Policies gracefully by unlocking the `AudioContext` on the first user interaction.

- **Floating Toasts (`RealtimeToast.jsx`)**:
  - Non-blocking glassmorphic notification that appears when an event occurs, with direct links to view the updated order.

---

## Project Structure

```
src/
├── assets/                 # Global styles, fonts, and static assets
├── components/
│   ├── shared/             # Reusable composite components (e.g. AuthSplitBanner)
│   └── ui/                 # Core UI building blocks (Button, Modal, Badge, Tabs, Toast)
├── context/
│   ├── AuthContext.jsx     # Session, JWT tokens, and user profile state
│   ├── CartContext.jsx     # Guest cart TTL, single-restaurant check, cache migration
│   └── LocationContext.jsx # Map pin management, geocoding, and guest migration
├── features/
│   ├── admin/              # Admin dashboard, merchant KYC, finance, and orders
│   ├── auth/               # Customer/vendor login and registration flows
│   ├── customer/           # Customer storefront, search, restaurant page, checkout, tracking
│   └── vendor/             # Vendor kitchen board, menu editor, and restaurant settings
├── hooks/
│   └── useOrderHub.js      # Hook wrapper for SignalR subscriptions
├── layouts/
│   ├── AdminLayout.jsx     # Admin shell navigation
│   ├── AuthLayout.jsx      # Authentication layout wrapper
│   ├── CustomerLayout.jsx  # Customer header, location bar, and global notifications
│   └── VendorLayout.jsx    # Vendor sidebar and kitchen bell listener
├── routes/
│   ├── AppRoutes.jsx       # Route registry with React.lazy code splitting
│   └── ProtectedRoute.jsx  # Role-based route guard
├── services/               # Modular REST API clients (Axios)
└── utils/                  # Currency formatting, audio engine, image URL helpers
```

---

## Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm**, **pnpm**, or **yarn**
- Running instance of the ASP.NET Core backend

### Installation

1. Navigate to the project directory:
   ```bash
   cd "Frontend/FoodMarketPlace"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=https://localhost:7001/api
   ```
   *(If omitted, defaults to `/api` or `http://localhost:5107/api`)*

4. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Build & Production

- Build production assets:
  ```bash
  npm run build
  ```
- Preview the production build locally:
  ```bash
  npm run preview
  ```

---

## License
Proprietary — Internal project for Talabli Marketplace.
