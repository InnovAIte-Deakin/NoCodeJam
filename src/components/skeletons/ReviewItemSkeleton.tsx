import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ReviewItemSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-5 w-24 bg-gray-700" />
              <Skeleton className="h-5 w-20 bg-gray-700" />
              <Skeleton className="h-5 w-16 bg-gray-700" />
              <Skeleton className="h-5 w-28 bg-gray-700" />
            </div>
            <Skeleton className="h-6 w-2/3 bg-gray-700 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32 bg-gray-700" />
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Skeleton className="h-10 w-28 bg-gray-700" />
            <Skeleton className="h-10 w-28 bg-gray-700" />
            <Skeleton className="h-10 w-28 bg-gray-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
