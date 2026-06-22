export default {
  async fetch(request, env, ctx) {
    // 🎯 目标明确：强行抓取 YouTube 首页，测试首包和初始文字骨架的加载速度
    const targetUrl = "https://www.youtube.com/"; 
    
    // 构造请求头，模拟真实浏览器
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    try {
      const response = await fetch(modifiedRequest);
      
      // 把当前承载你 Worker 的 CF 内部机房节点（例如 LAX/SJC）塞进 Header 带回给 VPS
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-CF-Colo", request.cf ? request.cf.colo : "UNKNOWN");
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (err) {
      return new Response(`Worker 抓取失败: ${err.message}`, { status: 500 });
    }
  },
};
