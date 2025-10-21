from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .settings import settings
from .routes import stations_static, stations_status

app = FastAPI(title="BikeShare API", version="0.1.0")

# CORS (open in dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/v1/healthz")
@app.head("/v1/healthz")
def healthz():
    return {"ok": True}

# Routes
app.include_router(stations_static.router)
app.include_router(stations_status.router)