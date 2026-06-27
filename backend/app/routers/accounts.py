from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# project এর ভিতরের schemas, models, dependencies import করছি
from .. import schemas, models, dependencies


# Account সম্পর্কিত সব API এই router এর ভিতরে থাকবে
# prefix="/accounts" মানে সব endpoint এর আগে /accounts যোগ হবে
# tags="accounts" Swagger UI তে group হিসেবে দেখাবে
router = APIRouter(
    prefix="/accounts",
    tags=["accounts"]
)


# =====================================================
# CREATE ACCOUNT
# POST /accounts/
# =====================================================

@router.post("/", response_model=schemas.AccountOut)
def create_account(

    # Request body AccountCreate schema দিয়ে validate হবে
    account: schemas.AccountCreate,

    # Database session dependency
    db: Session = Depends(dependencies.get_db),

    # JWT token থেকে বর্তমান user বের করবে
    current_user: models.User = Depends(
        dependencies.get_current_user
    )
):

    # একই user এর একই নামে account আছে কিনা check করছি
    existing = db.query(models.Account).filter(
        models.Account.user_id == current_user.id,
        models.Account.name == account.name
    ).first()

    # account থাকলে error দিব
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Account already exists"
        )

    # নতুন Account object তৈরি করছি
    new_account = models.Account(

        # logged in user এর id save করছি
        user_id=current_user.id,

        # schema এর সব field unpack করে পাঠাচ্ছি
        # name, type, balance, currency
        **account.model_dump()
    )

    # session এ add করলাম
    db.add(new_account)

    # database এ save করলাম
    db.commit()

    # database থেকে latest data reload করলাম
    # যাতে auto generated id পাই
    db.refresh(new_account)

    # response হিসেবে account return
    return new_account


# =====================================================
# GET ALL ACCOUNTS
# GET /accounts/
# =====================================================

@router.get("/", response_model=List[schemas.AccountOut])
def get_accounts(

    # database session
    db: Session = Depends(dependencies.get_db),

    # current logged in user
    current_user: models.User = Depends(
        dependencies.get_current_user
    )
):

    # শুধুমাত্র logged in user এর accounts আনবে
    accounts = db.query(models.Account).filter(
        models.Account.user_id == current_user.id
    ).all()

    return accounts


# =====================================================
# GET SINGLE ACCOUNT
# GET /accounts/{account_id}
# =====================================================

@router.get("/{account_id}", response_model=schemas.AccountOut)
def get_account(

    # URL থেকে account id আসবে
    account_id: int,

    db: Session = Depends(dependencies.get_db),

    current_user: models.User = Depends(
        dependencies.get_current_user
    )
):

    # account খুঁজছি
    account = db.query(models.Account).filter(

        # account id match করতে হবে
        models.Account.id == account_id,

        # account টি current user এর হতে হবে
        models.Account.user_id == current_user.id
    ).first()

    # account না পেলে
    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    return account


# =====================================================
# UPDATE ACCOUNT
# PUT /accounts/{account_id}
# =====================================================

@router.put("/{account_id}",
            response_model=schemas.AccountOut)
def update_account(

    # URL parameter
    account_id: int,

    # নতুন data request body থেকে আসবে
    account_update: schemas.AccountCreate,

    db: Session = Depends(dependencies.get_db),

    current_user: models.User = Depends(
        dependencies.get_current_user
    )
):

    # account database থেকে খুঁজছি
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()

    # account না থাকলে
    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    # =================================================
    # যদি account name change করা হয়
    # তাহলে duplicate check করবো
    # =================================================

    if account.name != account_update.name:

        existing = db.query(models.Account).filter(
            models.Account.user_id == current_user.id,
            models.Account.name == account_update.name
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Account already exists"
            )

    # =================================================
    # schema এর সব field update করছি
    # =================================================

    for key, value in account_update.model_dump().items():

        # dynamically field update
        # account.name = value
        # account.balance = value
        # account.currency = value
        setattr(account, key, value)

    # database save
    db.commit()

    # updated object reload
    db.refresh(account)

    return account


# =====================================================
# DELETE ACCOUNT
# DELETE /accounts/{account_id}
# =====================================================

@router.delete("/{account_id}")
def delete_account(

    account_id: int,

    db: Session = Depends(dependencies.get_db),

    current_user: models.User = Depends(
        dependencies.get_current_user
    )
):

    # account খুঁজছি
    account = db.query(models.Account).filter(
        models.Account.id == account_id,
        models.Account.user_id == current_user.id
    ).first()

    # account না পেলে
    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    # delete mark করছি
    db.delete(account)

    # database এ apply করছি
    db.commit()

    return {
        "message": "Account deleted"
    }