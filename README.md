# 📅 Event Management Platform – MVP Checklist

## 🎯 Objective

Create a simple and functional event management platform that allows:

- Event organizers to create and promote events.
- Attendees to browse and register for events.

---

## ✅ Core Features

### 🗂️ Feature 1: Event Discovery, Details, Creation, and Promotion (4 points)

- [x] Landing Page: Display a list of upcoming events.
- [x] Event Browsing: Customers can filter events by category/location and view details.
- [x] Search Bar with Debounce Functionality.
- [x] Fully Responsive Layout.
- [x] Event Creation: Organizers can add event details (name, price, dates, seats, description, ticket types, etc).
- [x] Pricing: Support for both free and paid events.
- [ ] Event-specific Voucher Promotions (start and end date).

---

### 💳 Feature 2: Event Transaction (4 points)

- [x] Ticket Purchasing: Customers can create ticket transactions.
- [x] Transaction Status System:
  - [x] `WAITING_PAYMENT`
  - [x] `WAITING_CONFIRMATION`
  - [x] `DONE`
  - [x] `REJECTED`
  - [x] `EXPIRED`
  - [x] `CANCELED`
- [x] Countdown Timer (2 hours) to upload payment proof after checkout.
- [x] Automatic Expiration if no proof after 2 hours.
- [] Automatic Cancellation if no action from organizer after 3 days.
- [ ] Rollbacks: Return points/vouchers/coupons and restore seats on `EXPIRED` or `CANCELED`.
- [ ] Point Usage: Deduct ticket price using available user points.
- [ ] Use only IDR as currency.

---

### 🌟 Feature 3: Event Reviews and Ratings (2 points)

- [ ] Customers can review/rate events **after attending**.
- [ ] Show organizer profile with average rating and reviews.

---

### 🔐 Feature 4: User Authentication and Authorization (2 points)

- [x] Account Creation required to attend events.
- [x] Role System:
  - [ ] Customer
  - [ ] Event Organizer
- [ ] Referral Registration support.
- [ ] Auto-generated referral code (immutable).
- [ ] Role-Based Page Protection.

---

### 🎁 Feature 5: Referral System, Profile, and Prizes (4 points)

- [ ] Referral Rewards:
  - [ ] Referrer gets **10,000 points** per successful invite.
  - [ ] New user gets a discount coupon.
- [ ] Points expire in 3 months.
- [ ] Coupons expire in 3 months.
- [ ] Profile Editing (both customer & organizer):
  - [ ] Update profile picture
  - [ ] Change password
  - [ ] Forgot/reset password

---

### 📊 Feature 6: Event Management Dashboard (4 points)

- [ ] Organizer Dashboard: Manage events, transactions, and statistics.
- [ ] Statistics Visualization by **year, month, day**.
- [ ] Transaction Management:
  - [ ] View proofs
  - [ ] Accept or reject transactions
- [ ] Email Notifications for accepted/rejected transactions.
- [ ] Rollback actions on rejection (return points, vouchers, and restore seats).
- [ ] View Attendee List per event:
  - [ ] Name
  - [ ] Ticket quantity
  - [ ] Total paid

---

## 🧠 Clues & Business Rules

- [ ] Voucher Discount = created by organizer, applies to their events only.
- [ ] Coupon/Reward Discount = system-generated, applies to all events.
- [ ] Use SQL Transaction on complex multi-step operations (e.g., rollback).
- [ ] Implement popup dialog for confirming data modification.
- [ ] Implement debounce in search.
- [ ] Handle empty search/filter results gracefully.
- [ ] All routes requiring authentication must be protected.
- [ ] All pages must be responsive.
- [ ] Create unit tests for each major flow.

---

📁 File ini bisa kamu simpan sebagai `README.md` atau `TODO.md` untuk tracking progress selama pengembangan proyek. Kalau mau dibagi jadi per role (dev backend/frontend), bisa aku bantu juga. Mau?
