# 💰 Pocket Hisaab – Expense Tracker App

A modern full-stack expense tracking application built with **FastAPI**, **React**, and **Flutter (planned)**.

Pocket Hisaab helps users manage personal finances by tracking income, expenses, budgets, and accounts through a clean and intuitive dashboard.

---

## 📸 Screenshots

### Dashboard

![Pocket Hisaab Dashboard](./Demo_UI/Pocket_Hishaab_1.png)

> Add more screenshots inside the `Demo_UI` folder and update this section as the project grows.

---

## 🚀 Features

### 🧾 Transaction Management

* Add income and expense transactions
* View complete transaction history
* Delete transactions
* Filter transactions by date and type
* Automatic balance updates

### 📊 Dashboard & Analytics

* Total income overview
* Total expense overview
* Current balance summary
* Recent transactions
* Category-wise expense breakdown
* Visual charts and statistics

### 🗂️ Categories

* Create custom categories
* Income and expense categories
* Category icons and colors
* Easy category management

### 🏦 Accounts

* Multiple account support
* Cash accounts
* Bank accounts
* Credit card accounts
* Account-wise balance tracking

### 💰 Budget Management

* Monthly budgets
* Yearly budgets
* Budget utilization tracking
* Progress indicators

### 🔐 Authentication & Security

* User registration
* Secure login system
* JWT authentication
* Password hashing using bcrypt
* Protected API routes
* User-specific data isolation

---

## 🛠️ Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| Backend        | FastAPI, SQLAlchemy, Pydantic                 |
| Database       | SQLite (Development), PostgreSQL (Production) |
| Authentication | JWT, bcrypt                                   |
| Frontend       | React, React Router                           |
| UI Framework   | Bootstrap                                     |
| Charts         | Recharts                                      |
| HTTP Client    | Axios                                         |
| Notifications  | React Hot Toast                               |
| Mobile         | Flutter (Planned)                             |
| Deployment     | Render, Railway, Vercel, Netlify              |

---

## 📂 Project Structure

```text
Pocket-Hisaab/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── layouts/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── Demo_UI/
│   └── Pocket_Hishaab_1.png
│
└── README.md
```

## ⚙️ Backend Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/pocket-hisaab.git
cd pocket-hisaab
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / Mac

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=sqlite:///./pocket_hisaab.db

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 6. Run Server

```bash
uvicorn app.main:app --reload
```

Server will run at:

```text
http://localhost:8000
```

API Docs:

```text
http://localhost:8000/docs
```

---

## 🎨 Frontend Setup

### Navigate to Frontend

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

## 🗄️ Database Schema

### User

* id
* username
* email
* password_hash
* created_at

### Account

* id
* name
* type
* balance
* user_id

### Category

* id
* name
* type
* color
* icon
* user_id

### Transaction

* id
* amount
* type
* description
* transaction_date
* account_id
* category_id

### Budget

* id
* category_id
* limit_amount
* period
* start_date
* end_date

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /auth/register |
| POST   | /auth/login    |
| GET    | /auth/me       |

### Transactions

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | /transactions      |
| POST   | /transactions      |
| DELETE | /transactions/{id} |

### Categories

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | /categories      |
| POST   | /categories      |
| PUT    | /categories/{id} |
| DELETE | /categories/{id} |

### Accounts

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /accounts      |
| POST   | /accounts      |
| PUT    | /accounts/{id} |
| DELETE | /accounts/{id} |

### Budgets

| Method | Endpoint      |
| ------ | ------------- |
| GET    | /budgets      |
| POST   | /budgets      |
| PUT    | /budgets/{id} |
| DELETE | /budgets/{id} |

---

## 🚀 Deployment

### Backend

* Render
* Railway

### Frontend

* Vercel
* Netlify

---

## 🔮 Future Enhancements

* Flutter Mobile App
* Dark Mode
* Recurring Transactions
* CSV Import & Export
* Multi-Currency Support
* Financial Reports
* AI Expense Insights
* Email Notifications
* Expense Forecasting

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ashraful Islam**

* CSE Student, CUET
* Full Stack Developer
* Future Data & AI Engineer

---

⭐ If you like this project, please consider giving it a star on GitHub.
