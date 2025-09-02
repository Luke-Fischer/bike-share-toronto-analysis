import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { env } from "../lib/env.js";

/**
 * Create a Mapbox map once. Returns { containerRef, mapRef, onLoaded }.
 * onLoaded(cb) registers a callback that runs on 'load' and again on 'style.load'.
 */
export function useMapbox({ style, center, zoom = 12 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const callbacksRef = useRef([]);

  mapboxgl.accessToken = env.MAPBOX_TOKEN;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: node,
      style,
      center,
      zoom,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    // fire all registered callbacks when style is ready
    const fire = () => callbacksRef.current.forEach((fn) => fn(map));

    map.on("load", fire);
    map.on("style.load", fire);

    mapRef.current = map;
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [style, center, zoom]);

  const onLoaded = (cb) => {
    // store callback; it will run on next 'load' / 'style.load'
    callbacksRef.current.push(cb);
  };

  return { containerRef, mapRef, onLoaded };
}
