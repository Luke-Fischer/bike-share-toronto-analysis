import { useMapbox } from "./useMapbox.js";
import { MAP_STYLES, TORONTO } from "./constants.js";
import { ensureTraffic } from "./layers/traffic.js";
import "./../index.css";

export default function Map() {
  const { containerRef, onLoaded } = useMapbox({
    style: MAP_STYLES.NavDay, 
    center: TORONTO,
    zoom: 12,
  });

  // Register overlays to be added whenever the style is ready
  onLoaded((map) => {
    ensureTraffic(map);
    // future: ensureStations(map), ensureBikeLanes(map), etc.
  });

  return <div ref={containerRef} className="map" />;
}

