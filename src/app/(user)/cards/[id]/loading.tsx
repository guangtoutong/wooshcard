export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Title skeleton */}
        <div className="h-8 w-40 rounded bg-muted animate-pulse" />

        {/* Virtual card skeleton */}
        <div className="h-52 rounded-xl bg-muted animate-pulse" />

        {/* Card details skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>

        {/* Transaction list skeleton */}
        <div className="space-y-3 mt-10">
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
