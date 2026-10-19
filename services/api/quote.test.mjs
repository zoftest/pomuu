import assert from "node:assert/strict";
import test from "node:test";
import { quote } from "./quote.mjs";

test("two items cost 5000 cents", () => {
  assert.deepEqual(quote(2), { quantity: 2, unitPriceCents: 2500, totalCents: 5000, currency: "USD" });
});

test("the smallest and largest allowed quantities work", () => {
  assert.equal(quote(1).totalCents, 2500);
  assert.equal(quote(10).totalCents, 25000);
});

test("invalid quantities are rejected instead of producing a quote", () => {
  for (const quantity of [0, -1, 11, 1.5, "2", undefined, NaN, Infinity]) {
    assert.throws(() => quote(quantity), RangeError);
  }
});
