from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, dependencies

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.post("/", response_model=schemas.AccountOut)
def create_account(
    account: schemas.AccountCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    existing = db.query(models.Account).filter(
        models.Account.user_id == current_user.id,
        models.Account.name == account.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account already exists")

    new_account = models.Account(
        user_id=current_user.id,
        **account.model_dump()
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)
    return new_account

@router.get("/", response_model=List[schemas.AccountOut])
def get_accounts(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.Account).filter(models.Account.user_id == current_user.id).all()

@router.get("/{account_id}", response_model=schemas.AccountOut)
def get_account(
    account_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=schemas.AccountOut)
def update_account(
    account_id: int,
    account_update: schemas.AccountCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if account.name != account_update.name:
        existing = db.query(models.Account).filter(
            models.Account.user_id == current_user.id,
            models.Account.name == account_update.name
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Account already exists")

    for key, value in account_update.model_dump().items():
        setattr(account, key, value)
    db.commit()
    db.refresh(account)
    return account

@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(account)
    db.commit()
    return {"message": "Account deleted"}