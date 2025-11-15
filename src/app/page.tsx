import SearchComponent from '@/components/SearchComponent'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
          Khazanah Fikih
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-12">
          Platform pencarian canggih untuk menemukan rumusan musyawarah dan ibarat fikih dari berbagai sumber terpercaya
        </p>
        <SearchComponent />
      </div>
    </div>
  )
}