import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { quote } from "./quote.mjs";

export function createApiServer() {
  return createServer((req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(body));
    };
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return send(405, { error: "method_not_allowed" });
    }
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/health") return send(200, { service: "api", status: "ok" });
    if (url.pathname !== "/quote") return send(404, { error: "not_found" });
    const quantity = url.searchParams.get("quantity") ?? "1";
    if (!/^(?:[1-9]|10)$/.test(quantity)) {
      return send(400, { error: "invalid_quantity", detail: "Choose a whole number from 1 to 10" });
    }
    return send(200, quote(Number(quantity)));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 4101);
  const host = process.env.HOST ?? "127.0.0.1";
  createApiServer().listen(port, host, () => console.log(`API listening on http://${host}:${port}`));
}
