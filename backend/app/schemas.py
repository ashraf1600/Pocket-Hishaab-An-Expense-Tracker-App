from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List
from enum import Enum

# --- Enums ---
class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class AccountType(str, Enum):
    CASH = "cash"
    BANK = "bank"
    CREDIT_CARD = "credit_card"

class BudgetPeriod(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

# --- User Schemas (existing) ---
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    currency: str
    created_at: datetime

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    type: TransactionType
    icon: Optional[str] = "tag"
    color: Optional[str] = "#808080"

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    user_id: int
    is_default: int

    class Config:
        orm_mode = True

# --- Account Schemas ---
class AccountBase(BaseModel):
    name: str
    type: AccountType
    balance: Optional[float] = 0.0
    currency: Optional[str] = "BDT"

class AccountCreate(AccountBase):
    pass

class AccountOut(AccountBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    account_id: int
    category_id: int
    amount: float = Field(gt=0)
    type: TransactionType
    description: Optional[str] = None
    date: date

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    account: Optional[AccountOut] = None
    category: Optional[CategoryOut] = None
    

    class Config:
        orm_mode = True

# --- Budget Schemas ---
class BudgetBase(BaseModel):
    category_id: int
    amount: float = Field(gt=0)
    period: BudgetPeriod = BudgetPeriod.MONTHLY
    start_date: date
    end_date: Optional[date] = None

class BudgetCreate(BudgetBase):
    pass

class BudgetOut(BudgetBase):
    id: int
    user_id: int
    spent: Optional[float] = 0.0
    remaining: Optional[float] = 0.0
    percentage_used: Optional[float] = 0.0

    class Config:
        orm_mode = True

# --- Report Schemas ---
class SpendingByCategory(BaseModel):
    category_name: str
    total: float
    percentage: float

class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    recent_transactions: List[TransactionOut]
    spending_by_category: List[SpendingByCategory]