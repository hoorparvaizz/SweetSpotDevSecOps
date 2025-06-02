import { cn } from "@/lib/utils";
function Skeleton({ className, ...props }) {
  return <div className={cn("skeleton rounded-md", className)} {...props} />;
}
function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-lg border">
      <Skeleton className="w-full h-48" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mb-3" />
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
function OrderRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="py-4 px-4">
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-4" />
      </td>
    </tr>
  );
}
function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-3xl p-6 shadow-lg border">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}
export { Skeleton, ProductCardSkeleton, OrderRowSkeleton, StatsCardSkeleton };
