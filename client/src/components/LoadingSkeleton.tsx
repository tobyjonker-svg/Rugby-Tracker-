import { Card } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="card-neon p-6 h-24">
          <div className="space-y-2">
            <div className="h-4 bg-background/50 rounded w-3/4"></div>
            <div className="h-3 bg-background/50 rounded w-1/2"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function LoadingSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="card-neon p-6 h-32">
          <div className="space-y-2">
            <div className="h-4 bg-background/50 rounded w-3/4"></div>
            <div className="h-3 bg-background/50 rounded w-1/2"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-neon-cyan/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-neon-pink border-r-neon-cyan rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
