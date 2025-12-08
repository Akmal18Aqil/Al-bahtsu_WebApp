-- Migration: Add source_books table for multiple source references
-- This migration adds support for multiple source books per fiqh entry

-- =====================================================
-- 1. Create source_books table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.source_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES public.fiqh_entries(id) ON DELETE CASCADE,
    kitab_name TEXT NOT NULL, -- Nama kitab (misal: "Fathul Mu'in")
    details TEXT, -- Detail sumber (misal: "Bab Buyu', Hal. 50")
    order_index INTEGER DEFAULT 0, -- Urutan sumber
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_source_books_entry_id ON public.source_books(entry_id);
CREATE INDEX IF NOT EXISTS idx_source_books_order ON public.source_books(entry_id, order_index);

-- =====================================================
-- 3. Enable RLS (Row Level Security)
-- =====================================================

ALTER TABLE public.source_books ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Create RLS Policies
-- =====================================================

-- Policy: Publik bisa MEMBACA sumber kitab
CREATE POLICY "Allow public read access for source_books" 
ON public.source_books FOR SELECT USING (true);

-- Policy: Authenticated users bisa modify sumber kitab jika mereka adalah author entri
CREATE POLICY "Allow authenticated users to modify source_books" 
ON public.source_books FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.fiqh_entries
    WHERE fiqh_entries.id = source_books.entry_id
    AND fiqh_entries.author_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fiqh_entries
    WHERE fiqh_entries.id = source_books.entry_id
    AND fiqh_entries.author_id = auth.uid()
  )
);

-- =====================================================
-- 5. Grant permissions
-- =====================================================

GRANT SELECT ON public.source_books TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.source_books TO authenticated;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
