import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Stock } from "./types";
import { getStocks, addStock, removeStock } from "./api";
import ReportDownloadButton from "./ReportDownloadButton";

const CURRENCIES: Stock["currency"][] = ["USD", "HKD", "RMB"];

const emptyForm: Stock = {
  yahooSymbol: "",
  name: "",
  currency: "HKD",
  futunnParam: "",
  aastocksParam: "",
};

const currencyStyles: Record<Stock["currency"], string> = {
  USD: "bg-blue-50 text-blue-700 ring-blue-600/20",
  HKD: "bg-sky-50 text-sky-700 ring-sky-600/20",
  RMB: "bg-slate-100 text-slate-700 ring-slate-600/20",
};

export default function StockManager() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Stock>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingSymbol, setDeletingSymbol] = useState<string | null>(null);

  useEffect(() => {
    loadStocks();
  }, []);

  async function loadStocks() {
    setLoading(true);
    setError(null);
    try {
      const data = await getStocks();
      data.sort((a, b) => a.yahooSymbol.localeCompare(b.yahooSymbol));
      setStocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stocks");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (stocks.some((s) => s.yahooSymbol === form.yahooSymbol)) {
      setError(`${form.yahooSymbol} already exists in the list`);
      return;
    }

    setSubmitting(true);
    try {
      const created = await addStock(form);
      setStocks((prev) =>
        [...prev, created].sort((a, b) =>
          a.yahooSymbol.localeCompare(b.yahooSymbol),
        ),
      );
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add stock");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(yahooSymbol: string) {
    const confirmed = window.confirm(
      `Remove ${yahooSymbol} from the watchlist? This can't be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    setDeletingSymbol(yahooSymbol);
    try {
      await removeStock(yahooSymbol);
      setStocks((prev) => prev.filter((s) => s.yahooSymbol !== yahooSymbol));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove stock");
    } finally {
      setDeletingSymbol(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-black">
              Stock Watchlist
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {stocks.length} {stocks.length === 1 ? "stock" : "stocks"} tracked
            </p>
          </div>
          <button
            onClick={loadStocks}
            className="mt-3 sm:mt-0 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <ReportDownloadButton />

        {error && (
          <div className="rounded-md bg-red-50 p-4 ring-1 ring-inset ring-red-200">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Add form card */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Add a stock
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
            >
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Symbol
                </label>
                <input
                  required
                  value={form.yahooSymbol}
                  onChange={(e) =>
                    setForm({ ...form, yahooSymbol: e.target.value.trim() })
                  }
                  placeholder="AAPL"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Apple Inc. (AAPL.US)"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currency: e.target.value as Stock["currency"],
                    })
                  }
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm"
                >
                  {CURRENCIES.map((c) => (
                    <option
                      key={c}
                      value={c}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Futunn param
                </label>
                <input
                  required
                  value={form.futunnParam}
                  onChange={(e) =>
                    setForm({ ...form, futunnParam: e.target.value })
                  }
                  placeholder="AAPL-US"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Aastocks param
                </label>
                <input
                  required
                  value={form.aastocksParam}
                  onChange={(e) =>
                    setForm({ ...form, aastocksParam: e.target.value })
                  }
                  placeholder="AAPL"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm"
                />
              </div>

              <div className="lg:col-span-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {submitting ? "Adding..." : "Add stock"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              Loading stocks...
            </div>
          ) : stocks.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-slate-500">No stocks yet.</p>
              <p className="text-sm text-slate-400 mt-1">
                Add one using the form above.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                    Symbol
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Currency
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Futunn
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold text-slate-900">
                    Aastocks
                  </th>
                  <th className="relative px-4 py-3.5 sm:pr-6">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {stocks.map((s) => (
                  <tr
                    key={s.yahooSymbol}
                    className="hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                      {s.yahooSymbol}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {s.name}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${currencyStyles[s.currency]}`}
                      >
                        {s.currency}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {s.futunnParam}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {s.aastocksParam}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleDelete(s.yahooSymbol)}
                        disabled={deletingSymbol === s.yahooSymbol}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {deletingSymbol === s.yahooSymbol
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
