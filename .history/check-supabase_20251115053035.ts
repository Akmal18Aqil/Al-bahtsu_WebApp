import { createClient } from '@supabase/supabase-js'

async function checkSupabaseConnection() {
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

  try {
    // Check 2: Create Supabase Client
    console.log('📋 Step 2: Creating Supabase Client')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully\n')

    // Check 3: Test Table Access
    console.log('📋 Step 3: Testing Direct Table Access')
    const { data: tableData, error: tableError } = await supabase
      .from('fiqh_entries')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Table Access Error:', tableError.message)
      console.error('Details:', tableError)
      process.exit(1)
    }
    console.log(`✅ Table Access SUCCESS!`)
    console.log(`✓ Found ${tableData?.length || 0} record(s) in fiqh_entries\n`)

    // Check 4: Test Connection with RPC
    console.log('📋 Step 4: Testing RPC Function')
    const { data: rpcData, error: rpcError } = await supabase.rpc('search_fiqh', {
      search_query: '',
    })

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError.message)
      console.error('Details:', rpcError)
      process.exit(1)
    }
    console.log(`✅ RPC Connection SUCCESS!`)
    console.log(`✓ search_fiqh RPC returned ${rpcData?.length || 0} entries\n`)

    // Summary
    console.log('✅ All tests passed! Supabase connection is working correctly.')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Unexpected Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

checkSupabaseConnection()
