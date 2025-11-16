import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

interface FiqhCardProps {
  entry: FiqhEntry
}

export default function FiqhCard({ entry }: FiqhCardProps) {
  return (
    <Link href={`/entry/${entry.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl line-clamp-2">{entry.title}</CardTitle>
            <Badge variant={entry.entry_type === 'ibarat' ? 'default' : 'secondary'}>
              {entry.entry_type}
            </Badge>
          </div>
          {entry.question_text && (
            <CardDescription className="line-clamp-2">
              {entry.question_text}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Ringkasan Jawaban:
              </h4>
              <p className="text-sm line-clamp-3">{entry.answer_summary}</p>
            </div>
            
            {entry.ibarat_text && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Ibarat:
                </h4>
                <p className="text-sm font-arabic rtl line-clamp-2">
                  {entry.ibarat_text}
                </p>
              </div>
            )}

            {entry.musyawarah_source && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Sumber Musyawarah:
                </h4>
                <p className="text-sm text-muted-foreground">{entry.musyawarah_source}</p>
              </div>
            )}

            {entry.source_kitab && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Kitab:
                </h4>
                <p className="text-sm text-muted-foreground">
                  {entry.source_kitab}
                  {entry.source_details && ` - ${entry.source_details}`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}