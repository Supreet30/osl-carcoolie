// Shared CORS setup for the public partner-facing endpoints (/api/catalog,
// /api/quote). Both are read-only or pure-computation, return no cookies or
// session data, and were built specifically to be called from a third-party
// app's own frontend — a wide-open Access-Control-Allow-Origin is the
// standard, safe choice here, not a security compromise the way it would be
// for an endpoint that reads auth state.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Browsers send a preflight OPTIONS request before any cross-origin POST
// with a JSON body — without this, the preflight itself gets rejected and
// the real request never goes out, even though curl (which never sends a
// preflight) makes the endpoint look like it works fine.
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
