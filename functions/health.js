export async function onRequestGet() {
  return new Response(JSON.stringify({
    ok: true,
    service: "joshimg",
    status: "healthy",
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
