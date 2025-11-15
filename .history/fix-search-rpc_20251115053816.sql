-- Fix untuk RPC Function search_fiqh dengan tipe data yang benar

DROP FUNCTION IF EXISTS public.search_fiqh(TEXT, TEXT, INTEGER, INTEGER);

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
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.created_at,
        COALESCE(e.updated_at::TIMESTAMPTZ, e.created_at)::TIMESTAMPTZ as updated_at,
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
            WHEN search_query = '' THEN 0::REAL
            ELSE ts_rank(e.fts_vector, websearch_to_tsquery('simple', search_query))::REAL
        END as rank
    FROM public.fiqh_entries e
    WHERE 
        (search_query = '' OR e.fts_vector @@ websearch_to_tsquery('simple', search_query))
        AND (entry_type_filter IS NULL OR e.entry_type = entry_type_filter)
    ORDER BY 
        CASE 
            WHEN search_query = '' THEN 0::REAL
            ELSE ts_rank(e.fts_vector, websearch_to_tsquery('simple', search_query))::REAL
        END DESC,
        e.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_fiqh(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;
