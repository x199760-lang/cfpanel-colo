// 🌟 优化点 1：定义严格的域名白名单，阻断全网扫描器白嫖
const ALLOWED_HOSTS = [
  "w1.vpstool09.xyz",
  "w2.vpstool09.xyz",
  "w3.vpstool09.xyz",
  "w4.vpstool09.xyz",
  "w5.vpstool09.xyz",
  "colo.vpstool09.xyz"
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 🌟 优化点 2：Host 闭环防御
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      return new Response("Access Denied: Host Forbidden", { status: 403 });
    }

    // 🌟 核心防线：安全锁鉴权 Token
    const secretToken = request.headers.get("X-V9-Secret");
    if (secretToken !== "V9_Secure_Tunnel_Token_2026_RN") {
      return new Response("Unauthorized", { status: 401 });
    }

    // 必须走指定的测速密道
    if (url.pathname !== "/probe") {
      return new Response("Not Found", { status: 404 });
    }

    // 🎯 完美工具人目标站
    const targetUrl = "https://www.youtube.com/";

    try {
      // 🌟 优化点 3：极致 HEAD 轻量化探针，打碎缓存机制
      // 强制加入随机数参数防止目标站响应被缓存，拿到最纯净的内网直连全链路延迟
      const cacheBuster = `?v9_ts=${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      const response = await fetch(targetUrl + cacheBuster, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Connection": "keep-alive"
        },
        redirect: "follow"
      });

      // 🌟 优化点 4：获取 Cloudflare 边缘节点最硬核的底层网络地理数据
      const cfColo = request.cf?.colo || "UNKNOWN"; // 例如: LAX, HKG, SJC
      const cfAsn = request.cf?.asn || "UNKNOWN";   // 运营商 ASN 骨干网号
      const cfCountry = request.cf?.country || "UNKNOWN"; // 请求来源国家/地区

      // 🌟 优化点 5：打包所有机房内幕数据，随 Header 一起反向吐给你的 VPS 脚本
      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", "application/json");
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");
      
      // 偷渡给 VPS 的核心网络情报
      responseHeaders.set("X-V9-Colo", cfColo);       // 物理机房代号
      responseHeaders.set("X-V9-ASN", `AS${cfAsn}`);   // 骨干网号
      responseHeaders.set("X-V9-From", cfCountry);    // 来源地

      return new Response(null, {
        status: response.status,
        headers: responseHeaders
      });

    } catch (err) {
      return new Response("Target Fetch Failed", { status: 502 });
    }
  }
};
