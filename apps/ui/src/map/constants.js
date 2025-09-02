export const TORONTO = [-79.3832, 43.6532]; // [lng, lat]

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
