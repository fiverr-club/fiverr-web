"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface digest in dev without exposing stack traces to end users
    if (process.env.NODE_ENV === "development") {
      console.error("FIVERREX route error:", error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Something went wrong while loading this view
      </h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-gray-600">
        Your local escrow drafts, wishlist, and credit balance remain safely saved. Try reloading
        this screen or return to the homepage.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50"
        >
          <Home className="h-4 w-4 text-[#1dbf73]" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
