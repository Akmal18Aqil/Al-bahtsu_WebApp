import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-10 w-48" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 w-full">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
              <Skeleton className="h-7 w-24 shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Question Section Skeleton */}
            <div>
              <Skeleton className="h-7 w-40 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Answer Section Skeleton */}
            <div>
              <Skeleton className="h-7 w-52 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>

            {/* Ibarat Section Skeleton */}
            <div>
              <Skeleton className="h-7 w-40 mb-3" />
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>

            {/* Metadata Section Skeleton */}
            <div className="grid md:grid-cols-2 gap-4 pt-6 border-t">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* Date Section Skeleton */}
            <div className="pt-6 border-t">
              <Skeleton className="h-5 w-56" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
