export function SkeletonLoader({ className = "" }) {
  return <div className={`skeleton rounded ${className}`} />;
}
export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-lg border">
      <SkeletonLoader className="w-full h-48" />
      <div className="p-4 space-y-3">
        <SkeletonLoader className="h-5 w-3/4" />
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <SkeletonLoader className="h-6 w-16" />
          <SkeletonLoader className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
export function OrderCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-4 border">
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-5 w-24" />
        <SkeletonLoader className="h-6 w-20" />
      </div>
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-2/3" />
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-4 w-32" />
        <SkeletonLoader className="h-6 w-16" />
      </div>
    </div>
  );
}
