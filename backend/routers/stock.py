from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/products", tags=["stock"])


@router.patch("/{product_id}/stock", response_model=schemas.StockAdjustResponse)
def adjust_stock(
    product_id: int,
    payload: schemas.StockAdjustRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_archived == False,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_total = product.stock + payload.adjustment
    if new_total < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stock cannot go below zero",
        )

    product.stock = new_total

    tx = models.Transaction(
        user_id=current_user.id,
        product_id=product.id,
        adjustment=payload.adjustment,
        new_total=new_total,
        timestamp=datetime.utcnow(),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    return schemas.StockAdjustResponse(
        product_id=product.id,
        new_total=new_total,
        transaction_id=tx.id,
    )
