import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TemplateSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full mt-4" />
      </div>
    </Card>
  );
}
