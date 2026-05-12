# <img src="../public/xiaoba.jpeg" width="40" height="40" style="vertical-align: middle; border-radius: 50%;"> Xiaoba Delivery

A lightweight, full-process food delivery demonstration system built with **React** + **Tailwind CSS**. No backend database required—runs instantly in your browser with automatic data persistence.

[简体中文](../README.md) | [繁體中文](./README_TW.md)

---

## 🌟 Project Highlights

- **Full Workflow Simulation**: Covers everything from merchant product listing and user checkout to rider delivery confirmation.
- **Three-in-One Interface**: Includes User, Merchant, and Rider roles in a single app with seamless switching.
- **Zero Configuration**: Uses `localStorage` to simulate a database. Your data persists even after page refreshes!
- **Modern Experience**: Responsive design for mobile and desktop with a clean blue-themed UI.

---

## 🚀 Quick Start

### 1. Install Node.js
Please install [Node.js](https://nodejs.org/zh-cn) first (LTS version recommended).

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Project
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser to start.

---

## 📱 Role Description

### 🙋‍♂️ User
- **Browse Products**: View various delicacies listed by the merchant.
- **One-Click Checkout**: Fill in delivery address, contact information, and notes.
- **Instant Payment**: Simulate a real payment process.
- **Order Tracking**: Real-time status updates (Pending, Preparing, Delivering, Completed).
- **Reviews**: Post, edit, or delete reviews after the meal.

### 🏪 Merchant
- **Product Management**: Upload local images, modify prices, adjust stock, and toggle product status.
- **Order Processing**: Receive new orders and notify riders when food is ready.
- **Review Monitoring**: View feedback from customers.

### 🛵 Rider
- **Order Pickup Center**: View tasks ready for delivery.
- **Delivery Details**: Access customer name, phone, and address.
- **Delivery Confirmation**: Confirm delivery with a single click.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Persistence**: Browser LocalStorage
- **Build Tool**: Vite

---

## ❓ FAQ

**Q: Why no database?**
A: For easy demonstration on GitHub. Using `localStorage` allows anyone to run the project instantly without setting up MySQL or MongoDB. It is perfect for portfolio showcases.

**Q: How to switch roles?**
A: Use the [User] [Merchant] [Rider] toggle buttons at the top of the header.

---

Hope this project helps you better showcase your creativity! If you have any suggestions, feel free to open an Issue.
