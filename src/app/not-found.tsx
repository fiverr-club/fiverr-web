import Link from "next/link";
import { ArrowLeft, Compass, FolderKanban, Sparkles, Trophy, Users } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#0a4226]">
        <Compass className="h-3.5 w-3.5 text-[#1dbf73]" />
        <span>404 • Page Not Found</span>
      </div>

      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        We couldn&apos;t locate that route<span className="text-[#1dbf73]">.</span>
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-600">
        The gig, project brief, or freelancer profile you requested may have moved or been removed.
        Jump straight back into FIVERREX below.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1dbf73] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#19a463]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Explore Marketplace</span>
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-800 transition hover:border-[#1dbf73]"
        >
          <FolderKanban className="h-4 w-4 text-[#1dbf73]" />
          <span>500+ Open Jobs</span>
        </Link>
        <Link
          href="/quests"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-800 transition hover:border-[#1dbf73]"
        >
          <Trophy className="h-4 w-4 text-amber-500" />
          <span>Quests (+500 Credits)</span>
        </Link>
        <Link
          href="/sellers"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-gray-800 transition hover:border-[#1dbf73]"
        >
          <Users className="h-4 w-4 text-indigo-600" />
          <span>Freelancers</span>
        </Link>
        <Link
          href="/ai-assistant"
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-[#0a4226] transition hover:bg-emerald-100"
        >
          <Sparkles className="h-4 w-4 text-[#1dbf73]" />
          <span>AI Agent Copilot</span>
        </Link>
      </div>
    </div>
  );
}
