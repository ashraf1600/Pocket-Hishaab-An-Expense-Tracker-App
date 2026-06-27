from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, categories, accounts, transactions, budgets, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Tracker API",
    description="Pocket Hisaab clone backend",
    version="1.0.0"
)

# ✅ CORS Middleware – MUST BE BEFORE ROUTES
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://localhost:3000",   # React default
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"  # ⚠️ For development only – remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers AFTER CORS
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {"message": "Expense Tracker API", "docs": "/docs"}