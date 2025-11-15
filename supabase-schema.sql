-- =====================================================
-- Khazanah Fikih Database Schema for Supabase
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. Tabel Utama: fiqh_entries
-- =====================================================

CREATE TABLE IF NOT EXISTS public.fiqh_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Data Inti
    title TEXT NOT NULL, -- Judul/Topik Masalah (misal: "Hukum Asuransi Jiwa")
    question_text TEXT, -- Teks pertanyaan masalah (deskripsi singkat)
    answer_summary TEXT NOT NULL, -- Teks jawaban/rumusan (dalam Bahasa Indonesia)
    ibarat_text TEXT NOT NULL, -- Teks ibarat (utama, dalam Bahasa Arab, termasuk harakat)

    -- Metadata Sumber
    source_kitab TEXT, -- Nama kitab (misal: "Fathul Mu'in" atau "I'anatut Thalibin")
    source_details TEXT, -- Detail sumber (misal: "Bab Buyu', Hal. 50")
    musyawarah_source TEXT, -- Sumber musyawarah (misal: "LBMNU Jatim, 2023" atau "Muktamar NU ke-31")

    -- Kategori & Tipe
    entry_type TEXT NOT NULL DEFAULT 'ibarat' CHECK (entry_type IN ('rumusan', 'ibarat')),

    -- Relasi (jika ada admin)
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- 2. Trigger untuk updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_fiqh_entries_updated_at
    BEFORE UPDATE ON public.fiqh_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 3. Full-Text Search Setup
-- =====================================================

-- Hapus kolom fts_vector jika sudah ada untuk recreate
ALTER TABLE public.fiqh_entries DROP COLUMN IF EXISTS fts_vector;

-- Tambah kolom fts_vector sebagai generated column
ALTER TABLE public.fiqh_entries
ADD COLUMN fts_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(question_text, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(answer_summary, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(ibarat_text, '')), 'D') ||
    setweight(to_tsvector('simple', COALESCE(musyawarah_source, '')), 'B')
) STORED;

-- =====================================================
-- 4. Indexes untuk Performa
-- =====================================================

-- GIN Index untuk Full-Text Search
CREATE INDEX IF NOT EXISTS idx_fiqh_entries_fts_vector 
ON public.fiqh_entries USING GIN(fts_vector);

-- Index untuk created_at
CREATE INDEX IF NOT EXISTS idx_fiqh_entries_created_at 
ON public.fiqh_entries(created_at DESC);

-- Index untuk entry_type
CREATE INDEX IF NOT EXISTS idx_fiqh_entries_entry_type 
ON public.fiqh_entries(entry_type);

-- Trigram index untuk partial matching
CREATE INDEX IF NOT EXISTS idx_fiqh_entries_title_trgm 
ON public.fiqh_entries USING GIN(title gin_trgm_ops);

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.fiqh_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Publik bisa MEMBACA semua entri
CREATE POLICY "Allow public read access" 
ON public.fiqh_entries
FOR SELECT USING (true);

-- Policy: Pengguna terotentikasi bisa INSERT
CREATE POLICY "Allow authenticated users to insert" 
ON public.fiqh_entries
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Pengguna terotentikasi bisa UPDATE data mereka sendiri
CREATE POLICY "Allow authenticated users to update own data" 
ON public.fiqh_entries
FOR UPDATE USING (auth.uid() = author_id);

-- Policy: Pengguna terotentikasi bisa DELETE data mereka sendiri
CREATE POLICY "Allow authenticated users to delete own data" 
ON public.fiqh_entries
FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- 6. Fungsi Pencarian (RPC Function)
-- =====================================================

-- Drop function jika sudah ada
DROP FUNCTION IF EXISTS public.search_fiqh(TEXT);

