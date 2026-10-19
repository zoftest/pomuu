import assert from "node:assert/strict";
import test from "node:test";
import { serve } from "../../test/helpers.mjs";
import { createApiServer } from "./server.mjs";

test("API serves quotes over HTTP and defaults to one item", async (t) => {
  const base = await serve(t, createApiServer());
  const one = await fetch(`${base}/quote`);
  assert.equal(one.status, 200);
  assert.equal((await one.json()).totalCents, 2500);
  const two = await fetch(`${base}/quote?quantity=2`);
  assert.equal(two.status, 200);
  assert.deepEqual(await two.json(), { quantity: 2, unitPriceCents: 2500, totalCents: 5000, currency: "USD" });
});

test("API rejects invalid input, unknown routes and unsupported methods", async (t) => {
  const base = await serve(t, createApiServer());
  for (const quantity of ["", "0", "-1", "11", "1.5", "abc", "1e0"]) {
    const response = await fetch(`${base}/quote?quantity=${quantity}`);
    assert.equal(response.status, 400, quantity);
    assert.equal((await response.json()).error, "invalid_quantity");
  }
  const missing = await fetch(`${base}/missing`);
  assert.equal(missing.status, 404);
  await missing.json();
  const post = await fetch(`${base}/quote`, { method: "POST" });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get("allow"), "GET");
  await post.json();
});
