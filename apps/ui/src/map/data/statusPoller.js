import { API_BASE } from "../constants.js";

async function fetchStatusMap(apiBase = API_BASE, signal) {
  const res = await fetch(`${apiBase}/v1/stations/status`, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
  const j = await res.json();
  return j.stations; // { [station_id]: {...} }
}

export function createStatusPoller({
  apiBase = API_BASE,
  intervalMs = 15000,
  pauseOnHidden = true,
  maxBackoffMs = 60000,
  onUpdate,                 
} = {}) {
  let timer = null;
  let controller = null;
  let running = false;
  let backoff = 0;

  const schedule = (delay) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(tick, delay);
  };

  const tick = async () => {
    try {
      if (pauseOnHidden && document.visibilityState === "hidden") {
        return schedule(intervalMs);
      }
      controller?.abort();
      controller = new AbortController();

      const statusMap = await fetchStatusMap(apiBase, controller.signal);
      onUpdate?.(statusMap);

      backoff = 0;
      const jitter = Math.random() * 500;
      schedule(intervalMs + jitter);
    } catch (e) {
      if (e?.name === "AbortError") return;
      backoff = Math.min(backoff ? backoff * 2 : 2000, maxBackoffMs);
      // eslint-disable-next-line no-console
      console.warn("Status poll error:", e);
      schedule(backoff);
    }
  };

  const onVisibility = () => {
    if (!running) return;
    if (document.visibilityState === "visible") tick();
  };

  const start = () => {
    if (running) return;
    running = true;
    window.addEventListener("visibilitychange", onVisibility, { passive: true });
    tick(); // fire immediately
  };

  const stop = () => {
    running = false;
    window.removeEventListener("visibilitychange", onVisibility);
    if (timer) clearTimeout(timer);
    controller?.abort();
    timer = null;
    controller = null;
  };

  return { start, stop, isRunning: () => running };
}
