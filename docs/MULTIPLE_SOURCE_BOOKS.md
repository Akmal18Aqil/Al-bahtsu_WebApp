# Fitur Multiple Source Books (Sumber Kitab Ganda)

## Deskripsi Fitur

Fitur ini memungkinkan pengguna untuk menginput **lebih dari 1 sumber kitab** beserta detailnya untuk setiap entri fikih. Sebelumnya hanya bisa 1 kitab saja, kini bisa unlimited!

## Perubahan Database

### Tabel Baru: `source_books`

Tabel baru dibuat untuk mengelola multiple source books dengan struktur fleksibel:

```sql
CREATE TABLE public.source_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES public.fiqh_entries(id) ON DELETE CASCADE,
    kitab_name TEXT NOT NULL,      -- Nama kitab
    details TEXT,                  -- Detail sumber (bab, halaman, dll)
    order_index INTEGER DEFAULT 0, -- Urutan/prioritas sumber
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### Perubahan Tabel: `fiqh_entries`

Kolom `source_kitab` dan `source_details` dihapus dari tabel utama karena sekarang digunakan tabel terpisah `source_books`.

## UI/UX Changes

### Admin Form - Bagian Source Books

**Sebelum:**
```
┌─ Sumber Kitab (2 input fields) ─┐
│ Nama Kitab: [text input]        │
│ Detail: [text input]            │
└─────────────────────────────────┘
```

**Sesudah:**
```
┌─ Sumber Kitab (Dynamic List) ────────────────┐
│ Tambah Kitab [button]                        │
├──────────────────────────────────────────────┤
│ Sumber 1:                          [Delete]  │
│  Nama: [Fathul Mu'in_________]              │
│  Detail: [Bab Buyu', Hal. 50__]             │
├──────────────────────────────────────────────┤
│ Sumber 2:                          [Delete]  │
│  Nama: [I'anatut Thalibin____]              │
│  Detail: [Juz 1, Hal. 156____]              │
├──────────────────────────────────────────────┤
│ Sumber 3:                          [Delete]  │
│  Nama: [_________________]                   │
│  Detail: [_________________]                 │
└──────────────────────────────────────────────┘
```

**Fitur:**
- ✅ Tombol "Tambah Kitab" untuk menambah sumber baru
- ✅ Tombol "Hapus" (trash icon) di setiap sumber
- ✅ Urutan otomatis berdasarkan posisi
- ✅ Validasi: tidak boleh kosong

## Perubahan API

### POST /api/admin/entries (Create)

**Request Body:**
```json
{
  "title": "Hukum Asuransi Jiwa",
  "answer_summary": "...",
  "ibarat_text": "...",
  "source_books": [
    {
      "kitab_name": "Fathul Mu'in",
      "details": "Bab Takaful, Hal. 245"
    },
    {
      "kitab_name": "I'anatut Thalibin",
      "details": "Juz 1, Hal. 156"
    }
  ],
  "musyawarah_source": "MUI, 2022",
  "entry_type": "ibarat"
}
```

**Proses:**
1. Insert entry ke `fiqh_entries`
2. Untuk setiap source book di array, insert ke tabel `source_books`
3. Return entry data

### PUT /api/admin/entries/{id} (Update)

**Proses:**
1. Update entry di `fiqh_entries`
2. Delete semua existing source books
3. Insert new source books
4. Return updated entry

### GET /api/admin/entries/{id} (Get Detail)

**Response:**
```json
{
  "id": "uuid",
  "title": "Hukum Asuransi Jiwa",
  "answer_summary": "...",
  "ibarat_text": "...",
  "source_books": [
    {
      "id": "uuid",
      "kitab_name": "Fathul Mu'in",
      "details": "Bab Takaful, Hal. 245",
      "order_index": 0
    },
    {
      "id": "uuid",
      "kitab_name": "I'anatut Thalibin",
      "details": "Juz 1, Hal. 156",
      "order_index": 1
    }
  ],
  "musyawarah_source": "MUI, 2022",
  "entry_type": "ibarat"
}
```

## Search Function Update

RPC function `search_fiqh()` diupdate untuk return source books sebagai JSON array:

```sql
source_books: [
  {
    "id": "...",
    "kitab_name": "...",
    "details": "...",
    "order_index": 0
  }
]
```

## Cara Install/Update Database

### Option 1: Gunakan Migration File
```bash
# Buka Supabase Dashboard
# SQL Editor > New query
# Copy paste isi file: migrations/001_add_source_books_table.sql
# Klik Run
```

### Option 2: Update Schema Lengkap
```bash
# Buka Supabase Dashboard
# SQL Editor > New query
# Copy paste isi file: supabase-schema.sql (yang sudah diupdate)
# Klik Run (pastikan hapus data lama dulu jika ada)
```

## Backward Compatibility

Entri lama yang menggunakan `source_kitab` dan `source_details` masih bisa dibaca, tapi saat edit perlu dikonversi ke format baru.

### Script Migrasi Data (Optional)

Jika ingin migrate data lama ke tabel baru:

```sql
-- Masukkan data lama ke tabel source_books
INSERT INTO public.source_books (entry_id, kitab_name, details, order_index)
SELECT id, source_kitab, source_details, 0
FROM public.fiqh_entries
WHERE source_kitab IS NOT NULL
ON CONFLICT DO NOTHING;
```

## Testing

### Test Case 1: Create Entry dengan Multiple Sources
1. Buka Admin > Tambah Entri Baru
2. Isi semua field
3. Klik "Tambah Kitab" 2x
4. Isi 2 sumber kitab berbeda
5. Klik Simpan
6. ✅ Verifikasi: Kedua sumber muncul di database

### Test Case 2: Edit Entry dengan Multiple Sources
1. Buka Edit entry existing
2. Tambah/hapus/edit source books
3. Klik Perbarui
4. ✅ Verifikasi: Changes terupdate dengan benar

### Test Case 3: Search menampilkan Multiple Sources
1. Lakukan search
2. Lihat hasil search
3. ✅ Verifikasi: Source books muncul dengan benar

## Fitur Tambahan (Future)

- [ ] Drag & drop untuk reorder sumber
- [ ] Validation untuk URL kitab
- [ ] Link ke sumber kitab online
- [ ] Tagging untuk jenis sumber (kitab, artikel, video, dll)
- [ ] Quick add dari dropdown template kitab populer

## Troubleshooting

### Problem: Source books tidak tersimpan
**Solution:** Pastikan tabel `source_books` sudah dibuat dan migration sudah dijalankan

### Problem: Saat edit, source books hilang
**Solution:** Pastikan GET endpoint mengembalikan source_books data

### Problem: Tidak bisa tambah/hapus source
**Solution:** Periksa RLS policies, pastikan user terotentikasi

---

*Last Updated: December 8, 2025*
