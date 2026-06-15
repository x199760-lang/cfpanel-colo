export default {
  async fetch(request) {
    const cf = request.cf || {};

    const data = {
      ok: true,
      ip: request.headers.get("CF-Connecting-IP") || "",
      colo: cf.colo || "",
      city: cf.city || "",
      country: cf.country || "",
      continent: cf.continent || "",
      region: cf.region || "",
      regionCode: cf.regionCode || "",
      latitude: cf.latitude || "",
      longitude: cf.longitude || "",
      asn: cf.asn || "",
      asOrganization: cf.asOrganization || "",
      timezone: cf.timezone || "",
      clientTcpRtt: cf.clientTcpRtt || "",
      httpProtocol: cf.httpProtocol || "",
      tlsVersion: cf.tlsVersion || "",
      tlsCipher: cf.tlsCipher || "",
      userAgent: request.headers.get("User-Agent") || "",
      cfRay: request.headers.get("CF-Ray") || "",
      time: new Date().toISOString()
    };

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}