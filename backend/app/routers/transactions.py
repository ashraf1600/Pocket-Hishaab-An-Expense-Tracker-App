from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import date, datetime
from .. import schemas, models, dependencies

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=schemas.TransactionOut)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Verify account belongs to user
    account = db.query(models.Account).filter(
        models.Account.id == transaction.account_id,
        models.Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Verify category belongs to user
    category = db.query(models.Category).filter(
        models.Category.id == transaction.category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Create transaction
    new_transaction = models.Transaction(
        user_id=current_user.id,
        **transaction.dict()
    )
    db.add(new_transaction)

    # Update account balance
    if transaction.type == schemas.TransactionType.INCOME:
        account.balance += transaction.amount
    else:  # EXPENSE
        account.balance -= transaction.amount

    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@router.get("/", response_model=List[schemas.TransactionOut])
def get_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    account_id: Optional[int] = None,
    category_id: Optional[int] = None,
    type: Optional[schemas.TransactionType] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    )

    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    if account_id:
        query = query.filter(models.Transaction.account_id == account_id)
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    if type:
        query = query.filter(models.Transaction.type == type)

    return query.order_by(models.Transaction.date.desc()).offset(offset).limit(limit).all()

@router.get("/{transaction_id}", response_model=schemas.TransactionOut)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.put("/{transaction_id}", response_model=schemas.TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction_update: schemas.TransactionCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Get existing transaction
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Verify new account
    if transaction.account_id != transaction_update.account_id:
        new_account = db.query(models.Account).filter(
            models.Account.id == transaction_update.account_id,
            models.Account.user_id == current_user.id
        ).first()
        if not new_account:
            raise HTTPException(status_code=404, detail="New account not found")

    # Reverse old balance effect
    old_account = db.query(models.Account).filter(
        models.Account.id == transaction.account_id
    ).first()
    if transaction.type == schemas.TransactionType.INCOME:
        old_account.balance -= transaction.amount
    else:
        old_account.balance += transaction.amount

    # Update transaction fields
    for key, value in transaction_update.dict().items():
        setattr(transaction, key, value)

    # Apply new balance effect
    if transaction.type == schemas.TransactionType.INCOME:
        old_account.balance += transaction.amount
    else:
        old_account.balance -= transaction.amount

    db.commit()
    db.refresh(transaction)
    return transaction

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Reverse account balance
    account = db.query(models.Account).filter(
        models.Account.id == transaction.account_id
    ).first()
    if transaction.type == schemas.TransactionType.INCOME:
        account.balance -= transaction.amount
    else:
        account.balance += transaction.amount

    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted"}