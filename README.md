# 🏦 Simple Bank - Frontend

A lightweight banking app frontend built with **HTML, CSS, and JavaScript**, designed to work **only with the [simple-bank-be](https://github.com/tDm213/simple-bank-be) backend**. Includes login, signup, dashboard, transactions, and pending request management.

---

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [License](#license)

---

## Demo

💻 This project can be run locally and communicates with a backend server at `http://localhost:3001/api`.  
Runs on the `http://localhost:3000`
---

## Features

- ✅ Login and signup forms  
- ✅ JWT authentication stored in localStorage  
- ✅ Dashboard showing user balance and info  
- ✅ Send and request money  
- ✅ Approve/reject pending requests  
- ✅ Transaction history with timestamps  
- ✅ Tab-based UI for different sections  
- ✅ Auto-refresh for pending requests and history  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/simple-bank-fe.git
cd simple-bank-fe
npm install
```

Make sure your backend is running (default: http://localhost:3001/api).


## Usage
- Login / Signup
- Enter username and password to create an account or log in.
- Dashboard
- View balance and transaction history.
- Send or request money to/from other users.
- Approve or reject pending requests.
- Auto-refresh
- Dashboard updates pending requests and history every 5 seconds.


## API Integration

Base URL: http://localhost:3001/api

Endpoints Used:
```
/auth/login - Login

/auth/signup - Signup

/user/me - Get current user info

/transactions/send - Send money

/transactions/request - Request money

/transactions/request/approve - Approve request

/transactions/request/reject - Reject request

/transactions/history - Transaction history
```
JWT tokens are stored in localStorage and automatically added to requests

✍️ Author Made by @tDm213