import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Checking Supabase Connection...\n')

// Check 1: Environment Variables
console.log('📋 Step 1: Checking Environment Variables')
console.log(`✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
console.log(`✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`)
console.log(`✓ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}\n`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables!')
  process.exit(1)
}

// Check 2: Create Supabase Client
console.log('📋 Step 2: Creating Supabase Client')
try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase client created successfully\n')

  // Check 3: Test Connection with RPC
  console.log('📋 Step 3: Testing Database Connection (via RPC)')
  
  supabase.rpc('search_fiqh', { search_query: '' })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ RPC Error:', error.message)
        console.error('Details:', error)
        return
      }
      console.log(`✅ RPC Connection SUCCESS!`)
      console.log(`✓ Found ${data?.length || 0} entries in database\n`)
      
      // Check 4: Test Table Access
      console.log('📋 Step 4: Testing Direct Table Access')
      return supabase.from('fiqh_entries').select('id').limit(1)
    })
    .then((result) => {
      if (!result) return
      
      const { data, error } = result
      if (error) {
        console.error('❌ Table Access Error:', error.message)
        return
      }
      console.log(`✅ Table Access SUCCESS!`)
      console.log(`✓ Found ${data?.length || 0} record(s)\n`)
      
      // Summary
      console.log('✅ All tests passed! Supabase connection is working.')
      process.exit(0)
    })
    .catch((err) => {
      console.error('❌ Unexpected Error:', err.message)
      console.error(err)
      process.exit(1)
    })
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error)
  process.exit(1)
}
