from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta
from .. import models, dependencies

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/dashboard")
def get_dashboard(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    today = date.today()
    month = month or today.month
    year = year or today.year

    try:
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month or year")

    # Income
    total_income = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == "income",
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).scalar() or 0.0

    # Expense
    total_expense = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == "expense",
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).scalar() or 0.0

    # Recent transactions – build dict manually
    recent_txns = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).order_by(models.Transaction.date.desc()).limit(10).all()

    recent_transactions = []
    for txn in recent_txns:
        recent_transactions.append({
            "id": txn.id,
            "account_id": txn.account_id,
            "category_id": txn.category_id,
            "amount": float(txn.amount),
            "type": txn.type,
            "description": txn.description,
            "date": txn.date.isoformat(),
            "created_at": txn.created_at.isoformat(),
            "user_id": txn.user_id,
            # optionally load account/category names if you need them
        })

    # Spending by category
    category_spending = db.query(
        models.Category.name,
        func.sum(models.Transaction.amount).label('total')
    ).join(
        models.Transaction,
        models.Transaction.category_id == models.Category.id
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.type == "expense",
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).group_by(models.Category.name).all()

    total_exp = total_expense if total_expense > 0 else 1
    spending = []
    for cat in category_spending:
        spending.append({
            "category_name": cat.name,
            "total": float(cat.total),
            "percentage": (float(cat.total) / total_exp) * 100
        })

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "recent_transactions": recent_transactions,
        "spending_by_category": spending
    }