# 🛡️ GoDoz Technology - Project Rules & Guidelines
> **Owner:** RS GULSHAN PRAJAPATI  
> **Website:** [www.godoz.in](https://www.godoz.in)  

---

> [!CAUTION]
> ## 🚨 MANDATORY AI / DEVELOPER RULE FOR THIS MD FILE
> **AI YA DEVELOPER IS MD FILE MEIN SE KOI BHI PURANA LINE, USER KA WRITTEN POINT, YA FEATURE DELETE / REMOVE NAHI KAREGA!**  
> **NAYE POINTS YA EXPANSIONS HAMESHA NEECHE ALAG NAYE LINES (NEW LINES) MEIN HI ADD AUR EDIT KIYE JAYENGE. USER KE LIKHE HUYE EK BHI POINT KO KATNA YA DELETE KARNA SAKHT MANA HAI!**

---

> [!IMPORTANT]
> ## 🚨 SABSE ZAROORI RULE: STRICT NO-DELETION POLICY
> **IS PROJECT MEIN KOI BHI NAYA FEATURE ADD YA UPDATE KIYA JA SAKTA HAI, LEKIN KISI BHI PURANE FEATURE, CODE, FIRESTORE RULE, YA FUNCTIONALITY KO DELETE / REMOVE SIRF AUR SIRF FOUNDER (RS GULSHAN PRAJAPATI) KE EK-EK DIRECTION PAR HI KIYA JAYEGA!**
>
> **Bina specially kahe kisi bhi purane feature, modal, button, ya code ko delete karna SAKHT MANA HAI!**

---
>## Dhyan rakhne yogy bate.
> placeholder me kabhi ki kisi ka niji jnkari na ho jaise kisi ka name ya Number etc.
---

## 👥 ROLE PERMISSIONS MATRIX (KAUN KYA KAR SAKTA HAI)

### 👑 1. MANAGER / OWNER (Master Owner - RS GULSHAN PRAJAPATI)
- **1. Firebase-Console Role Security:** Manager/Owner role sirf Firebase Console (`/managers` collection) se hi create, update, ya delete kiya ja sakta hai. Web code ya client-side se Manager role banana 100% BLOCKED hai.
- **2. Full System Rights:** Manager / Owner ke paas poore system ki 100% FULL PERMISSIONS hain.
- **3. Staff Management:** Sirf Manager hi naye Support Admins (Staff) ko add, edit, assign, ya remove kar sakta hai.
- **4. All Orders Visibility & Assignment:** Company ke sabhi clients ke **SABHI ORDERS** dekh sakta hai aur specific Admin/Staff ko assign kar sakta hai.
- **5. All Payments & Ledger:** Company ki **SABHI PAYMENTS, RECEIPTS & FINANCIALS** dekh aur audit kar sakta hai.
- **6. All Leads & Inquiries:** Website ke **SAARE CONTACT LEADS & INQUIRIES** dekh sakta hai aur staff ko assign kar sakta hai.
- **7. Promo Coupons Engine:** Master Manager hi Promo Coupons/Discounts ko **Create, Edit, Activate, aur Inactivate** kar sakta hai.
- **8. System & Gateway Settings:** Live Razorpay API Keys (`RAZORPAY_CONFIG`) aur System Settings sirf Manager hi update kar sakta hai.

---

### 🛡️ 2. ADMIN (Assigned Support Staff / Agent)
- **1. Limited Staff Access:** Admin ke paas strictly limited permissions rehti hain.
- **2. Assigned Orders Only:** Admin **SIRF WAHI ORDERS** dekh sakta hai jo Manager ne uske email par assign kiye hain (Doosre staff ke orders dekhna blocked hai).
- **3. Assigned Client Details Only:** Admin sirf apne assigned clients ki contact info dekh sakta hai.
- **4. Progress & Links Update Only:** Admin assigned order ka **Sprint Stage, Progress (%), aur Preview/Deliverable Links** update kar sakta hai.
- **5. 🔒 NO FINANCIAL EDIT PERMISSION:** Admin **PAISE KE MAMLE MEIN KUCHH BHI EDIT/UPDATE NAHI KAR SAKTA** (Price, Amount Paid, Remaining Balance, Payment History 100% Locked hain).
- **6. View Promo Coupons:** Sabhi promo coupons dekh sakta hai taaki clients ko discount codes offer kar sake.

---

### 👤 3. CLIENT / USER (Public Client Partner)
- **1. Website Exploration:** Website par Services, Apps Hub, aur Project Cost Calculator use kar sakta hai.
- **2. Send Requirements & Inquiries:** Chat ya contact form se project scope aur discussion request bhej sakta hai.
- **3. Order Creation:** Naya project order place kar sakta hai (`amountPaid = 0` aur `progress = 5%` ke sath).
- **4. Multiple Payment Methods:** Razorpay (UPI, Cards, Netbanking) ya PAD (Pay After Demo) se payment kar sakta hai.
- **5. Own Orders Only:** Client Portal (`profile.html`) par **SIRF APNE APNE ORDERS** dekh sakta hai (Doosre clients ke orders 100% Hidden hain).
- **6. Own Payments & Receipts:** Sirf apne payments aur 1-Click PDF Receipts dekh & download kar sakta hai.
- **7. Reviews & Ratings:** Apne completed projects ke liye official reviews submit kar sakta hai.
- **8. Order Booking Form Structure (Contact Details First Flow):**
  - 👤 **1. Your Name & Contact Info `*`:** Full Name, WhatsApp Phone, aur Email Address *(Client Portal account link karne ke liye Required)*.
  - 📦 **2. Choose Project Category & Scope (Grouped Together):** Category Dropdown + Merged Project Scope, Features & Requirements Box *(Category select karke usi ke niche custom scope/features enter karne ke liye)*.
  - 💳 **3. Choose Payment & Milestone Method `*`:**
    - **Option A: Razorpay (% Advance Payment - Min 10% to 50%):** Online instant advance pay via UPI (GPay/PhonePe), Cards, Netbanking.
    - **Option B: Pay After Demo (PAD - ₹0 Upfront):** ₹0 advance me booking, live beta demo test karne ke baad payment.
  - 🎟️ **Promo Code / Discount Coupon (Optional):** Promo code enter karke total bill par instant discount pane ke liye.

---

## 🌐 WEBSITE KE SARE MAIN PAGES AUR KYA-KYA FEATURES HAIN

### 1. 🏠 Main Homepage (`index.html`)
- **Branded Header Navigation:** Mobile Slide-out Drawer Menu + Desktop Menu + Track Order Button + Client Portal + Dark/Light Theme Toggle + WhatsApp Support.
- **Hero Section:** High-converting CTA buttons (*Explore Services*, *Calculate Project Cost*, *Order App*).
- **Services Offered:** 6 Core Software & App Development categories with scope and feature details.
- **Apps & Portfolio Hub:** Interactive showcase of GoDoz published Android apps (*Smart PDF Viewer*, *MyNotepad*, *Bhulekh*, *LocalWork*, *Fruits Crush*).
- **Project Cost Calculator:** Real-time quote generator for custom Android apps, web portals, POS software, and maintenance plans.
- **Live Web Tools:** Built-in utility tools (QR Code Generator, PDF Viewer/Compressor, Unit Calculators).
- **Why Choose GoDoz & Founder Info:** Official developer bio of RS GULSHAN PRAJAPATI, tech stack, cloud infrastructure, and company credentials.
- **Client Testimonials:** Dynamic reviews carousel with ratings.

### 2. 🛠️ Admin Dashboard (`admin.html`)
- **Assigned Orders Table:** Shows orders assigned to the logged-in support admin.
- **Quick Status Filters:** Status Chips (*All*, *Active*, *On Hold*, *Completed*, *Cancelled*, *PAD Requested/Accepted*).
- **Sprint Stage & Progress Editor:** Single choose-and-type input connected to stage presets. Auto-detects progress % (5%, 15%, 35%, 65%, 85%, 100%).
- **Dynamic Multiple Deliverables Builder:** Add multiple labeled preview links (*Beta APK*, *Web Demo*, *Figma*, *Drive*, *Docs*).
- **Client Actions:** One-click Call, Email, and WhatsApp Notice triggers (*Status Update*, *Hold Notice*, *Cancellation Notice*).
- **Transaction History Modal (`View Txns`):** View full payment breakdown, milestone payments, and receipt links.
- **Inquiries Table:** View assigned client leads and inquiry messages.

### 3. 👑 Manager Command Center (`manager.html`)
- **Full Company Overview:** View all orders, revenue, active sprints, and pending PAD requests across the entire company.
- **🎁 Product & Pricing Catalog Manager (`/products/{productId}`):** Manage individual product & service documents in dedicated `/products/` collection. Add, edit, or delete individual product documents (Title, Details, Dusre Jagah Price ₹, Yaha Price ₹) with live real-time sync to `index.html`.
- **🧮 Cost Estimator Features & Modules (`/estimator_features/`):** Manage feature add-on prices (+₹2,000, +₹3,000) and express delivery timeline rates in dedicated `/estimator_features/` collection.
- **🎉 Special Festive Offers (`/special_offers/`):** Activate site-wide festival/event offer banners (e.g. *Birthday Offer*, *Diwali Deal*) with extra discount % stored in dedicated `/special_offers/` collection.
- **Order Assignment Manager:** Assign or re-assign specific support staff/admins to any order.
- **Lead / Inquiry Assignment:** Assign incoming contact leads to specific support admins.
- **Staff Management (`addAdminModal`):** Add, view, and remove support staff accounts.
- **Promo Coupon Engine (`createCouponModal`):** Create flat or percentage discount coupons, set minimum order amounts, and toggle Active/Inactive status.
- **System Settings (`/settings/`):** View and update live Razorpay Key IDs (`RAZORPAY_CONFIG.keyId`) in a 100% private, staff-protected `/settings/` collection.

### 4. 👤 Client Portal (`profile.html`)
- **Authentication System:** Support for Google Sign-In, Email/Password login, and Guest Login.
- **My Products & Active Projects:** Card view of all client orders with real-time sprint stage, progress bar, and assigned engineer info.
- **Deliverable Links Toolbar:** Direct action buttons for all uploaded preview links (*Beta APK*, *Live Preview*, *Figma*, *Drive*).
- **Pay Balance / Installment Trigger (`Pay More`):** Open Razorpay checkout modal to pay partial milestone payments or remaining balance.
- **Transaction History Ledger:** Full list of all verified milestone payments with date, mode, amount, and receipt links.

### 5. 📑 Payment Receipt & PDF Generator (`payment-success.html`)
- **Server Verification Status:** Confirms payment record from Razorpay and Firestore `payments` collection.
- **1-Click Executive A4 PDF Receipt:** Generate and download an official GoDoz Technology Tax Invoice & Payment Receipt PDF in 1 click.
- **Universal Scannable QR Code:** Scannable QR Code containing full receipt verification parameters (`payment_id`, `order_id`, `amount`, `client_name`, `time`).
- **Universal Access (No Login Required):** Scanning the QR Code on any phone camera opens the verified receipt page with all parameters populated and PDF download ready.

### 6. 🔍 Universal Live Order Tracker (`trackOrderModal`)
- **Header Modal Trigger:** Accessible from header navigation on all pages.
- **Instant Search:** Enter 10-digit Phone Number or Order ID (`GoDoz-2026-...`) to view live engineering progress, stepper status, and preview links.

---

## 🔒 SECURITY & DATA INTEGRITY RULES SUMMARY

1. **100% Financial Lock:** `price`, `amountPaid`, `remainingBalance`, `paymentHistory` are immutable in `firestore.rules`.
2. **Progress Preservation:** Cancelling or holding an order preserves the actual development progress % (*e.g. 85%*) so it is clear at what stage the project was paused.
3. **No Unrequested Deletion:** Never delete existing code, modals, buttons, or rules unless explicitly instructed by Founder RS GULSHAN PRAJAPATI.

---
*Official Master Architecture & Guidelines Sealed for GoDoz Technology Web Application.*
