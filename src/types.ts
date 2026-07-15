export interface Stock {
  yahooSymbol: string;
  name: string;
  currency: "USD" | "HKD" | "RMB";
  futunnParam: string;
  aastocksParam: string;
}

export type NewStock = Stock;
