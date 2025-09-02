export const env = {
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,
};

if (!env.MAPBOX_TOKEN) {
  console.error("Missing VITE_MAPBOX_TOKEN in apps/ui/.env");
}
