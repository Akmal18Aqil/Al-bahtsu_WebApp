'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface FiqhEntry {
  id?: string
  title: string
  question_text?: string
  answer_summary: string
  ibarat_text: string
  source_kitab?: string
  source_details?: string
  musyawarah_source?: string
  entry_type: 'rumusan' | 'ibarat'
}

interface AdminFormProps {
  entry?: FiqhEntry
  isEdit?: boolean
}

export default function AdminForm({ entry, isEdit = false }: AdminFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FiqhEntry>({
    title: entry?.title || '',
    question_text: entry?.question_text || '',
    answer_summary: entry?.answer_summary || '',
    ibarat_text: entry?.ibarat_text || '',
    source_kitab: entry?.source_kitab || '',
    source_details: entry?.source_details || '',
    musyawarah_source: entry?.musyawarah_source || '',
    entry_type: entry?.entry_type || 'ibarat',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const url = isEdit ? `/api/admin/entries/${entry?.id}` : '/api/admin/entries'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FiqhEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Entri' : 'Tambah Entri Baru'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Perbarui data rumusan atau ibarat fikih' : 'Masukkan data rumusan atau ibarat fikih baru'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Entri Fikih</CardTitle>
          <CardDescription>
            Isi semua field yang diperlukan. Field dengan * wajib diisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Judul/Topik Masalah *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="contoh: Hukum Asuransi Jiwa"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_type">Tipe Entri *</Label>
                <Select 
                  value={formData.entry_type} 
                  onValueChange={(value) => handleInputChange('entry_type', value as 'rumusan' | 'ibarat')}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe entri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ibarat">Ibarat</SelectItem>
                    <SelectItem value="rumusan">Rumusan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">Teks Pertanyaan (Opsional)</Label>
              <Textarea
                id="question_text"
                value={formData.question_text}
                onChange={(e) => handleInputChange('question_text', e.target.value)}
                placeholder="Deskripsi singkat masalah yang dibahas"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer_summary">Ringkasan Jawaban *</Label>
              <Textarea
                id="answer_summary"
                value={formData.answer_summary}
                onChange={(e) => handleInputChange('answer_summary', e.target.value)}
                placeholder="Teks jawaban/rumusan dalam Bahasa Indonesia"
                rows={6}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ibarat_text">Teks Ibarat *</Label>
              <Textarea
                id="ibarat_text"
                value={formData.ibarat_text}
                onChange={(e) => handleInputChange('ibarat_text', e.target.value)}
                placeholder="Teks ibarat dalam Bahasa Arab (termasuk harakat)"
                rows={6}
                required
                disabled={isLoading}
                className="font-arabic rtl text-right"
                style={{ fontFamily: 'var(--font-arabic)' }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="source_kitab">Nama Kitab (Opsional)</Label>
                <Input
                  id="source_kitab"
                  value={formData.source_kitab}
                  onChange={(e) => handleInputChange('source_kitab', e.target.value)}
                  placeholder="contoh: Fathul Mu'in"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_details">Detail Sumber (Opsional)</Label>
                <Input
                  id="source_details"
                  value={formData.source_details}
                  onChange={(e) => handleInputChange('source_details', e.target.value)}
                  placeholder="contoh: Bab Buyu', Hal. 50"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="musyawarah_source">Sumber Musyawarah (Opsional)</Label>
              <Input
                id="musyawarah_source"
                value={formData.musyawarah_source}
                onChange={(e) => handleInputChange('musyawarah_source', e.target.value)}
                placeholder="contoh: LBMNU Jatim, 2023 atau Muktamar NU ke-31"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? 'Perbarui Entri' : 'Simpan Entri'}
              </Button>
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}