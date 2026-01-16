import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChallengeCardSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-16 bg-gray-700" />
              <Skeleton className="h-5 w-20 bg-gray-700" />
              <Skeleton className="h-5 w-14 bg-gray-700" />
            </div>
            <Skeleton className="h-6 w-3/4 bg-gray-700 mb-3" />
            <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-5/6 bg-gray-700 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20 bg-gray-700" />
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-4 w-16 bg-gray-700" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
