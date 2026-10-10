import { describe, expect, it } from "vitest";
import { calculateTotals } from "./calculations";
import type { ReceiptData } from "../types";

const receipt: ReceiptData = {
  items: [
    { id: "burger", name: "Burger", price: 20 },
    { id: "salad", name: "Salad", price: 10 },
    { id: "nachos", name: "Nachos", price: 12 },
  ],
  tax: 4.2,
  tip: 8.4,
  subtotal: 42,
  total: 54.6,
  currency: "$",
};

const byName = (rows: ReturnType<typeof calculateTotals>) => Object.fromEntries(rows.map((r) => [r.name, r]));

describe("calculateTotals", () => {
  it("splits shared items evenly and distributes tax and tip by share of subtotal", () => {
    const t = byName(
      calculateTotals(receipt, [
        { itemId: "burger", assignedTo: ["Alice"] },
        { itemId: "salad", assignedTo: ["Bob"] },
        { itemId: "nachos", assignedTo: ["Alice", "Bob"] },
      ])
    );
    expect(t.Alice.subtotal).toBeCloseTo(26);
    expect(t.Bob.subtotal).toBeCloseTo(16);
    // Alice spent 26/42 of the subtotal, so she covers 26/42 of tax and tip
    expect(t.Alice.taxShare).toBeCloseTo((4.2 * 26) / 42);
    expect(t.Bob.tipShare).toBeCloseTo((8.4 * 16) / 42);
  });

  it("adds up to the receipt total when every item is assigned", () => {
    const rows = calculateTotals(receipt, [
      { itemId: "burger", assignedTo: ["Alice"] },
      { itemId: "salad", assignedTo: ["Bob"] },
      { itemId: "nachos", assignedTo: ["Alice", "Bob", "Cara"] },
    ]);
    expect(rows.reduce((s, r) => s + r.total, 0)).toBeCloseTo(receipt.total);
  });

  it("trims names so 'Alice ' and 'Alice' are one person", () => {
    const rows = calculateTotals(receipt, [
      { itemId: "burger", assignedTo: ["Alice "] },
      { itemId: "salad", assignedTo: ["Alice"] },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].items).toEqual(["Burger", "Salad"]);
  });

  it("ignores unknown items and empty assignments, and returns nothing when nothing is assigned", () => {
    expect(calculateTotals(receipt, [{ itemId: "ghost", assignedTo: ["Alice"] }])).toEqual([]);
    expect(calculateTotals(receipt, [{ itemId: "burger", assignedTo: [] }])).toEqual([]);
  });
});
