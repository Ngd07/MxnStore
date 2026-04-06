export function ShopSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3].map((section) => (
        <div key={section} className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 rounded-lg bg-gradient-to-r from-secondary/60 via-secondary/40 to-secondary/60 animate-shimmer" />
            <div className="h-6 w-20 rounded-full bg-secondary/40 animate-shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-border/30 glass-card"
              >
                <div className="aspect-square w-full bg-gradient-to-br from-secondary/20 via-secondary/10 to-secondary/20 animate-shimmer" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-3 w-20 rounded-full bg-secondary/30 animate-shimmer" />
                  <div className="h-4 w-full rounded-lg bg-secondary/20 animate-shimmer" />
                  <div className="h-3 w-24 rounded-full bg-secondary/30 animate-shimmer" />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-6 w-16 rounded-lg bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/10 animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
