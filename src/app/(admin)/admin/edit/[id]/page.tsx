import { notFound } from 'next/navigation'
import AdminForm from '@/components/AdminForm'
import { supabaseAdmin } from '@/lib/supabaseClient'

interface EditEntryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { id } = await params
  const { data: entry, error } = await supabaseAdmin
    .from('fiqh_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !entry) {
    notFound()
  }

  return <AdminForm entry={entry} isEdit={true} />
}