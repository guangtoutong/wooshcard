export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Title skeleton */}
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />

        {/* Tabs skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 rounded-md bg-muted animate-pulse" />
          ))}
        </div>

        {/* Transaction rows skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
