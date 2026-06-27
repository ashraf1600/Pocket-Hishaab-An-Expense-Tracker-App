from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime
import time
import random
from .. import schemas, models, dependencies
from ..schemas import TransactionOut, TransferCreate

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionOut)
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
        **transaction.model_dump()   # Pydantic v2
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

@router.get("/", response_model=List[TransactionOut])
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

@router.get("/{transaction_id}", response_model=TransactionOut)
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

@router.put("/{transaction_id}", response_model=TransactionOut)
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

    # Update transaction fields (use model_dump for Pydantic v2)
    for key, value in transaction_update.model_dump().items():
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


@router.post("/transfer", response_model=List[TransactionOut])
def transfer_money(
    transfer: TransferCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # 1. Validate accounts belong to user
    source = db.query(models.Account).filter(
        models.Account.id == transfer.source_account_id,
        models.Account.user_id == current_user.id
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source account not found")

    dest = db.query(models.Account).filter(
        models.Account.id == transfer.destination_account_id,
        models.Account.user_id == current_user.id
    ).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination account not found")

    if source.id == dest.id:
        raise HTTPException(status_code=400, detail="Source and destination accounts must be different")

    if transfer.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    if source.balance < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance in source account")

    # 2. Generate a unique transfer_id
    transfer_id = int(time.time() * 1000) + random.randint(1, 1000)

    # 3. Atomic transaction
    try:
        # Deduct from source
        source.balance -= transfer.amount
        # Add to destination
        dest.balance += transfer.amount

        # Create expense transaction (source)
        txn_out = models.Transaction(
            user_id=current_user.id,
            account_id=source.id,
            category_id=None,  # No category for transfer; you can set a default "Transfer" category if you create one
            amount=transfer.amount,
            type=schemas.TransactionType.EXPENSE,
            description=f"Transfer to {dest.name}: {transfer.description}" if transfer.description else f"Transfer to {dest.name}",
            date=transfer.date,
            transfer_id=transfer_id,
        )
        db.add(txn_out)

        # Create income transaction (destination)
        txn_in = models.Transaction(
            user_id=current_user.id,
            account_id=dest.id,
            category_id=None,
            amount=transfer.amount,
            type=schemas.TransactionType.INCOME,
            description=f"Transfer from {source.name}: {transfer.description}" if transfer.description else f"Transfer from {source.name}",
            date=transfer.date,
            transfer_id=transfer_id,
        )
        db.add(txn_in)

        db.commit()
        db.refresh(txn_out)
        db.refresh(txn_in)

        return [txn_out, txn_in]

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")