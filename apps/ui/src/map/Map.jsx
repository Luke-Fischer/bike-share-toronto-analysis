import { useMapbox } from "./useMapbox.js";
import { MAP_STYLES, TORONTO } from "./constants.js";
import { ensureTraffic } from "./layers/traffic.js";
import { ensureStations, startStatusPolling } from "./layers/stations.js";
import "./../index.css";

export default function Map() {
  const { containerRef, onLoaded } = useMapbox({
    style: MAP_STYLES.Light, 
    center: TORONTO,
    zoom: 12,
  });

  // Register overlays to be added whenever the style is ready
  onLoaded((map) => {
    ensureTraffic(map);
    ensureStations(map);
    startStatusPolling(map, { intervalMs: 15000});
  });

  return <div ref={containerRef} className="map" />;
}

