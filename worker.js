export default {
  async fetch(request) {
    return Response.json({
      colo: request.cf?.colo || "UNKNOWN",
      city: request.cf?.city || "UNKNOWN",
      country: request.cf?.country || "UNKNOWN",
      time: new Date().toISOString()
    });
  }
}
