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
<title>CFPanel WebTest Preview</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0b1020;color:#fff;margin:0;padding:20px}
.card{background:#151b2f;border-radius:18px;padding:18px;margin-top:20px;box-shadow:0 8px 30px rgba(0,0,0,.25)}
h1{font-size:24px;margin:10px 0}
.row{display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);padding:10px 0;font-size:15px}
.label{color:#91a0c5}
.value{font-weight:700;text-align:right;max-width:65%;word-break:break-all}
.good{color:#46e68a}
.bad{color:#ff7070}
button{width:100%;border:0;border-radius:14px;padding:14px;margin-top:18px;font-size:16px;font-weight:700;background:#3b82f6;color:#fff}
.small{color:#91a0c5;font-size:13px;margin-top:12px;line-height:1.5}
</style>
</head>
<body>
<h1>CFPanel WebTest Preview</h1>
<div class="small">当前页面用于验证手机真实网络、Cloudflare COLO、ASN 和出口 IP。</div>

<div class="card" id="box">加载中...</div>
<button onclick="loadInfo()">重新测试</button>

<script>
async function loadInfo(){
  const box=document.getElementById("box");
  box.innerHTML="测试中...";
  const start=performance.now();
  try{
    const r=await fetch("/api?ts="+Date.now(),{cache:"no-store"});
    const cost=Math.round(performance.now()-start);
    const d=await r.json();

    box.innerHTML=\`
      <div class="row"><span class="label">状态</span><span class="value good">成功</span></div>
      <div class="row"><span class="label">请求耗时</span><span class="value">\${cost} ms</span></div>
      <div class="row"><span class="label">出口 IP</span><span class="value">\${d.ip}</span></div>
      <div class="row"><span class="label">CF 机房</span><span class="value">\${d.colo}</span></div>
      <div class="row"><span class="label">城市</span><span class="value">\${d.city}</span></div>
      <div class="row"><span class="label">国家</span><span class="value">\${d.country}</span></div>
      <div class="row"><span class="label">地区</span><span class="value">\${d.region}</span></div>
      <div class="row"><span class="label">ASN</span><span class="value">\${d.asn}</span></div>
      <div class="row"><span class="label">运营商</span><span class="value">\${d.asOrganization}</span></div>
      <div class="row"><span class="label">协议</span><span class="value">\${d.httpProtocol}</span></div>
      <div class="row"><span class="label">TLS</span><span class="value">\${d.tlsVersion}</span></div>
      <div class="row"><span class="label">时间</span><span class="value">\${d.time}</span></div>
    \`;
  }catch(e){
    box.innerHTML='<div class="row"><span class="label">状态</span><span class="value bad">失败</span></div><div class="small">'+e.message+'</div>';
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