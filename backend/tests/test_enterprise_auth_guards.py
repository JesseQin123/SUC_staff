from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.memories import router as memories_router
from app.api.tools import mcp_router, router as tools_router


def test_enterprise_read_endpoints_require_authentication() -> None:
    app = FastAPI()
    app.include_router(memories_router)
    app.include_router(tools_router)
    app.include_router(mcp_router)
    client = TestClient(app)

    paths = [
        "/api/enterprise/memories?tenant_id=tenant_demo",
        "/api/enterprise/tools?tenant_id=tenant_demo",
        "/api/enterprise/tools/buckets?tenant_id=tenant_demo",
        "/api/enterprise/tools/tool_demo?tenant_id=tenant_demo",
        "/api/enterprise/mcp-servers?tenant_id=tenant_demo",
        "/api/enterprise/mcp-servers/server_demo?tenant_id=tenant_demo",
    ]

    for path in paths:
        response = client.get(path)
        assert response.status_code == 401
        assert response.json() == {"detail": "Not authenticated"}
