import mapboxgl from "mapbox-gl";
import { API_BASE, STATIONS, AVAILABILITY } from "../constants.js";
import { createStatusPoller } from "../data/statusPoller.js";

let _stationsCache = null; // in-memory GeoJSON cache
let _hoverBound = false;
let _hoverPopup = null;
let _statusPoller = null;

// Fetch the satic geojson data and cache it (I.e station locations, lat, lon, capacity, name)
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
      "circle-color": AVAILABILITY.COLOR_BY_PCT, 
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
  const L = STATIONS.LAYER_IDS;

  const onEnter = () => (map.getCanvas().style.cursor = "pointer");
  const onLeave = () => { map.getCanvas().style.cursor = ""; _hoverPopup.remove(); };
  const onMove  = (e) => {
    const f = e.features?.[0];
    if (!f) return;
    const p = f.properties;
    _hoverPopup
      .setLngLat(e.lngLat)
      .setHTML(
        `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>
         <div>Station ID: ${p.station_id}</div>
         <div>Capacity: ${p.capacity}</div>
         <div>Bikes: ${p.bikes ?? "—"} &nbsp; Docks: ${p.docks ?? "—"}</div>`
      )
      .addTo(map);
  };

  // Bind to BOTH layers so labels-on-top still hover
  for (const id of [L.CIRCLES, L.LABELS]) {
    map.on("mouseenter", id, onEnter);
    map.on("mousemove",  id, onMove);
    map.on("mouseleave", id, onLeave);
  }

  _hoverBound = true;
}

function mergeStatusIntoGeoJSON(geojson, statusMap) {
  if (!geojson || !geojson.features) return geojson;
  for (const f of geojson.features) {
    const st = statusMap[f.properties.station_id];
    if (st) {
      f.properties.bikes = st.bikes;
      f.properties.docks = st.docks;
      f.properties.pct_full = st.pct_full;
      f.properties.status = st.status;
      f.properties.last_reported = st.last_reported;
    }
  }
  return geojson;
}

// Start live status updates for this layer
export function startStatusPolling(map, { apiBase = API_BASE, intervalMs = 15000 } = {}) {
  if (_statusPoller?.isRunning?.()) return _statusPoller.stop;

  _statusPoller = createStatusPoller({
    apiBase,
    intervalMs,
    onUpdate: (statusMap) => {
      if (!_stationsCache) return; // wait until static stations loaded
      const updated = mergeStatusIntoGeoJSON(structuredClone(_stationsCache), statusMap);
      const src = map.getSource(STATIONS.SOURCE_ID);
      if (src) src.setData(updated);
      _stationsCache = updated;
    },
  });

  // stop automatically when the map is destroyed
  map.once("remove", () => _statusPoller?.stop());
  _statusPoller.start();
  return () => _statusPoller.stop();
}


export async function ensureStations(map, apiBase = API_BASE) {
  const data = await fetchStationsOnce(apiBase);
  upsertSource(map, data);
  ensureCirclesLayer(map);
  ensureLabelLayer(map);
  ensureOrdering(map);
  bindHoverOnce(map);
}


