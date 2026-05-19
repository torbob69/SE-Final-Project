from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import models, schemas
from auth import get_current_user, require_admin
from database import get_db

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[schemas.TransactionOut])
def list_transactions(
    product_id: Optional[int] = Query(None),
    transaction_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    q = db.query(models.Transaction).order_by(models.Transaction.timestamp.desc())
    if product_id:
        q = q.filter(models.Transaction.product_id == product_id)
    if transaction_type:
        q = q.filter(models.Transaction.transaction_type == transaction_type)
    if date_from:
        q = q.filter(models.Transaction.timestamp >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(models.Transaction.timestamp <= datetime.fromisoformat(date_to + "T23:59:59"))

    rows = q.limit(limit).all()
    return [
        schemas.TransactionOut(
            id=tx.id, user_id=tx.user_id, product_id=tx.product_id,
            adjustment=tx.adjustment, new_total=tx.new_total, timestamp=tx.timestamp,
            transaction_type=tx.transaction_type, unit_price=tx.unit_price,
            product_name=tx.product.name if tx.product else None,
        )
        for tx in rows
    ]
