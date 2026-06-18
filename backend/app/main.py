from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, categories, accounts, transactions, budgets, reports

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Tracker API",
    description="Pocket Hisaab clone backend",
    version="1.0.0"
)

# CORS - allow React & Flutter to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
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