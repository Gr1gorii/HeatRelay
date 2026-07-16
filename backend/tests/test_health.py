import asyncio

from httpx import ASGITransport, AsyncClient

from backend.app.main import app


def test_health_endpoint_returns_stable_contract() -> None:
    async def request_health() -> tuple[int, dict[str, str]]:
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as client:
            response = await client.get("/api/health")
            return response.status_code, response.json()

    status_code, payload = asyncio.run(request_health())

    assert status_code == 200
    assert payload == {"status": "ok", "service": "heatrelay-api"}
