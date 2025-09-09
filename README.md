
# 💸 Wallet App Backend

A simple and powerful 💼 **Digital Wallet Backend** built with **Node.js**, **Express**, and **PostgreSQL**. This service allows users to:

- 🧾 Register & login  
- 💰 Fund their wallet  
- 💸 Make payments  
- 🛍️ Buy products  
- 📜 View transaction history  
- 🌍 Convert currency via [CurrencyAPI](https://currencyapi.com)

---

## 📦 Installation

### 🔧 Step 1: Install Dependencies

```bash
npm install
```

### 📁 Step 2: Create a `.env` File

```env
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database_name
CURRENCY_API_KEY=your_currencyapi_key
```

> 💡 Get your currency API key from [https://currencyapi.com](https://currencyapi.com)

---

## 🛠️ Database Setup

Make sure PostgreSQL is installed and running. Then, run the SQL schema to set up the required tables:

```bash
psql -d your_database_name -f schema.sql
```

---

## 🚀 Start the Server

```bash
npm start
```

> 🖥️ The server will run at [http://localhost:3000](http://localhost:3000) by default.

---

## 📌 Features

- 🔐 **User Authentication**  
- 💳 **Wallet Funding & Payments**  
- 📈 **Transaction Logs**  
- 🛒 **Product Purchases**  
- 🔁 **Real-time Currency Conversion**

---

## 📚 Tech Stack

- **Backend:** Node.js + Express  
- **Database:** PostgreSQL  
- **API Integration:** CurrencyAPI

---

