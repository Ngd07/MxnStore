export function ShopSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3].map((section) => (
        <div key={section} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-40 animate-pulse rounded-md bg-secondary" />
            <div className="h-5 w-16 animate-pulse rounded-md bg-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="aspect-square w-full animate-pulse bg-secondary" />
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
                  <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-secondary" />
                    <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
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
