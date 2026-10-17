import { describe, expect, it, vi } from "vitest";

import { openOrderBlank } from "@/lib/order-blank";
import type { Order } from "@/lib/orders-store";

const order: Order = {
  id: "ORD-0001",
  status: "Необработена",
  customer: "Иван Иванов",
  phone: "0888 111 222",
  city: "София",
  address: "ул. Тест 1",
  courier: "Еконт",
  created: "2026-10-14",
  items: [{ sku: "PRF-ROSE-50", name: "Rose Élixir", quantity: 2, price: 49 }],
  shipping: 4.9,
  note: "",
  payment: "Наложен платеж",
};

// The blank must hide per-product prices: only the order total with VAT is printed.
async function blankHtml(orders: Order[]) {
  let html = "";
  const win = { document: { write: (s: string) => { html += s; }, close: () => {} } };
  vi.stubGlobal("open", () => win);
  try {
    await openOrderBlank(orders);
  } finally {
    vi.unstubAllGlobals();
  }
  return html;
}

describe("Order blank", () => {
  it("shows only the order total with VAT, never per-product prices", async () => {
    const html = await blankHtml([order]);

    expect(html).toContain("Общо с ДДС");
    expect(html).toContain("102,90 €");

    expect(html).not.toContain("Ед. цена");
    expect(html).not.toContain("Междинна сума");
    expect(html).not.toContain("<span>Доставка</span>");
    expect(html).not.toContain("49,00");
  });
});
