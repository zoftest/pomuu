import assert from "node:assert/strict";
import test from "node:test";
import { serve } from "../../test/helpers.mjs";
import { createWebServer } from "./server.mjs";

test("web reports an unavailable API without displaying its internal error", async (t) => {
  const base = await serve(t, createWebServer({ fetchImpl: async () => { throw new Error("private upstream detail"); } }));
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 502);
  const html = await response.text();
  assert.match(html, /role="alert"/);
  assert.doesNotMatch(html, /private upstream detail/);
});

test("web refuses incompatible or incorrect quote data", async (t) => {
  for (const result of [null, { amountCents: 2500 }, { quantity: 1, unitPriceCents: 2500, totalCents: 1, currency: "USD" }]) {
    const base = await serve(t, createWebServer({ fetchImpl: async () => Response.json(result) }));
    const response = await fetch(`${base}/`);
    assert.equal(response.status, 502);
    assert.match(await response.text(), /invalid quote/);
  }
});

test("web rejects invalid quantities before calling API", async (t) => {
  let calls = 0;
  const base = await serve(t, createWebServer({ fetchImpl: async () => { calls++; throw new Error("must not call"); } }));
  const response = await fetch(`${base}/?quantity=0`);
  assert.equal(response.status, 400);
  await response.text();
  assert.equal(calls, 0);
});
