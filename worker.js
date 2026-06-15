export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api") {
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

    return new Response(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title></title>
<style>
html,body{
  margin:0;
  width:100%;
  height:100%;
  overflow:hidden;
  background:#000;
}

#wallpaper{
  position:fixed;
  inset:0;
  background:url("https://raw.githubusercontent.com/x199760-lang/cfpanel-colo/main/BB82A8AE-C249-476A-B600-873890F8B860.png") center center no-repeat;
  background-size:cover;
  z-index:99999;
}

#hidden-test{
  display:none;
}
</style>
</head>
<body>

<div id="wallpaper"></div>

<div id="hidden-test">
  <div id="box"></div>
</div>

<script>
async function loadInfo(){
  try{
    const r=await fetch("/api?ts="+Date.now(),{cache:"no-store"});
    const d=await r.json();
    window.__cfpanel_webtest=d;
  }catch(e){
    window.__cfpanel_webtest_error=e.message;
  }
}
loadInfo();
</script>

</body>
</html>`, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8"
      }
    });
  }
}