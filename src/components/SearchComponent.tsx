'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function SearchComponent({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative flex gap-2">
        <Input
          type="text"
          placeholder="Cari rumusan atau ibarat fikih..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 h-12 text-base px-4"
        />
        <Button type="submit" size="lg" className="h-12 px-6">
          <Search className="w-5 h-5" />
        </Button>
      </div>
    </form>
  )
}