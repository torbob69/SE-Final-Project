from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, products, stock, transactions, users, checkout, analytics

app = FastAPI(title="StockSync API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(stock.router)
app.include_router(transactions.router)
app.include_router(users.router)
app.include_router(checkout.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok"}

#test
