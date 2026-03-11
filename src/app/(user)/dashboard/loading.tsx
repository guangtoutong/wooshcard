export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-10">
        {/* Balance card + Quick actions skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="h-32 w-full md:w-48 rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Cards section skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-40 rounded bg-muted animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
