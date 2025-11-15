import { notFound } from 'next/navigation'
import AdminForm from '@/components/AdminForm'
import { supabaseAdmin } from '@/lib/supabaseClient'

interface EditEntryPageProps {
  params: { id: string }
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  const { data: entry, error } = await supabaseAdmin
    .from('fiqh_entries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !entry) {
    notFound()
  }

  return <AdminForm entry={entry} isEdit={true} />
}