# 🔐 Authentication Setup Guide untuk Khazanah Fikih

## 📋 Overview

Khazanah Fikih menggunakan **NextAuth.js** + **Supabase Auth** untuk sistem autentikasi yang aman dan scalable. Guide ini akan membantu Anda setup authentication dengan benar.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   NextAuth.js    │    │   Supabase      │
│   (Next.js)     │◄──►│   (API Routes)   │◄──►│   Auth          │
│                 │    │                  │    │                 │
│ • Login Form    │    │ • Session Mgmt    │    │ • User Storage  │
│ • Session Check │    │ • JWT Tokens      │    │ • Email Auth    │
│ • Protected UI  │    │ • Callbacks       │    │ • RLS Policies  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Langkah 1: Setup Supabase Authentication

### 1.1 Buka Authentication Settings

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project `khazanah-fikih`
3. Klik **Authentication** di sidebar
4. Pilih tab **Settings**

### 1.2 Configure Site URL

```bash
# Development
Site URL: http://localhost:3000

# Production (nanti)
Site URL: https://your-domain.com
```

### 1.3 Configure Redirect URLs

```bash
# Development
Redirect URLs: http://localhost:3000/api/auth/callback/credentials

# Production (nanti)
Redirect URLs: https://your-domain.com/api/auth/callback/credentials
```

### 1.4 Enable Email Provider

1. Klik tab **Providers**
2. Cari **Email** provider
3. Klik toggle untuk **Enable**
4. Untuk development, tidak perlu SMTP configuration
5. Untuk production, setup SMTP (lihat section Production Setup)

## 👥 Langkah 2: Create Admin Users

### 2.1 Create Admin via Dashboard

1. Di Authentication, klik tab **Users**
2. Klik **Add user**
3. Isi form:
   ```
   Email: admin@khazanah-fikih.com
   Password: [buat password kuat]
   Auto-confirm user: ✅ CHECK
   ```
4. Klik **Save**

### 2.2 Create Additional Admins (Optional)

```sql
-- Atau langsung via SQL Editor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role
) VALUES (
  'admin2@khazanah-fikih.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated'
);
```

### 2.3 Verify User Creation

1. Kembali ke tab **Users**
2. Pastikan user muncul dengan status **Confirmed**
3. Note user ID untuk reference

## 🔑 Langkah 3: Configure NextAuth.js

### 3.1 Environment Variables

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: untuk production
NEXTAUTH_SECRET_URL_BASE=http://localhost:3000
```

### 3.2 Generate NEXTAUTH_SECRET

```bash
# Method 1: OpenSSL (Recommended)
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online
# Visit: https://generate-secret.vercel.app/32
```

### 3.3 NextAuth Configuration

File: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/supabaseClient'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !user) {
            console.error('Auth error:', error)
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
```

## 🛡️ Langkah 4: Row Level Security (RLS)

### 4.1 RLS Policies untuk fiqh_entries

```sql
-- Policy: Publik bisa membaca
CREATE POLICY "Allow public read access" 
ON public.fiqh_entries
FOR SELECT USING (true);

-- Policy: Authenticated users bisa insert
CREATE POLICY "Allow authenticated users to insert" 
ON public.fiqh_entries
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users bisa update data mereka sendiri
CREATE POLICY "Allow authenticated users to update own data" 
ON public.fiqh_entries
FOR UPDATE USING (auth.uid() = author_id);

-- Policy: Users bisa delete data mereka sendiri
CREATE POLICY "Allow authenticated users to delete own data" 
ON public.fiqh_entries
FOR DELETE USING (auth.uid() = author_id);
```

### 4.2 Grant Permissions

```sql
-- Grant ke anon users (untuk read operations)
GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION public.search_fiqh TO anon;

-- Grant ke authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_fiqh TO authenticated;
```

## 🔒 Langkah 5: Frontend Implementation

### 5.1 Provider Setup

File: `src/components/Providers.tsx`

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### 5.2 Protected Routes

File: `src/app/(admin)/admin/layout.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return <div>{children}</div>
}
```

### 5.3 Login Component

File: `src/app/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email atau password salah')
      } else {
        router.push('/admin')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

## 🧪 Langkah 6: Testing Authentication

### 6.1 Test Login Flow

1. **Buka Browser**: `http://localhost:3000/login`
2. **Masukkan Credentials**:
   - Email: `admin@khazanah-fikih.com`
   - Password: password yang Anda buat
3. **Verify Redirect**: Harus redirect ke `/admin`
4. **Verify Session**: Check browser dev tools Application > Cookies

