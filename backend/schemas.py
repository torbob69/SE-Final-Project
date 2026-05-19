from datetime import datetime
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

    model_config = {"from_attributes": True}
