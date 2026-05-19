import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from auth import get_current_user, require_admin
from database import get_db

router = APIRouter(prefix="/products", tags=["products"])


def _generate_barcode(db: Session) -> str:
    for _ in range(10):
        code = str(random.randint(100_000_000_000, 999_999_999_999))
        if not db.query(models.Product).filter(models.Product.barcode == code).first():
            return code
    raise HTTPException(status_code=500, detail="Could not generate unique barcode")


@router.get("/", response_model=list[schemas.ProductOut])
def list_products(
    include_archived: bool = False,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    query = db.query(models.Product)
    if not include_archived:
        query = query.filter(models.Product.is_archived == False)
    return query.all()


@router.get("/barcode/{barcode}", response_model=schemas.ProductOut)
def get_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    product = (
        db.query(models.Product)
        .filter(models.Product.barcode == barcode, models.Product.is_archived == False)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Barcode not recognized in catalog")
    return product


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    if db.query(models.Product).filter(models.Product.barcode == payload.barcode).first():
        raise HTTPException(status_code=409, detail="Barcode already assigned to another product.")
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/generate-barcode", response_model=dict)
def generate_barcode(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    return {"barcode": _generate_barcode(db)}


@router.patch("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    has_transactions = db.query(models.Transaction).filter(
        models.Transaction.product_id == product_id
    ).first()
    if has_transactions:
        product.is_archived = True
        db.commit()
    else:
        db.delete(product)
        db.commit()
