import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, BookOpen, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'

interface EntryDetailPageProps {
  params: Promise<{ id: string }>
}

interface FiqhEntry {
  id: string
  title: string
  question_text?: string
  answer_summary: string
  ibarat_text: string
  source_kitab?: string
  source_details?: string
  musyawarah_source?: string
  entry_type: 'rumusan' | 'ibarat'
  created_at: string
}

export async function generateMetadata({ params }: EntryDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const { data: entry } = await supabase
    .from('fiqh_entries')
    .select('title')
    .eq('id', id)
    .single()

  if (!entry) {
    return {
      title: 'Entri Tidak Ditemukan - Khazanah Fikih',
    }
  }

  return {
    title: `${entry.title} - Khazanah Fikih`,
    description: entry.title,
  }
}

export default async function EntryDetailPage({ params }: EntryDetailPageProps) {
  const { id } = await params
  const { data: entry, error } = await supabase
    .from('fiqh_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !entry) {
    console.error('Entry fetch error:', error)
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/search">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Pencarian
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl md:text-3xl leading-tight">
                {entry.title}
              </CardTitle>
              <Badge variant={entry.entry_type === 'ibarat' ? 'default' : 'secondary'} className="shrink-0">
                {entry.entry_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {entry.question_text && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Pertanyaan
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {entry.question_text}
                </p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-2">Ringkasan Jawaban</h3>
              <div className="prose prose-gray max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">
                  {entry.answer_summary}
                </p>
              </div>
            </div>

            {entry.ibarat_text && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Ibarat Fikih</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p 
                    className="font-arabic rtl text-lg leading-loose text-right"
                    style={{ fontFamily: 'var(--font-arabic)' }}
                  >
                    {entry.ibarat_text}
                  </p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              {entry.source_kitab && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Sumber Kitab
                  </h4>
                  <p className="text-sm">
                    {entry.source_kitab}
                    {entry.source_details && (
                      <span className="text-muted-foreground">
                        {' - '}{entry.source_details}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {entry.musyawarah_source && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Sumber Musyawarah
                  </h4>
                  <p className="text-sm">{entry.musyawarah_source}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Ditambahkan pada {formatDate(entry.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}