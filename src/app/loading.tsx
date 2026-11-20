export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-40 rounded-3xl bg-gradient-to-r from-emerald-950/15 via-emerald-900/10 to-gray-200/70" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="h-40 rounded-xl bg-gray-200/80" />
              <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-6 w-20 rounded-lg bg-emerald-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
