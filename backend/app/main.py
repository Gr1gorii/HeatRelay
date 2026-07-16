"""HeatRelay API entry point."""

from fastapi import FastAPI

app = FastAPI(
    title="HeatRelay API",
    description="Minimal API foundation for HeatRelay.",
    version="0.0.0",
)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Return the stable service health contract."""

    return {"status": "ok", "service": "heatrelay-api"}
