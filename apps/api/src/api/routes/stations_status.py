from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from ..settings import settings
import time, httpx

router = APIRouter()
_STATUS_CACHE = {"expires": 0.0, "payload": None}

def _slim_record(s: dict) -> dict:
    bikes = s.get("num_bikes_available", 0)
    docks = s.get("num_docks_available", 0)
    total = max(bikes + docks, 1)
    pct_full = bikes / total
    return {
        "bikes": bikes,
        "docks": docks,
        "bikes_disabled": s.get("num_bikes_disabled", 0),
        "docks_disabled": s.get("num_docks_disabled", 0),
        "last_reported": s.get("last_reported"),
        "status": s.get("status"),
        "is_installed": s.get("is_installed"),
        "is_renting": s.get("is_renting"),
        "is_returning": s.get("is_returning"),
        "pct_full": pct_full,
        "vehicle_types_available": s.get("vehicle_types_available", []),
    }

@router.get("/v1/stations/status")
async def stations_status():
    now = time.time()
    if _STATUS_CACHE["payload"] and _STATUS_CACHE["expires"] > now:
        return JSONResponse(_STATUS_CACHE["payload"], headers={"Cache-Control":"public, max-age=5", "X-Cache":"mem"})

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(settings.STATION_STATUS_URL)
            r.raise_for_status()
            doc = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"status fetch failed: {e}")

    stations = doc.get("data", {}).get("stations", [])
    # Return a map keyed by station_id for O(1) merges on the frontend
    keyed = { s["station_id"]: _slim_record(s) for s in stations if "station_id" in s }

    payload = {
        "last_updated": doc.get("last_updated"),
        "ttl": settings.STATION_STATUS_TTL_SECONDS,
        "stations": keyed,
    }
    _STATUS_CACHE["payload"] = payload
    _STATUS_CACHE["expires"] = now + settings.STATION_STATUS_TTL_SECONDS
    return JSONResponse(payload, headers={"Cache-Control":"public, max-age=5", "X-Cache":"live"})
