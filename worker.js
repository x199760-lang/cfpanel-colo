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

    // 1. Host 安全闭环
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      return new Response("Access Denied: Host Forbidden", { status: 403 });
    }

    // 2. 安全锁鉴权
    const secretToken = request.headers.get("X-V9-Secret");
    if (secretToken !== "V9_Secure_Tunnel_Token_2026_RN") {
      return new Response("Unauthorized", { status: 401 });
    }

    // 3. 必须走指定的测速密道
    if (url.pathname !== "/probe") {
      return new Response("Not Found", { status: 404 });
    }

    // 🌟 新增高级变量：VPS 脚本可以通过这个 Header 声明它原本期望测试哪个机房（比如 HKG）
    const expectedColo = request.headers.get("X-V9-Expect-Colo") || "ANY";

    // 🎯 目标站
    const targetUrl = "https://www.youtube.com/";

    // 记录 Workers 开始向目标站发起请求的时间戳
    const startTime = Date.now();

    try {
      // 极致 HEAD 轻量化探针 + 粉碎缓存
      const cacheBuster = `?v9_ts=${startTime}_${Math.random().toString(36).substr(2, 5)}`;
      
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

      // 计算 CF 机房内部 ➔ YouTube 官方服务器的纯净消耗时间（毫秒）
      const cfInternalExecutionMs = Date.now() - startTime;

      // 捕获 Cloudflare 底层真实网络情报
      const actualColo = request.cf?.colo || "UNKNOWN"; 
      const cfAsn = request.cf?.asn || "UNKNOWN";   
      const cfCountry = request.cf?.country || "UNKNOWN"; 

      // 🌟 新增判定：检查当前被唤醒的机房是否符合预期
      let routeStatus = "Matched";
      if (expectedColo !== "ANY" && expectedColo.toUpperCase() !== actualColo.toUpperCase()) {
        // 如果原本想测香港，结果在洛杉矶被截胡了，打上 "Hijacked"（路由跑偏/吸流）标签
        routeStatus = "Hijacked";
      }

      // 打包情报随 Header 回传
      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", "application/json");
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");
      
      responseHeaders.set("X-V9-Colo", actualColo);       // 真正唤醒我的机房（如 LAX）
      responseHeaders.set("X-V9-ASN", `AS${cfAsn}`);   
      responseHeaders.set("X-V9-From", cfCountry);    
      
      // 🌟 核心情报 1：路由状态标签（Matched 或 Hijacked）
      responseHeaders.set("X-V9-Route-Status", routeStatus); 
      
      // 🌟 核心情报 2：CF机房内部去戳YouTube花了多少毫秒。
      // 这个指标无视跨太平洋公网延迟，精准体现 CF 机房当时的内部排队、带宽权重和沙盒性能！
      responseHeaders.set("X-V9-Internal-Ms", cfInternalExecutionMs.toString());

      return new Response(null, {
        status: response.status,
        headers: responseHeaders
      });

    } catch (err) {
      return new Response("Target Fetch Failed", { status: 502 });
    }
  }
};
