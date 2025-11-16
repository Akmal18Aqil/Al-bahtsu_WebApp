import SearchComponent from '@/components/SearchComponent'
import FiqhCardSkeleton from '@/components/FiqhCardSkeleton'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Mencari...
        </h1>
        <SearchComponent />
        
        <div className="mt-8">
          <div className="space-y-6">
            <FiqhCardSkeleton />
            <FiqhCardSkeleton />
            <FiqhCardSkeleton />
            <FiqhCardSkeleton />
            <FiqhCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
