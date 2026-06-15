export default {
  async fetch(request) {

    return Response.json({
      ip: request.headers.get("CF-Connecting-IP"),
      colo: request.cf?.colo,
      city: request.cf?.city,
      country: request.cf?.country,
      time: new Date().toISOString()
    });

  }
}