### 6.2 Test Protected Routes

1. **Direct Access**: Coba akses `http://localhost:3000/admin`
2. **Expected**: Redirect ke `/login`
3. **After Login**: Bisa akses admin panel

### 6.3 Test Logout

1. **Add Logout Button** (di admin layout):
```html
<form action="/api/auth/signout" method="POST">
  <button type="submit">Logout</button>
</form>
```

2. **Verify**: Setelah logout, redirect ke login page

## 🚀 Langkah 7: Production Setup

### 7.1 Environment Variables Production

```env
# Production URLs
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET_URL_BASE=https://your-domain.com

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
SUPABASE_SERVICE_ROLE_KEY=production-service-role-key
```

### 7.2 Supabase Auth Production

1. **Update Site URL**:
   ```
   Site URL: https://your-domain.com
   ```

2. **Update Redirect URLs**:
   ```
   Redirect URLs: https://your-domain.com/api/auth/callback/credentials
   ```

3. **Setup SMTP** (Recommended):
   ```bash
   # Di Supabase Auth > Providers > Email
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: your-app-password
   ```

### 7.3 Domain Configuration

1. **Custom Domain**: Setup custom domain di Supabase
2. **CORS**: Tambahkan domain ke allowed origins
3. **SSL**: Pastikan HTTPS enabled

## 🔧 Langkah 8: Advanced Features

### 8.1 Custom Session Management

```typescript
// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
  }
}
```

### 8.2 Role-Based Access Control

```typescript
// Di NextAuth callbacks
callbacks: {
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id as string
      session.user.role = token.role as string
    }
    return session
  },
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
      token.role = user.role
    }
    return token
  },
}
```

### 8.3 API Route Protection

```typescript
// Di API routes
import { getServerSession } from 'next-auth'

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Proceed with authenticated request
}
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. "Invalid nextauth secret"
**Cause**: NEXTAUTH_SECRET tidak ada atau invalid
**Solution**:
```bash
# Generate new secret
openssl rand -base64 32
# Update .env.local
```

#### 2. "Callback URL mismatch"
**Cause**: Redirect URLs tidak sesuai
**Solution**:
- Check NEXTAUTH_URL
- Check Supabase redirect URLs
- Restart development server

#### 3. "User not found"
**Cause**: User belum ter-create atau email salah
**Solution**:
- Verify user di Supabase Users table
- Check email typo
- Ensure user confirmed

#### 4. "RLS policy violation"
**Cause**: RLS policies terlalu strict
**Solution**:
- Check RLS policies di Supabase
- Grant proper permissions
- Test dengan anon user

#### 5. "Session expires immediately"
**Cause**: JWT configuration salah
**Solution**:
- Check NEXTAUTH_SECRET consistency
- Verify session strategy
- Check cookie settings

### Debug Mode

Enable debug mode:

```env
NEXTAUTH_DEBUG=true
NEXTAUTH_URL_INTERNAL=http://localhost:3000
```

Atau di code:

```typescript
const handler = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  // ... other config
})
```

## 📊 Security Best Practices

### 1. Environment Security
```bash
# Never commit .env.local
echo ".env.local" >> .gitignore

# Use different secrets for dev/prod
# Rotate secrets regularly
```

### 2. Session Security
```typescript
// Configure secure sessions
session: {
  strategy: 'jwt',
  maxAge: 24 * 60 * 60, // 24 hours
  updateAge: 60 * 60,  // 1 hour
},
```

### 3. Password Security
```bash
# Use strong passwords
# Minimum 12 characters
# Include numbers, symbols, mixed case
```

### 4. HTTPS Only (Production)
```typescript
// Force HTTPS in production
useSecureCookies: process.env.NODE_ENV === 'production'
```

## ✅ Verification Checklist

- [ ] Supabase Auth configured
- [ ] Admin users created
- [ ] Environment variables set
- [ ] NextAuth configured
- [ ] RLS policies applied
- [ ] Login flow working
- [ ] Protected routes working
- [ ] Logout working
- [ ] Session persistence working
- [ ] Error handling working
- [ ] Production configuration ready

## 🎉 Done!

Authentication system Khazanah Fikih sudah siap digunakan! Anda sekarang memiliki:

- ✅ Secure login/logout system
- ✅ Protected admin routes
- ✅ Row-level security
- ✅ Session management
- ✅ Production-ready configuration

Untuk troubleshooting lanjutan, cek [NextAuth.js Documentation](https://next-auth.js.org/) dan [Supabase Auth Guide](https://supabase.com/docs/guides/auth).