import { TRAFFIC } from "../constants.js";

/**
 * Add or update the traffic overlay.
 * Safe to call repeatedly (idempotent).
 */
export function ensureTraffic(map) {
  // source
  if (!map.getSource(TRAFFIC.SOURCE_ID)) {
    map.addSource(TRAFFIC.SOURCE_ID, {
      type: "vector",
      url: TRAFFIC.VECTOR_URL,
    });
  }

  // insert under labels
  const layers = map.getStyle().layers || [];
  const firstSymbol = layers.find((l) => l.type === "symbol")?.id;

  // layer
  if (!map.getLayer(TRAFFIC.LAYER_ID)) {
    map.addLayer(
      {
        id: TRAFFIC.LAYER_ID,
        type: "line",
        source: TRAFFIC.SOURCE_ID,
        "source-layer": "traffic",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            TRAFFIC.WIDTH_STOPS[0], TRAFFIC.WIDTH_STOPS[1],
            TRAFFIC.WIDTH_STOPS[2], TRAFFIC.WIDTH_STOPS[3],
            TRAFFIC.WIDTH_STOPS[4], TRAFFIC.WIDTH_STOPS[5]
          ],
          "line-color": [
            "match",
            ["get", "congestion"],
            "low", TRAFFIC.COLORS.low,
            "moderate", TRAFFIC.COLORS.moderate,
            "heavy", TRAFFIC.COLORS.heavy,
            "severe", TRAFFIC.COLORS.severe,
            /* other */ TRAFFIC.COLORS.other
          ],
          "line-opacity": TRAFFIC.OPACITY,
          "line-blur": TRAFFIC.BLUR,
        },
        minzoom: 6,
        maxzoom: 24,
      },
      firstSymbol
    );
  } else {
    // update paint
    map.setPaintProperty(TRAFFIC.LAYER_ID, "line-width", [
      "interpolate",
      ["linear"],
      ["zoom"],
      TRAFFIC.WIDTH_STOPS[0], TRAFFIC.WIDTH_STOPS[1],
      TRAFFIC.WIDTH_STOPS[2], TRAFFIC.WIDTH_STOPS[3],
      TRAFFIC.WIDTH_STOPS[4], TRAFFIC.WIDTH_STOPS[5]
    ]);
    map.setPaintProperty(TRAFFIC.LAYER_ID, "line-opacity", TRAFFIC.OPACITY);
    map.setPaintProperty(TRAFFIC.LAYER_ID, "line-blur", TRAFFIC.BLUR);
    map.setPaintProperty(TRAFFIC.LAYER_ID, "line-color", [
      "match",
      ["get", "congestion"],
      "low", TRAFFIC.COLORS.low,
      "moderate", TRAFFIC.COLORS.moderate,
      "heavy", TRAFFIC.COLORS.heavy,
      "severe", TRAFFIC.COLORS.severe,
      /* other */ TRAFFIC.COLORS.other
    ]);
  }
}