CREATE OR REPLACE FUNCTION public.search_fiqh(
    search_query TEXT DEFAULT '',
    entry_type_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    title TEXT,
    question_text TEXT,
    answer_summary TEXT,
    ibarat_text TEXT,
    source_kitab TEXT,
    source_details TEXT,
    musyawarah_source TEXT,
    entry_type TEXT,
    author_id UUID,
    rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.created_at,
        e.updated_at,
        e.title,
        e.question_text,
        e.answer_summary,
        e.ibarat_text,
        e.source_kitab,
        e.source_details,
        e.musyawarah_source,
        e.entry_type,
        e.author_id,
        CASE 
            WHEN search_query = '' THEN 0
            ELSE ts_rank(e.fts_vector, websearch_to_tsquery('simple', search_query))
        END as rank
    FROM public.fiqh_entries e
    WHERE 
        -- Jika query kosong, kembalikan semua
        (search_query = '' OR e.fts_vector @@ websearch_to_tsquery('simple', search_query))
        -- Filter berdasarkan tipe jika specified
        AND (entry_type_filter IS NULL OR e.entry_type = entry_type_filter)
    ORDER BY 
        CASE 
            WHEN search_query = '' THEN e.created_at DESC
            ELSE rank DESC, e.created_at DESC
        END
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- =====================================================
-- 7. Fungsi Helper untuk Admin
-- =====================================================

-- Function untuk mendapatkan total count untuk pagination
CREATE OR REPLACE FUNCTION public.search_fiqh_count(
    search_query TEXT DEFAULT '',
    entry_type_filter TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM public.fiqh_entries e
    WHERE 
        (search_query = '' OR e.fts_vector @@ websearch_to_tsquery('simple', search_query))
        AND (entry_type_filter IS NULL OR e.entry_type = entry_type_filter);
    
    RETURN result_count;
END;
$$;

-- =====================================================
-- 8. Tabel Kategori/Tag (Optional)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    color TEXT DEFAULT '#3b82f6' -- Default blue color
);

CREATE TABLE IF NOT EXISTS public.entry_tags (
    entry_id UUID NOT NULL REFERENCES public.fiqh_entries(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (entry_id, tag_id)
);

-- RLS untuk Tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_tags ENABLE ROW LEVEL SECURITY;

-- Policies untuk tags
CREATE POLICY IF NOT EXISTS "Allow public read access for tags" 
ON public.tags FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access for entry_tags" 
ON public.entry_tags FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated access for tags" 
ON public.tags FOR ALL USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated access for entry_tags" 
ON public.entry_tags FOR ALL USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 9. Sample Data (Hanya untuk development)
-- =====================================================

-- Hapus data yang sudah ada untuk avoid duplicates
DELETE FROM public.fiqh_entries WHERE title IN ('Hukum Asuransi Jiwa', 'Hukum Qunut dalam Shalat Subuh');

-- Insert sample data
INSERT INTO public.fiqh_entries (
    title, 
    question_text, 
    answer_summary, 
    ibarat_text, 
    source_kitab, 
    source_details, 
    musyawarah_source, 
    entry_type
) VALUES
(
    'Hukum Asuransi Jiwa',
    'Bagaimana hukum asuransi jiwa dalam pandangan fikih?',
    'Asuransi jiwa pada dasarnya diperbolehkan selama tidak mengandung unsur riba, gharar, dan maysir. Polis asuransi harus transparan dan tidak merugikan salah satu pihak. Namun perlu diperhatikan akad yang digunakan harus sesuai syariah.',
    'اَلْتَأْمِيْنُ عَلَى الْحَيَاةِ جَائِزٌ شَرْعًا إِذَا لَمْ يَشْتَمِلْ عَلَى الرِّبَا وَالْغَرَرِ وَالْمَيْسِرِ',
    'Fathul Mu''in',
    'Bab Takaful, Hal. 245',
    'MUI, 2022',
    'ibarat'
),
(
    'Hukum Qunut dalam Shalat Subuh',
    'Apakah qunut dalam shalat subuh hukumnya wajib atau sunnah?',
    'Qunut dalam shalat subuh adalah sunnah muakkadah (sunnah yang ditekankan), bukan wajib. Ditinggalkan tidak mengapa, dan dianjurkan untuk dilakukan. Mayoritas ulama menganut pendapat ini.',
    'اَلْقُنُوْتُ فِي صَلَاةِ الصُّبْحِ سُنَّةٌ مُؤَكَّدَةٌ لَيْسَتْ بِوَاجِبَةٍ',
    'I''anatut Thalibin',
    'Juz 1, Hal. 156',
    'LBMNU Jatim, 2023',
    'rumusan'
),
(
    'Hukum Makan Daging Babi',
    'Apakah benar daging babi haram dikonsumsi?',
    'Daging babi haram hukumnya untuk dimakan berdasarkan dalil Al-Qur''an dan hadis yang jelas. Larangan ini bersifat qat''i (pasti) dan menjadi ijma'' ulama.',
    'حُرِّمَتْ عَلَيْكُمُ الْمَيْتَةُ وَالدَّمُ وَلَحْمُ الْخِنْزِيرِ',
    'Al-Qur''an Surah Al-Ma''idah: 3',
    'Tafsir Ibn Kathir, Juz 2',
    'Al-Qur''an dan Hadis',
    'rumusan'
);

-- Insert sample tags
INSERT INTO public.tags (name, color) VALUES 
('Ibadah', '#10b981'),
('Muamalah', '#f59e0b'),
('Keluarga', '#8b5cf6'),
('Ekonomi', '#3b82f6'),
('Kesehatan', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- Associate tags with entries
INSERT INTO public.entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM public.fiqh_entries e, public.tags t
WHERE (
    (e.title = 'Hukum Qunut dalam Shalat Subuh' AND t.name = 'Ibadah') OR
    (e.title = 'Hukum Asuransi Jiwa' AND t.name IN ('Ekonomi', 'Muamalah')) OR
    (e.title = 'Hukum Makan Daging Babi' AND t.name IN ('Ibadah', 'Kesehatan'))
)
ON CONFLICT (entry_id, tag_id) DO NOTHING;

-- =====================================================
-- 10. Grant Permissions
-- =====================================================

-- Grant usage ke anon users untuk RPC functions
GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION public.search_fiqh TO anon;
GRANT EXECUTE ON FUNCTION public.search_fiqh_count TO anon;

-- Grant usage ke authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_fiqh TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_fiqh_count TO authenticated;

-- =====================================================
-- COMPLETED SUCCESSFULLY
-- =====================================================