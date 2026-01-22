import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PathwayCardSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-6 w-20 bg-gray-700" />
              <Skeleton className="h-6 w-24 bg-gray-700" />
            </div>
            <Skeleton className="h-7 w-3/4 bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-full bg-gray-700 mb-1" />
            <Skeleton className="h-4 w-2/3 bg-gray-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-24 bg-gray-700" />
            <Skeleton className="h-4 w-20 bg-gray-700" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <Skeleton className="h-4 w-20 bg-gray-700" />
            <Skeleton className="h-4 w-24 bg-gray-700" />
          </div>
          <Skeleton className="h-10 w-full bg-gray-700" />
        </div>
      </CardContent>
    </Card>
  );
}
