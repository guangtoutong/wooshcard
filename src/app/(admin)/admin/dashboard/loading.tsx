export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className="h-9 w-48 rounded bg-muted animate-pulse" />

      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
