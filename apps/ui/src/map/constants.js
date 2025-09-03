export const TORONTO = [-79.3832, 43.6532];

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const MAP_STYLES = {
  Dark: "mapbox://styles/mapbox/dark-v11",
  Light: "mapbox://styles/mapbox/light-v11",
  NavDay: "mapbox://styles/mapbox/navigation-day-v1",
};

export const TRAFFIC = {
  SOURCE_ID: "traffic",
  LAYER_ID: "traffic",
  VECTOR_URL: "mapbox://mapbox.mapbox-traffic-v1",
  COLORS: {
    low: "#6BCB77",
    moderate: "#F7B267",
    heavy: "#F4845F",
    severe: "#E63946",
    other: "#9aa0a6",
  },
  WIDTH_STOPS: [6, 0.9, 10, 1.5, 14, 2.2], // zoom & width pairs
  OPACITY: 0.9,
  BLUR: 0.15,
};

export const STATIONS = {
  SOURCE_ID: "stations-static",
  LAYER_IDS: {
    CIRCLES: "stations-circles",
    LABELS: "stations-labels",
  },
  STYLE: {
    // circle sizing by capacity: [cap, radius, cap, radius]
    RADIUS_STOPS: [10, 4, 50, 10],
    CIRCLE_COLOR: "#3b82f6",
    CIRCLE_OPACITY: 0.85,
    CIRCLE_STROKE_COLOR: "#ffffff",
    CIRCLE_STROKE_WIDTH: 1,

    // label styling
    LABEL_MINZOOM: 13,
    TEXT_SIZE: 11,
    TEXT_OFFSET: [0, 1.0],
    TEXT_COLOR: "#0f172a",
    TEXT_HALO_COLOR: "#ffffff",
    TEXT_HALO_WIDTH: 1,
  },
};