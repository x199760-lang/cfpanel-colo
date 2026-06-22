const ALLOWED_HOSTS = [
  "w1.vpstool09.xyz",
  "w2.vpstool09.xyz",
  "w3.vpstool09.xyz",
  "w4.vpstool09.xyz",
  "w5.vpstool09.xyz",
  "colo.vpstool09.xyz"
];

const SECRET = "V9_Secure_Tunnel_Token_2026_RN";

const TARGETS = [
  ["YT", "https://www.youtube.com/"],
  ["GPT", "https://chatgpt.com/"],
  ["X", "https://x.com/"],
  ["TK", "https://www.tiktok.com/"],
  ["GOOGLE", "https://www.google.com/"]
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function probeTarget(name, targetUrl) {
  const start = Date.now();

  try {
    const cacheBuster = `?v9_ts=${start}_${Math.random().toString(36).slice(2, 8)}`;

    const response = await fetch(targetUrl + cacheBuster, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      },
      redirect: "follow",
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    });

    let bodyBytes = 0;

    if (response.body) {
      const reader = response.body.getReader();

      while (bodyBytes < 8192) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) bodyBytes += value.byteLength;
      }

      try {
        await reader.cancel();
      } catch (_) {}
    }

    return {
      name,
      ok: response.ok && bodyBytes > 0,
      status: response.status,
      ms: Date.now() - start,
      bytes: bodyBytes,
      type: response.headers.get("content-type") || ""
    };

  } catch (err) {
    return {
      name,
      ok: false,
      status: 0,
      ms: Date.now() - start,
      bytes: 0,
      type: "",
      error: err.name || "FetchFailed"
    };
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      return new Response("Access Denied: Host Forbidden", { status: 403 });
    }

    const secretToken = request.headers.get("X-V9-Secret");
    if (secretToken !== SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (url.pathname !== "/probe") {
      return new Response("Not Found", { status: 404 });
    }

    if (request.method !== "HEAD" && request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const expectedColo = request.headers.get("X-V9-Expect-Colo") || "ANY";

    const actualColo = request.cf?.colo || "UNKNOWN";
    const cfAsn = request.cf?.asn || "UNKNOWN";
    const cfCountry = request.cf?.country || "UNKNOWN";

    let routeStatus = "Matched";
    if (expectedColo !== "ANY" && expectedColo.toUpperCase() !== actualColo.toUpperCase()) {
      routeStatus = "Hijacked";
    }

    const allStart = Date.now();
    const results = [];

    for (let i = 0; i < TARGETS.length; i++) {
      const [name, targetUrl] = TARGETS[i];

      const result = await probeTarget(name, targetUrl);
      results.push(result);

      if (i < TARGETS.length - 1) {
        const waitMs = 500 + Math.floor(Math.random() * 1500);
        await sleep(waitMs);
      }
    }

    const totalInternalMs = Date.now() - allStart;

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    headers.set("X-V9-Colo", actualColo);
    headers.set("X-V9-ASN", `AS${cfAsn}`);
    headers.set("X-V9-From", cfCountry);
    headers.set("X-V9-Route-Status", routeStatus);
    headers.set("X-V9-Internal-Total-Ms", totalInternalMs.toString());

    let okCount = 0;

    for (const r of results) {
      headers.set(`X-V9-${r.name}-Ms`, String(r.ms));
      headers.set(`X-V9-${r.name}-Status`, String(r.status));
      headers.set(`X-V9-${r.name}-Ok`, r.ok ? "1" : "0");
      headers.set(`X-V9-${r.name}-Bytes`, String(r.bytes));
      headers.set(`X-V9-${r.name}-Type`, r.type.slice(0, 80));

      if (r.error) {
        headers.set(`X-V9-${r.name}-Error`, r.error);
      }

      if (r.ok) okCount++;
    }

    headers.set("X-V9-Ok-Count", String(okCount));
    headers.set("X-V9-Target-Count", String(TARGETS.length));

    return new Response(JSON.stringify({
      colo: actualColo,
      route_status: routeStatus,
      total_ms: totalInternalMs,
      ok_count: okCount,
      targets: results
    }), {
      status: okCount > 0 ? 200 : 502,
      headers
    });
  }
};