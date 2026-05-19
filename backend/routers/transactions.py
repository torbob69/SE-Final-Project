from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import models, schemas
from auth import get_current_user, require_admin
from database import get_db

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[schemas.TransactionOut])
def list_transactions(
    product_id: int | None = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    query = db.query(models.Transaction).order_by(models.Transaction.timestamp.desc())
    if product_id:
        query = query.filter(models.Transaction.product_id == product_id)
    return query.limit(limit).all()
