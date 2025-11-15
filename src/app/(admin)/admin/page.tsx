'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface FiqhEntry {
  id: string
  title: string
  entry_type: 'rumusan' | 'ibarat'
  created_at: string
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<FiqhEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/admin/entries')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus entri ini?')) {
      return
    }

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/admin/entries/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== id))
      } else {
        alert('Gagal menghapus entri')
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Terjadi kesalahan saat menghapus entri')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Kelola rumusan dan ibarat fikih
          </p>
        </div>
        <Link href="/admin/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Entri Baru
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Entri</CardTitle>
          <CardDescription>
            Total {entries.length} entri tersimpan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Belum ada entri tersimpan
              </p>
              <Link href="/admin/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Entri Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate">{entry.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.entry_type === 'ibarat' ? 'default' : 'secondary'}>
                        {entry.entry_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(entry.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/edit/${entry.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          disabled={isDeleting === entry.id}
                        >
                          {isDeleting === entry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}