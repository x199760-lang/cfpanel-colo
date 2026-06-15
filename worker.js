export default {
  async fetch(request) {
    return Response.json({
      ip: request.headers.get("CF-Connecting-IP") || "",
      colo: request.cf?.colo || "",
      city: request.cf?.city || "",
      country: request.cf?.country || "",
      asn: request.cf?.asn || "",
      isp: request.cf?.asOrganization || "",
      userAgent: request.headers.get("User-Agent") || "",
      ray: request.headers.get("CF-Ray") || "",
      time: new Date().toISOString()
    });
  }
}