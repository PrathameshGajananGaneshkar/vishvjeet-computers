# Vishvjeet Computer — E-Commerce & IT Services

A modern, production-grade e-commerce marketplace and computer repair booking web application built for **Vishvjeet Computer**, based in Chikhli, Buldhana, Maharashtra, India.

## 🚀 Key Features

- **Product Catalogue**: Laptops, Desktops, Printers, CCTV Surveillance, Toners & Cartridges, Computer Accessories, and Networking hardware.
- **Detailed Specifications**: Authentic specs including RAM, SSD, CPU, printer ppm, toner page yields, lens mounts, and CCTV night vision ranges.
- **Smart Search & Filters**: Brand filters, price slider, in-stock filter, star ratings, sort by price/rating/newest, live autocomplete search.
- **Delivery Availability**: PIN code checker with specialized delivery estimates for Chikhli (`443201`), Buldhana district, Maharashtra, and all-India.
- **Product Details & Comparison**: Multi-image zoom gallery, verified compatible accessories (e.g. matching toner for printers), customer reviews, side-by-side comparison for up to 4 products.
- **Shopping Cart & Coupons**: Dynamic totals, automated GST 18% calculation, free delivery threshold indicator, valid coupon validation (`VISHVJEET10`, `FIRST500`, `CHIKHLI200`).
- **Multi-step Checkout & Razorpay**: Multi-step checkout with doorstep courier delivery or store pickup at Chikhli shop; Razorpay test/live gateway integration with HMAC signature verification, test payment simulation, and Cash on Delivery option.
- **Computer Repair & IT Services**: Dedicated booking for chip-level repair, Crucial SSD/RAM speed upgrades, Windows formatting, printer toner refilling, and CCTV installation with unique ticket generation (`VC-SRV-2026-XXXX`) and live ticket status tracking.
- **Tax Invoices**: Downloadable and printable GST-compliant invoices with HSN codes, SGST/CGST breakdown, and authorized signatory.
- **Admin Management Console**: Overview analytics, revenue metrics, low stock watchlists, product management (add/edit/delete/CSV export), order dispatch & courier tracking, service job sheets, and store configuration.
- **Bilingual English & Marathi (मराठी)**: Seamless switch between English and Marathi for all navigation, product info, order status, and checkout.
- **Chikhli Local Store Integration**: Click-to-call and direct WhatsApp inquiry for the physical store at Shop No. 4, Shivaji Complex, Main Road, Chikhli.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express, Vite middlewares for dev, standard Crypto for Razorpay HMAC-SHA256 signature verification.
- **Database & Security**: Structured intermediate blueprint in `firebase-blueprint.json` and hardened `firestore.rules`.
- **Payment Gateway**: Official Razorpay Orders API (`/api/razorpay/create-order`) and signature verification (`/api/razorpay/verify`).

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Razorpay Credentials (from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Vishvjeet Computer Store Contact
STORE_NAME="Vishvjeet Computer"
STORE_PHONE="+91 89566 64295"
STORE_WHATSAPP="+918956664295"
STORE_EMAIL="vishwajeetnanhai199@gmail.com"
STORE_ADDRESS="Shop No. 4, Shivaji Complex, Main Road, Chikhli, Buldhana - 443201, Maharashtra"
```

---

## 📦 Running the Application Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the full-stack development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. Build for production:
   ```bash
   npm run build
   ```

4. Run production server:
   ```bash
   npm start
   ```

---

## 💳 Razorpay Test Mode Setup

1. Sign up on [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** from the top header.
3. Generate API Keys in **Settings > API Keys**.
4. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your `.env`.
5. The application will securely call `/api/razorpay/create-order` and verify payment signatures on the backend before marking orders as paid.
6. When keys are unconfigured, the app runs in built-in **Test Sandbox Mode** allowing full verification testing without blocking checkout.

---

## 🛡️ Admin Access

- Access the Admin Portal by clicking the user icon or **Admin Portal** in the account menu.
- Quick 1-click evaluation access is available in the login dialog or with credentials:
  - **Email**: `admin@vishvjeet.com` or `p.ganeshkar8788@gmail.com`
  - **Password**: Any password in demo mode
