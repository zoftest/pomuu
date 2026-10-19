export function quote(quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new RangeError("Quantity must be a whole number from 1 to 10");
  }
  const unitPriceCents = 2500;
  return { quantity, unitPriceCents, totalCents: quantity * unitPriceCents, currency: "USD" };
}
