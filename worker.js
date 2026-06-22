export default {
  async fetch(request, env, ctx) {
    // 🌟 核心防线 1：绝密安全锁 (Token 鉴权)
    // 防止被全网扫描器白嫖流量、疯狂刷你的 Worker 额度
    const secretToken = request.headers.get("X-V9-Secret");
    if (secretToken !== "V9_Secure_Tunnel_Token_2026_RN") {
      return new Response("Unauthorized", { status: 401 });
    }

    // 🌟 核心防线 2：安全过滤机制
    // 只允许 VPS 脚本通过特定的探针路径访问，其他乱戳的一律拒绝
    const url = new URL(request.url);
    if (url.pathname !== "/probe") {
      return new Response("Not Found", { status: 404 });
    }

    // 🎯 完美工具人目标站
    const targetUrl = "https://www.youtube.com/";

    try {
      // 🌟 核心优化 3：把网络大卡车（GET）变成超级跑车（HEAD）
      // 我们只使用 HEAD 请求，去抓 YouTube 官方服务器的响应头，不下载任何网页肉体！
      // 这能把 CF 机房的响应速度拉满，且极度节省 VPS 测速时的并发带宽
      const response = await fetch(targetUrl, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Cache-Control": "no-cache", // 强制每次都去戳 YouTube，拿到最真实的动态响应时间
          "Connection": "keep-alive"
        },
        redirect: "follow"
      });

      // 🌟 核心处理 4：将状态码和原厂 Headers 干净利落地吐回给你的 VPS 脚本
      return new Response(null, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "X-V9-Status": "Success",
          "Cache-Control": "no-store"
        }
      });

    } catch (err) {
      // 如果 CF 机房连接目标站挂了，透传 502 错误
      return new Response("Target Fetch Failed", { status: 502 });
    }
  }
};
