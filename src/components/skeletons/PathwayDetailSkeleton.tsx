import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export function PathwayDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button className="flex items-center text-gray-300 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Pathways
        </button>

        {/* Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-6 w-24 bg-gray-700" />
                </div>
                <Skeleton className="h-8 w-3/4 bg-gray-700 mb-3" />
                <Skeleton className="h-5 w-full bg-gray-700 mb-2" />
                <Skeleton className="h-5 w-5/6 bg-gray-700" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center">
                  <Skeleton className="h-4 w-20 bg-gray-700 mx-auto mb-2" />
                  <Skeleton className="h-6 w-16 bg-gray-700 mx-auto" />
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <Skeleton className="h-11 w-full bg-gray-700" />
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-6">
          {[1, 2, 3].map(moduleIdx => (
            <Card key={moduleIdx} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-gray-700 mb-2" />
                <Skeleton className="h-4 w-full bg-gray-700" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2].map(challengeIdx => (
                    <div
                      key={challengeIdx}
                      className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-start flex-1">
                        <Skeleton className="h-6 w-6 rounded-full bg-gray-600 mr-3 mt-1" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-2/3 bg-gray-600 mb-2" />
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-16 bg-gray-600" />
                            <Skeleton className="h-4 w-20 bg-gray-600" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-9 w-20 bg-gray-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
