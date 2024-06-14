export async function fetchEvents() {
  const api = `https://touhou.market/api/v1/events?include_pending=true`;
  const res = await fetch(api);
}


