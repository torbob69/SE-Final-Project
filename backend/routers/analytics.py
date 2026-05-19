from datetime import datetime, timedelta, date
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, cast, Date
from sqlalchemy.orm import Session
from typing import Optional
import models, schemas
from auth import require_admin
from database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_summary(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    sale_q = db.query(models.Transaction).filter(models.Transaction.transaction_type == "sale")

    # All-time aggregates
    all_time = db.query(
        func.sum(func.abs(models.Transaction.adjustment) * models.Transaction.unit_price),
        func.sum(func.abs(models.Transaction.adjustment)),
    ).filter(models.Transaction.transaction_type == "sale").first()

    income_all_time = Decimal(str(all_time[0] or 0))
    items_all_time = int(all_time[1] or 0)

    # This month
    month = db.query(
        func.sum(func.abs(models.Transaction.adjustment) * models.Transaction.unit_price),
        func.sum(func.abs(models.Transaction.adjustment)),
    ).filter(
        models.Transaction.transaction_type == "sale",
        models.Transaction.timestamp >= month_start,
    ).first()

    income_month = Decimal(str(month[0] or 0))
    items_month = int(month[1] or 0)

    # Top 5 products by revenue
    top_rows = (
        db.query(
            models.Transaction.product_id,
            models.Product.name,
            func.sum(func.abs(models.Transaction.adjustment)).label("qty_sold"),
            func.sum(func.abs(models.Transaction.adjustment) * models.Transaction.unit_price).label("revenue"),
        )
        .join(models.Product, models.Transaction.product_id == models.Product.id)
        .filter(models.Transaction.transaction_type == "sale")
        .group_by(models.Transaction.product_id, models.Product.name)
        .order_by(func.sum(func.abs(models.Transaction.adjustment) * models.Transaction.unit_price).desc())
        .limit(5)
        .all()
    )

    top_products = [
        schemas.TopProduct(
            product_id=r.product_id,
            name=r.name,
            qty_sold=int(r.qty_sold),
            revenue=Decimal(str(r.revenue or 0)),
        )
        for r in top_rows
    ]

    # Daily breakdown — last 30 days
    thirty_days_ago = now - timedelta(days=30)
    daily_rows = (
        db.query(
            cast(models.Transaction.timestamp, Date).label("day"),
            func.sum(func.abs(models.Transaction.adjustment) * models.Transaction.unit_price).label("income"),
            func.sum(func.abs(models.Transaction.adjustment)).label("items_sold"),
        )
        .filter(
            models.Transaction.transaction_type == "sale",
            models.Transaction.timestamp >= thirty_days_ago,
        )
        .group_by(cast(models.Transaction.timestamp, Date))
        .order_by(cast(models.Transaction.timestamp, Date))
        .all()
    )

    daily_breakdown = [
        schemas.DailyBreakdown(
            date=str(r.day),
            income=Decimal(str(r.income or 0)),
            items_sold=int(r.items_sold),
        )
        for r in daily_rows
    ]

    return schemas.AnalyticsSummary(
        income_this_month=income_month,
        items_sold_this_month=items_month,
        income_all_time=income_all_time,
        items_sold_all_time=items_all_time,
        top_products=top_products,
        daily_breakdown=daily_breakdown,
    )


@router.get("/transactions", response_model=list[schemas.TransactionOut])
def list_analytics_transactions(
    transaction_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    q = (
        db.query(models.Transaction)
        .order_by(models.Transaction.timestamp.desc())
    )
    if transaction_type:
        q = q.filter(models.Transaction.transaction_type == transaction_type)
    if date_from:
        q = q.filter(models.Transaction.timestamp >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(models.Transaction.timestamp <= datetime.fromisoformat(date_to + "T23:59:59"))

    rows = q.offset(offset).limit(limit).all()

    result = []
    for tx in rows:
        out = schemas.TransactionOut(
            id=tx.id,
            user_id=tx.user_id,
            product_id=tx.product_id,
            adjustment=tx.adjustment,
            new_total=tx.new_total,
            timestamp=tx.timestamp,
            transaction_type=tx.transaction_type,
            unit_price=tx.unit_price,
            product_name=tx.product.name if tx.product else None,
        )
        result.append(out)
    return result
