from __future__ import annotations

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/mock", tags=["mock"])


class MockOrderQueryRequest(BaseModel):
    order_id: str


class MockProductPurchaseRequest(BaseModel):
    user_id: str = "user_demo"
    product_id: str
    sku_id: str | None = None
    quantity: int = Field(default=1, ge=1, le=99)
    payment_method: str = "mock_balance"


class MockOrderAddRequest(BaseModel):
    user_id: str = "user_demo"
    order_id: str | None = None
    product_id: str
    sku_id: str | None = None
    quantity: int = Field(default=1, ge=1, le=99)
    status: str = "created"


class MockReflectionSearchRequest(BaseModel):
    query: str


@router.post("/order/query")
def mock_order_query(request: MockOrderQueryRequest) -> dict[str, Any]:
    signed_days = 3 if request.order_id == "A123456" else 16
    return {
        "order_id": request.order_id,
        "status": "signed",
        "signed_days": signed_days,
        "refundable": signed_days <= 7,
    }


@router.post("/reflection/primary-search")
def mock_reflection_primary_search(request: MockReflectionSearchRequest) -> dict[str, Any]:
    if "常规" in request.query:
        return {
            "query": request.query,
            "found": True,
            "source": "primary_index",
            "answer": "主索引命中了常规测试资料。",
            "confidence": 0.82,
        }
    return {
        "query": request.query,
        "found": False,
        "source": "primary_index",
        "results": [],
        "miss_reason": "primary_index_miss",
        "hint": "主索引未命中，可使用备用索引继续查询。",
    }


@router.post("/reflection/backup-search")
def mock_reflection_backup_search(request: MockReflectionSearchRequest) -> dict[str, Any]:
    return {
        "query": request.query,
        "found": True,
        "source": "backup_index",
        "answer": (
            f"备用索引已找到“{request.query}”的资料：这是用于验证模型反思能力的备用查询结果。"
            "当主工具未命中时，系统应反思并改用备用工具完成回答。"
        ),
        "confidence": 0.91,
    }


@router.post("/product/purchase")
def mock_product_purchase(request: MockProductPurchaseRequest) -> dict[str, Any]:
    unit_price = _mock_price(request.product_id)
    total_amount = unit_price * Decimal(request.quantity)
    order_id = f"MOCK{uuid4().hex[:10].upper()}"
    return {
        "order_id": order_id,
        "purchase_id": f"PUR{uuid4().hex[:10].upper()}",
        "user_id": request.user_id,
        "product_id": request.product_id,
        "sku_id": request.sku_id,
        "quantity": request.quantity,
        "unit_price": float(unit_price),
        "total_amount": float(total_amount),
        "currency": "CNY",
        "payment_method": request.payment_method,
        "payment_status": "paid",
        "order_status": "paid",
        "created_at": _now_iso(),
    }


@router.post("/order/add")
def mock_order_add(request: MockOrderAddRequest) -> dict[str, Any]:
    unit_price = _mock_price(request.product_id)
    total_amount = unit_price * Decimal(request.quantity)
    return {
        "order_id": request.order_id or f"ADD{uuid4().hex[:10].upper()}",
        "user_id": request.user_id,
        "product_id": request.product_id,
        "sku_id": request.sku_id,
        "quantity": request.quantity,
        "unit_price": float(unit_price),
        "total_amount": float(total_amount),
        "currency": "CNY",
        "status": request.status,
        "created_at": _now_iso(),
    }


def _mock_price(product_id: str) -> Decimal:
    catalog = {
        "SKU-001": Decimal("99.00"),
        "SKU-002": Decimal("199.00"),
        "SKU-003": Decimal("299.00"),
    }
    return catalog.get(product_id, Decimal("129.00"))


def _now_iso() -> str:
    return datetime.now(UTC).replace(tzinfo=None).isoformat()
