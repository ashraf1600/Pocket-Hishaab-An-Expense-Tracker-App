from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas, models, dependencies

router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=schemas.CategoryOut)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Check duplicate
    existing = db.query(models.Category).filter(
        models.Category.user_id == current_user.id,
        models.Category.name == category.name,
        models.Category.type == category.type
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = models.Category(
        user_id=current_user.id,
        **category.dict()
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.get("/", response_model=List[schemas.CategoryOut])
def get_categories(
    type: Optional[schemas.TransactionType] = None,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    query = db.query(models.Category).filter(models.Category.user_id == current_user.id)
    if type:
        query = query.filter(models.Category.type == type)
    return query.all()

@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(
    category_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int,
    category_update: schemas.CategoryCreate,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check duplicate if name/type changed
    if category.name != category_update.name or category.type != category_update.type:
        existing = db.query(models.Category).filter(
            models.Category.user_id == current_user.id,
            models.Category.name == category_update.name,
            models.Category.type == category_update.type
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category already exists")

    for key, value in category_update.dict().items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    category = db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}