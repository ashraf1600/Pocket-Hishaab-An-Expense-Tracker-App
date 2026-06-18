from fastapi import APIRouter, Depends
from .. import schemas, dependencies

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: schemas.UserOut = Depends(dependencies.get_current_user)):
    return current_user