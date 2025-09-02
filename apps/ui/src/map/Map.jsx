import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const TORONTO = [-79.3832, 43.6532]; // [lng, lat]

export default function Map() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: node,
      style: "mapbox://styles/mapbox/navigation-day-v1",
      center: TORONTO,
      zoom: 12,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    // Helper to add (or re-add) the traffic overlay and set paint props
    const addTraffic = () => {
      // Add the traffic source if missing
      if (!map.getSource("traffic")) {
        map.addSource("traffic", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-traffic-v1",
        });
      }

      // Insert beneath labels so text stays visible
      const layers = map.getStyle().layers || [];
      const firstSymbolId = layers.find((l) => l.type === "symbol")?.id;

      // Add the traffic layer if not present
      if (!map.getLayer("traffic")) {
        map.addLayer(
          {
            id: "traffic",
            type: "line",
            source: "traffic",
            "source-layer": "traffic",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              // initial values (we'll override below too)
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                6, 0.9,
                10, 1.5,
                14, 2.2
              ],
              "line-color": [
                "match",
                ["get", "congestion"],
                "low", "#6BCB77",
                "moderate", "#F7B267",
                "heavy", "#F4845F",
                "severe", "#E63946",
                /* other */ "#9aa0a6"
              ],
              "line-opacity": 0.9,
              "line-blur": 0.15,
            },
            minzoom: 6,
            maxzoom: 24,
          },
          firstSymbolId
        );
      }

      // Ensure paint properties (useful after setStyle or hot reloads)
      map.setPaintProperty("traffic", "line-width", [
        "interpolate",
        ["linear"],
        ["zoom"],
        6, 0.9,
        10, 1.5,
        14, 2.2,
      ]);
      map.setPaintProperty("traffic", "line-blur", 0.15);
      map.setPaintProperty("traffic", "line-opacity", 0.9);
      map.setPaintProperty("traffic", "line-color", [
        "match",
        ["get", "congestion"],
        "low", "#6BCB77",
        "moderate", "#F7B267",
        "heavy", "#F4845F",
        "severe", "#E63946",
        /* other */ "#9aa0a6",
      ]);
    };

    map.on("load", addTraffic);
    map.on("style.load", addTraffic); // re-add if you ever change styles

    mapRef.current = map;
    return () => {
      mapRef.current?.remove();
      mapRef.current = null; // StrictMode-friendly cleanup
    };
  }, []);

  return <div ref={containerRef} className="map" />;
}
