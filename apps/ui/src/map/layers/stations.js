import mapboxgl from "mapbox-gl";
import { API_BASE, STATIONS } from "../constants.js";

let _stationsCache = null; // in-memory GeoJSON cache
let _hoverBound = false;
let _hoverPopup = null;

// Fetch geojson data and cache it
async function fetchStationsOnce(apiBase = API_BASE) {
  if (_stationsCache) return _stationsCache;
  const res = await fetch(`${apiBase}/v1/stations/static`, { cache: "default" });
  if (!res.ok) throw new Error(`Failed to load stations: ${res.status}`);
  _stationsCache = await res.json();
  return _stationsCache;
}

// Add or update the stations source info in the map
function upsertSource(map, data) {
  const id = STATIONS.SOURCE_ID;
  const src = map.getSource(id);
  if (!src) map.addSource(id, { type: "geojson", data });
  else src.setData(data);
}

// Build circles layer
function ensureCirclesLayer(map) {
  const { CIRCLES } = STATIONS.LAYER_IDS;

  if (map.getLayer(CIRCLES)) return;

  const s = STATIONS.STYLE;
  map.addLayer({
    id: CIRCLES,
    type: "circle",
    source: STATIONS.SOURCE_ID,
    paint: {
      "circle-radius": [
        "interpolate", ["linear"], ["get", "capacity"],
        s.RADIUS_STOPS[0], s.RADIUS_STOPS[1],
        s.RADIUS_STOPS[2], s.RADIUS_STOPS[3],
      ],
      "circle-color": s.CIRCLE_COLOR,
      "circle-opacity": s.CIRCLE_OPACITY,
      "circle-stroke-color": s.CIRCLE_STROKE_COLOR,
      "circle-stroke-width": s.CIRCLE_STROKE_WIDTH,
    },
  });
}

// Build labels layer
function ensureLabelLayer(map) {
  const { LABELS } = STATIONS.LAYER_IDS;
  if (map.getLayer(LABELS)) return;

  const s = STATIONS.STYLE;
  map.addLayer({
    id: LABELS,
    type: "symbol",
    source: STATIONS.SOURCE_ID,
    minzoom: s.LABEL_MINZOOM,
    layout: {
      "text-field": ["get", "name"],
      "text-size": s.TEXT_SIZE,
      "text-offset": s.TEXT_OFFSET,
      "text-anchor": "top",
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": s.TEXT_COLOR,
      "text-halo-color": s.TEXT_HALO_COLOR,
      "text-halo-width": s.TEXT_HALO_WIDTH,
    },
  });
}

// Reorder layers to ensure display priortiy
function ensureOrdering(map) {
  const { CIRCLES, LABELS } = STATIONS.LAYER_IDS;
  if (map.getLayer(CIRCLES)) map.moveLayer(CIRCLES);
  if (map.getLayer(LABELS)) map.moveLayer(LABELS);
}

// Display popup on hover
function bindHoverOnce(map) {
  if (_hoverBound) return;

  _hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 8 });

  const { CIRCLES } = STATIONS.LAYER_IDS;

  map.on("mouseenter", CIRCLES, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mousemove", CIRCLES, (e) => {
    const f = e.features?.[0];
    if (!f) return;
    const p = f.properties;
    _hoverPopup
      .setLngLat(e.lngLat)
      .setHTML(
        `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
         <div>Station ID: ${p.station_id}</div>
         <div>Capacity: ${p.capacity}</div>`
      )
      .addTo(map);
  });

  map.on("mouseleave", CIRCLES, () => {
    map.getCanvas().style.cursor = "";
    if (_hoverPopup) _hoverPopup.remove();
  });

  _hoverBound = true;
}

export async function ensureStations(map, apiBase = API_BASE) {
  const data = await fetchStationsOnce(apiBase);
  upsertSource(map, data);
  ensureCirclesLayer(map);
  ensureLabelLayer(map);
  ensureOrdering(map);
  bindHoverOnce(map);
}


