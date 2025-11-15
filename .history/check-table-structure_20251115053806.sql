-- Diagnostic query untuk mengecek struktur tabel fiqh_entries
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'fiqh_entries'
ORDER BY 
    ordinal_position;
