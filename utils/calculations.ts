
import { ReceiptData, Assignment, PersonTotal } from "../types";

export const calculateTotals = (
  receipt: ReceiptData,
  assignments: Assignment[]
): PersonTotal[] => {
  const personMap: Record<string, { subtotal: number; items: string[] }> = {};

  // 1. Calculate base subtotal per person
  // assignments is a list of { itemId, assignedTo: string[] }
  assignments.forEach(({ itemId, assignedTo }) => {
    const item = receipt.items.find((i) => i.id === itemId);
    if (!item || assignedTo.length === 0) return;

    const share = item.price / assignedTo.length;

    assignedTo.forEach((personName) => {
      const name = personName.trim();
      if (!personMap[name]) {
        personMap[name] = { subtotal: 0, items: [] };
      }
      personMap[name].subtotal += share;
      if (!personMap[name].items.includes(item.name)) {
        personMap[name].items.push(item.name);
      }
    });
  });

  const totalAssignedSubtotal = Object.values(personMap).reduce(
    (acc, p) => acc + p.subtotal,
    0
  );

  // 2. Distribute tax and tip proportionally
  // If no one is assigned anything, return empty
  if (totalAssignedSubtotal === 0) return [];

  const results: PersonTotal[] = Object.entries(personMap).map(([name, data]) => {
    const proportion = data.subtotal / totalAssignedSubtotal;
    const taxShare = receipt.tax * proportion;
    const tipShare = receipt.tip * proportion;
    const total = data.subtotal + taxShare + tipShare;

    return {
      name,
      subtotal: data.subtotal,
      taxShare,
      tipShare,
      total,
      items: data.items,
    };
  });

  return results;
};
