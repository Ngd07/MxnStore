export function ShopSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3].map((section) => (
        <div key={section} className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-gradient-to-r from-secondary via-secondary/50 to-secondary" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-secondary/50" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <div className="aspect-square w-full animate-pulse bg-gradient-to-br from-secondary/30 via-secondary/20 to-secondary/30" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-secondary/40" />
                  <div className="h-4 w-full animate-pulse rounded-lg bg-secondary/30" />
                  <div className="h-3 w-24 animate-pulse rounded-full bg-secondary/40" />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/20" />
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
