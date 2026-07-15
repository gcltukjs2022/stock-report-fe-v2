import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const REPORT_LAMBDA_URL = import.meta.env.REPORT_LAMBDA_URL;
const REPORT_BUCKET_URL = import.meta.env.REPORT_BUCKET_URL;

/**
 * Reports are generated on a schedule and only considered "ready" to view
 * within this UTC window. Mirrors the backend job's run time.
 */
function isWithinReportWindow(date: Date): boolean {
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  return (
    (hours === 8 && minutes >= 45) ||
    (hours > 8 && hours < 12) ||
    (hours === 15 && minutes <= 45)
  );
}

function getTodayReportUrl(): string {
  return `${REPORT_BUCKET_URL}/report${moment().format("DDMMYYYY")}.docx`;
}

export default function ReportDownloadButton() {
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReady(isWithinReportWindow(new Date()));
  }, []);

  async function handleRefresh() {
    setError(null);
    setRefreshing(true);
    try {
      await axios.get(REPORT_LAMBDA_URL);
      setReady(isWithinReportWindow(new Date()));
    } catch (err) {
      console.error("Error refreshing report:", err);
      setError("Failed to refresh the report");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-black">Daily report</h2>
        {error ? (
          <p className="text-xs text-red-600 mt-0.5">{error}</p>
        ) : !ready ? (
          <p className="text-xs text-slate-500 mt-0.5">
            Ready between 08:45 and 14:45 UTC
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        {ready ? (
          <a
            href={getTodayReportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Download report
          </a>
        ) : (
          <span className="inline-flex justify-center rounded-md bg-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
            Download report
          </span>
        )}
      </div>
    </div>
  );
}
