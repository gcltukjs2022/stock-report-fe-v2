import type { Stock } from "./types";

// Set this to your API Gateway invoke URL, e.g.
// https://abc123xyz.execute-api.us-east-1.amazonaws.com
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export async function getStocks(): Promise<Stock[]> {
  const res = await fetch(`${API_BASE}/stocks`);
  if (!res.ok) {
    throw new Error(`Failed to fetch stocks (${res.status})`);
  }
  return res.json();
}

export async function addStock(stock: Stock): Promise<Stock> {
  const res = await fetch(`${API_BASE}/stocks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stock),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to add stock (${res.status})`);
  }
  return res.json();
}

export async function removeStock(yahooSymbol: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/stocks/${encodeURIComponent(yahooSymbol)}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error(`Failed to remove stock (${res.status})`);
  }
}
