from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import date
from .. import schemas, models, dependencies

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.post("/", response_model=schemas.BudgetOut)
def create_budget(
    budget: schemas.BudgetCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Verify category
    category = db.query(models.Category).filter(
        models.Category.id == budget.category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check duplicate
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.category_id == budget.category_id,
        models.Budget.period == budget.period,
        models.Budget.start_date == budget.start_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Budget already exists for this period")

    new_budget = models.Budget(
        user_id=current_user.id,
        **budget.dict()
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.get("/", response_model=List[schemas.BudgetOut])
def get_budgets(
    period: Optional[schemas.BudgetPeriod] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.Budget).filter(models.Budget.user_id == current_user.id)
    if period:
        query = query.filter(models.Budget.period == period)
    if category_id:
        query = query.filter(models.Budget.category_id == category_id)
    return query.all()

@router.get("/{budget_id}", response_model=schemas.BudgetOut)
def get_budget(
    budget_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted"}