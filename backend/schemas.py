from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr
from decimal import Decimal


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int


# ── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Product ───────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: Optional[Decimal] = None
    stock: int = 0
    barcode: str


class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    base_price: Optional[Decimal]
    stock: int
    barcode: str
    is_archived: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = None


# ── Stock Adjustment ──────────────────────────────────────────────────────────

class StockAdjustRequest(BaseModel):
    adjustment: int  # positive = add, negative = remove
    transaction_type: str = "adjustment"
    unit_price: Optional[Decimal] = None


class StockAdjustResponse(BaseModel):
    product_id: int
    new_total: int
    transaction_id: int


# ── Transaction ───────────────────────────────────────────────────────────────

class TransactionOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    adjustment: int
    new_total: int
    timestamp: datetime
    transaction_type: str
    unit_price: Optional[Decimal]
    product_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Checkout ──────────────────────────────────────────────────────────────────

class CheckoutItem(BaseModel):
    product_id: int
    quantity: int


class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]


class CheckoutResponseItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    new_stock: int


class CheckoutResponse(BaseModel):
    items: list[CheckoutResponseItem]
    total_amount: Decimal


# ── Analytics ─────────────────────────────────────────────────────────────────

class TopProduct(BaseModel):
    product_id: int
    name: str
    qty_sold: int
    revenue: Decimal


class DailyBreakdown(BaseModel):
    date: str
    income: Decimal
    items_sold: int


class AnalyticsSummary(BaseModel):
    income_this_month: Decimal
    items_sold_this_month: int
    income_all_time: Decimal
    items_sold_all_time: int
    top_products: list[TopProduct]
    daily_breakdown: list[DailyBreakdown]
