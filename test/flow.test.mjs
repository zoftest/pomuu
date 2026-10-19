import assert from "node:assert/strict";
import test from "node:test";
import { createApiServer } from "../services/api/server.mjs";
import { createWebServer } from "../services/web/server.mjs";
import { serve } from "./helpers.mjs";

test("a real HTTP request goes through web to API and displays the quote", async (t) => {
  const apiUrl = await serve(t, createApiServer());
  const webUrl = await serve(t, createWebServer({ apiUrl }));
  for (const [quantity, total] of [[2, "$50.00"], [3, "$75.00"]]) {
    const response = await fetch(`${webUrl}/?quantity=${quantity}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(total));
    assert.ok(html.includes(`${quantity} × $25.00 per item`));
  }
});

test("each service has its own health endpoint", async (t) => {
  const apiUrl = await serve(t, createApiServer());
  const webUrl = await serve(t, createWebServer({ apiUrl }));
  for (const [base, service] of [[apiUrl, "api"], [webUrl, "web"]]) {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { service, status: "ok" });
  }
});
