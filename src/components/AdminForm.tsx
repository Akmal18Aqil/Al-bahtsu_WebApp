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
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface SourceBook {
  id?: string
  kitab_name: string
  details?: string
  order_index: number
}

interface FiqhEntry {
  id?: string
  title: string
  question_text?: string
  answer_summary: string
  ibarat_text: string
  source_books?: SourceBook[]
  musyawarah_source?: string
  entry_type: 'rumusan' | 'ibarat'
}

interface AdminFormProps {
  entry?: FiqhEntry
  isEdit?: boolean
}

export default function AdminForm({ entry, isEdit = false }: AdminFormProps) {
  const router = useRouter()
  
  // Normalize source_books dari entry
  const normalizeSourceBooks = (books: any): SourceBook[] => {
    if (!books) return [{ kitab_name: '', details: '', order_index: 0 }]
    if (!Array.isArray(books)) return [{ kitab_name: '', details: '', order_index: 0 }]
    if (books.length === 0) return [{ kitab_name: '', details: '', order_index: 0 }]
    
    return books.map((book: any) => ({
      id: book.id,
      kitab_name: book.kitab_name || '',
      details: book.details || '',
      order_index: book.order_index ?? 0
    }))
  }

  const [formData, setFormData] = useState<FiqhEntry>({
    title: entry?.title || '',
    question_text: entry?.question_text || '',
    answer_summary: entry?.answer_summary || '',
    ibarat_text: entry?.ibarat_text || '',
    source_books: normalizeSourceBooks(entry?.source_books),
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

  const handleSourceBookChange = (index: number, field: keyof SourceBook, value: string) => {
    setFormData(prev => {
      const newSourceBooks = [...(prev.source_books || [])]
      newSourceBooks[index] = {
        ...newSourceBooks[index],
        [field]: field === 'order_index' ? parseInt(value) : value
      }
      return {
        ...prev,
        source_books: newSourceBooks
      }
    })
  }

  const addSourceBook = () => {
    setFormData(prev => ({
      ...prev,
      source_books: [
        ...(prev.source_books || []),
        { 
          kitab_name: '', 
          details: '', 
          order_index: (prev.source_books?.length || 0) 
        }
      ]
    }))
  }

  const removeSourceBook = (index: number) => {
    setFormData(prev => ({
      ...prev,
      source_books: (prev.source_books || []).filter((_, i) => i !== index)
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sumber Kitab (Opsional)</Label>
                  <p className="text-sm text-muted-foreground mt-1">Tambahkan satu atau lebih sumber kitab beserta detailnya</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSourceBook}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kitab
                </Button>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                {(formData.source_books && formData.source_books.length > 0) ? (
                  formData.source_books.map((book, index) => (
                    <div key={index} className="space-y-3 p-4 bg-white border rounded-lg relative">
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSourceBook(index)}
                          disabled={isLoading}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`kitab_name_${index}`} className="text-sm">
                          Nama Kitab {index + 1}
                        </Label>
                        <Input
                          id={`kitab_name_${index}`}
                          value={book.kitab_name}
                          onChange={(e) => handleSourceBookChange(index, 'kitab_name', e.target.value)}
                          placeholder="contoh: Fathul Mu'in atau I'anatut Thalibin"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`details_${index}`} className="text-sm">
                          Detail Sumber
                        </Label>
                        <Input
                          id={`details_${index}`}
                          value={book.details || ''}
                          onChange={(e) => handleSourceBookChange(index, 'details', e.target.value)}
                          placeholder="contoh: Bab Buyu', Hal. 50"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground bg-white border border-dashed rounded-lg">
                    Belum ada sumber kitab. Klik "Tambah Kitab" untuk menambahkan.
                  </div>
                )}
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