import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

function page(quantity, result = null) {
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const summary = result
    ? `<p class="label">Your quote</p><p class="total">${money.format(result.totalCents / 100)}</p><p>${quantity} × ${money.format(result.unitPriceCents / 100)} per item</p>`
    : '<p role="alert">The API is unavailable or returned an invalid quote. Please try again.</p>';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pomuu — Quote demo</title><style>
*{box-sizing:border-box}body{margin:0;background:#f4f6f4;color:#18352c;font:17px/1.6 system-ui,sans-serif}main{max-width:640px;margin:10vh auto;padding:28px}h1{font-size:44px;line-height:1.1;letter-spacing:-2px;margin:16px 0}.label{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#527264}.card{background:white;border:1px solid #d6e0db;border-radius:16px;padding:26px;margin-top:28px}form{display:flex;gap:12px;align-items:end;flex-wrap:wrap}label{display:block;font-size:14px;font-weight:600}input,button{font:inherit;border-radius:8px;padding:10px 16px}input{width:100px;border:1px solid #a7bcb0}button{background:#175e46;color:white;border:0;cursor:pointer}.total{font-size:48px;line-height:1.1;font-weight:700;margin:14px 0}.note{font-size:14px;color:#527264}a{color:inherit}
</style></head><body><main><p class="label">Pomuu · test application</p>
<h1>A small quote.<br>Two services.</h1><p>Choose a quantity to get a quote from the API.</p>
<section class="card" aria-label="Quote calculator"><form method="get" action="/">
<div><label for="quantity">Quantity</label><input id="quantity" name="quantity" type="number" min="1" max="10" value="${quantity}" required></div>
<button type="submit">Get quote</button></form><hr style="border:0;border-top:1px solid #e4ebe7;margin:26px 0">${summary}</section>
<p class="note">Demo prices only. No orders or payments are created.</p></main></body></html>`;
}

export function createWebServer({ apiUrl = process.env.API_URL ?? "http://127.0.0.1:4101", fetchImpl = fetch } = {}) {
  return createServer(async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" }).end("Method not allowed");
      return;
    }
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ service: "web", status: "ok" }));
      return;
    }
    if (url.pathname !== "/") {
      res.writeHead(404).end("Not found");
      return;
    }
    const input = url.searchParams.get("quantity") ?? "1";
    if (!/^(?:[1-9]|10)$/.test(input)) {
      res.writeHead(400, { "content-type": "text/plain; charset=utf-8" }).end("Choose a whole number from 1 to 10");
      return;
    }
    const quantity = Number(input);
    try {
      const endpoint = new URL("/quote", apiUrl);
      endpoint.searchParams.set("quantity", input);
      const response = await fetchImpl(endpoint, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) throw new Error("API unavailable");
      const result = await response.json();
      if (!result || result.quantity !== quantity || result.currency !== "USD" ||
          !Number.isSafeInteger(result.unitPriceCents) || result.unitPriceCents < 0 ||
          !Number.isSafeInteger(result.totalCents) || result.totalCents !== quantity * result.unitPriceCents) {
        throw new Error("Invalid quote");
      }
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(page(quantity, result));
    } catch {
      res.writeHead(502, { "content-type": "text/html; charset=utf-8" }).end(page(quantity));
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 4100);
  const host = process.env.HOST ?? "127.0.0.1";
  createWebServer().listen(port, host, () => console.log(`Web listening on http://${host}:${port}`));
}
