from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("/", response_model=schemas.CheckoutResponse)
def checkout(
    payload: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Cart is empty")

    # Validate all items first before touching stock
    validated = []
    for item in payload.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=422, detail=f"Quantity must be > 0 (product_id={item.product_id})")

        product = db.query(models.Product).filter(
            models.Product.id == item.product_id,
            models.Product.is_archived == False,
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=422,
                detail=f'Insufficient stock for "{product.name}" (available: {product.stock}, requested: {item.quantity})',
            )
        validated.append((product, item.quantity))

    # All valid — apply atomically
    result_items = []
    total = Decimal("0")
    now = datetime.utcnow()

    for product, quantity in validated:
        unit_price = product.base_price or Decimal("0")
        subtotal = unit_price * quantity
        new_stock = product.stock - quantity

        product.stock = new_stock

        tx = models.Transaction(
            user_id=current_user.id,
            product_id=product.id,
            adjustment=-quantity,
            new_total=new_stock,
            timestamp=now,
            transaction_type="sale",
            unit_price=unit_price,
        )
        db.add(tx)

        result_items.append(schemas.CheckoutResponseItem(
            product_id=product.id,
            product_name=product.name,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
            new_stock=new_stock,
        ))
        total += subtotal

    db.commit()

    return schemas.CheckoutResponse(items=result_items, total_amount=total)
