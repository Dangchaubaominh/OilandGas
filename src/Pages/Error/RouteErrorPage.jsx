import React from "react";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

function getErrorMessage(error) {
  if (!error) return "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    return error.data?.message || error.statusText || "Request failed.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong while loading this page.";
}

export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = getErrorMessage(error);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-rose-400">
          Application Error
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">
          Something broke on this page
        </h1>
        <p className="mt-4 text-slate-300">Status: {status}</p>
        <pre className="mt-3 max-h-56 overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-amber-300 whitespace-pre-wrap break-words">
          {message}
        </pre>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/dashboard", { replace: true })}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Open Dashboard
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
