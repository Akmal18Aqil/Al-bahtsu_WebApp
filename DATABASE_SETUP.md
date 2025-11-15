# 🗄️ Database Setup Guide untuk Khazanah Fikih

## 📋 Prerequisites

- Akun Supabase (gratis atau pro)
- Browser dengan akses ke [supabase.com](https://supabase.com)

## 🚀 Langkah 1: Buat Project Supabase

1. **Login ke Supabase Dashboard**
   - Kunjungi [supabase.com](https://supabase.com)
   - Login dengan GitHub atau Email

2. **Buat Project Baru**
   - Klik "New Project"
   - Pilih organization
   - Set project name: `khazanah-fikih`
   - Set database password (simpan baik-baik)
   - Pilih region terdekat
   - Klik "Create new project"

3. **Tunggu Setup Selesai**
   - Proses setup memakan waktu 1-2 menit
   - Anda akan mendapatkan project URL dan API keys

## 📝 Langkah 2: Jalankan SQL Schema

1. **Buka SQL Editor**
   - Di dashboard, klik "SQL Editor" di sidebar
   - Klik "New query"

2. **Copy & Paste Schema**
   - Buka file `supabase-schema.sql` dari project
   - Copy seluruh konten SQL
   - Paste ke SQL Editor Supabase

3. **Jalankan Schema**
   - Klik "Run" atau tekan `Ctrl+Enter`
   - Tunggu hingga semua query selesai
   - Seharusnya muncul "Success" dengan no errors

## 🔧 Langkah 3: Konfigurasi Authentication

1. **Buka Authentication Settings**
   - Klik "Authentication" di sidebar
   - Pilih "Settings" tab

2. **Setup Site URL**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback/credentials`

3. **Enable Email Provider**
   - Di "Providers" tab
   - Pastikan "Email" provider enabled
   - Tidak perlu konfigurasi SMTP untuk development

4. **Buat Admin User**
   - Klik "Users" tab
   - Klik "Add user"
   - Email: `admin@khazanah-fikih.com` (atau email yang diinginkan)
   - Password: buat password yang kuat
   - Auto-confirm user: **CHECK** ini agar tidak perlu verifikasi email

## 🔑 Langkah 4: Get API Keys

1. **Buka Project Settings**
   - Klik gear icon ⚙️ di sidebar
   - Pilih "API"

2. **Copy API Keys**
   - **Project URL**: Copy untuk `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/public key**: Copy untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key**: Copy untuk `SUPABASE_SERVICE_ROLE_KEY`

## 📁 Langkah 5: Setup Environment Variables

1. **Buat file `.env.local`**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`**
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # NextAuth Configuration
   NEXTAUTH_SECRET=generate-random-secret-here
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Generate NEXTAUTH_SECRET**
   ```bash
   # Di terminal
   openssl rand -base64 32
   # Atau kunjungi https://generate-secret.vercel.app/32
   ```

## 🧪 Langkah 6: Test Database Connection

1. **Test di Browser**
   - Buka `http://localhost:3000`
   - Harus muncul halaman Khazanah Fikih
   - Coba search "asuransi" atau "qunut"

2. **Test Login Admin**
   - Buka `http://localhost:3000/login`
   - Login dengan email dan password admin yang dibuat
   - Harus bisa akses dashboard

## 🔍 Langkah 7: Verifikasi Database

1. **Check Tables**
   - Di Supabase, buka "Table Editor"
   - Harus ada tabel: `fiqh_entries`, `tags`, `entry_tags`

2. **Check Sample Data**
   - Klik tabel `fiqh_entries`
   - Harus ada 3 sample entries

3. **Test FTS Function**
   - Buka SQL Editor
   - Jalankan query ini:
   ```sql
   SELECT * FROM public.search_fiqh('asuransi');
   ```
   - Harus return 1 result

## 🚨 Troubleshooting

### Error: "relation does not exist"
**Cause**: Schema belum dijalankan dengan benar
**Solution**: 
- Drop semua tables dan jalankan schema ulang
- Pastikan tidak ada error saat menjalankan SQL

### Error: "Permission denied"
**Cause**: RLS policies belum benar
**Solution**:
- Check RLS policies di Authentication > Policies
- Pastikan "Allow public read access" sudah ada

### Error: "Function does not exist"
**Cause**: FTS function belum terbuat
**Solution**:
- Jalankan ulang bagian Function Creation di schema
- Refresh browser

### Search tidak working
**Cause**: FTS vector belum ter-index
**Solution**:
- Check index di Table Editor > Indexes
- Pastikan `idx_fiqh_entries_fts_vector` ada

### Login tidak working
**Cause**: Auth configuration salah
**Solution**:
- Check site URL dan redirect URLs
- Pastikan email provider enabled
- Verify user sudah ter-confirm

## 📊 Schema Overview

### Tabel Utama: `fiqh_entries`
- **id**: UUID primary key
- **title**: Judul/topik masalah
- **question_text**: Pertanyaan (optional)
- **answer_summary**: Jawaban dalam Bahasa Indonesia
- **ibarat_text**: Ibarat dalam Bahasa Arab
- **source_kitab**: Nama kitab (optional)
- **source_details**: Detail sumber (optional)
- **musyawarah_source**: Sumber musyawarah (optional)
- **entry_type**: 'rumusan' atau 'ibarat'
- **created_at**: Timestamp pembuatan
- **updated_at**: Timestamp update
- **author_id**: Foreign key ke auth.users

### FTS Features
- **fts_vector**: Generated column untuk search
- **GIN Index**: Index untuk performa optimal
- **search_fiqh()**: RPC function dengan pagination
- **search_fiqh_count()**: Function untuk total count

### Security
- **RLS Enabled**: Row Level Security aktif
- **Public Read**: Semua orang bisa baca
- **Authenticated CRUD**: User login bisa CRUD
- **Ownership**: User hanya bisa edit data sendiri

## 🔄 Production Deployment

Untuk production:

1. **Update Environment Variables**
   ```env
   NEXTAUTH_URL=https://your-domain.com
   ```

2. **Update Supabase Auth**
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/api/auth/callback/credentials`

3. **Setup SMTP** (recommended)
   - Di Auth > Providers > Email
   - Konfigurasi SMTP provider

4. **Enable Row Level Security**
   - Pastikan policies sudah benar
   - Test dengan anon user

## ✅ Verification Checklist

- [ ] Project Supabase created
- [ ] SQL schema executed successfully
- [ ] Authentication configured
- [ ] Admin user created
- [ ] Environment variables set
- [ ] Frontend bisa akses database
- [ ] Search functionality working
- [ ] Admin login working
- [ ] CRUD operations working
- [ ] RLS policies working

## 🎉 Done!

Database Khazanah Fikih sudah siap digunakan! Anda sekarang bisa:
- Search fikih entries dengan performa optimal
- Manage data melalui admin panel
- Scale dengan aman menggunakan RLS
- Deploy ke production dengan confidence