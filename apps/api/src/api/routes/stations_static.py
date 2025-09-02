from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from ..settings import settings
import time, httpx

router = APIRouter()

# In-memory cache (per process)
_CACHE = {"expires": 0.0, "geojson": None}

def _to_geojson(stations_doc: dict) -> dict:
    stations = stations_doc["data"]["stations"]
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
                "properties": {
                    "station_id": s["station_id"],
                    "name": s.get("name"),
                    "capacity": s.get("capacity", 0),
                    "groups": s.get("groups", []),
                },
            }
            for s in stations
        ],
    }

@router.get("/v1/stations/static")
async def stations_static():
    now = time.time()
    if _CACHE["geojson"] and _CACHE["expires"] > now:
        return JSONResponse(
            content=_CACHE["geojson"],
            headers={"Cache-Control": "public, max-age=3600", "X-Cache": "mem"},
        )

    if not settings.STATION_INFO_URL:
        raise HTTPException(status_code=500, detail="STATION_INFO_URL not configured")

    try:
        async with httpx.AsyncClient(timeout=settings.HTTPX_TIMEOUT_SECONDS) as client:
            r = await client.get(settings.STATION_INFO_URL)
            r.raise_for_status()
            stations_doc = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Fetch failed: {e}")

    geojson = _to_geojson(stations_doc)
    _CACHE.update({"geojson": geojson, "expires": now + settings.STATION_INFO_TTL_SECONDS})

    return JSONResponse(
        content=geojson,
        headers={"Cache-Control": "public, max-age=3600", "X-Cache": "live"},
    )

@router.get("/v1/stations/static/meta")
async def stations_static_meta():
    return {
        "in_memory": bool(_CACHE["geojson"]),
        "mem_expires_epoch": _CACHE["expires"],
        "station_info_url": settings.STATION_INFO_URL,
        "ttl_seconds": settings.STATION_INFO_TTL_SECONDS,
    }


