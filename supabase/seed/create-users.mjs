/**
 * supabase/seed/create-users.mjs
 *
 * Creates the two demo auth users (James + Yuki) via the Supabase admin API.
 * No npm dependencies — uses Node 18+ built-in fetch.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node supabase/seed/create-users.mjs
 *
 * Find your service role key in:
 *   Supabase dashboard → Project Settings → API → service_role (secret)
 */

const SUPABASE_URL = 'https://vlewxuvlhbvpityfhvyy.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY env var is not set.')
  console.error('Find it at: Supabase dashboard → Project Settings → API → service_role')
  process.exit(1)
}

async function createUser(email, password, displayName) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    // 422 = user already exists — fetch their ID instead
    if (res.status === 422) {
      console.log(`  ⚠ ${email} already exists — fetching existing ID...`)
      return getExistingUser(email)
    }
    throw new Error(`Failed to create ${email}: ${JSON.stringify(data)}`)
  }

  return data
}

async function getExistingUser(email) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
    },
  )
  const data = await res.json()
  const user = data.users?.[0]
  if (!user) throw new Error(`Could not find existing user: ${email}`)
  return user
}

console.log('Creating demo auth users...\n')

const james = await createUser(
  'james.lee@smbc.com.sg',
  'Demo1234!',
  'James Lee',
)
console.log(`✓ James Lee  ${james.id}`)

const yuki = await createUser(
  'yuki.tanaka@kaisei.co.jp',
  'Demo1234!',
  'Yuki Tanaka',
)
console.log(`✓ Yuki Tanaka  ${yuki.id}`)

console.log(`
Users created. Run the seed next:

  Supabase dashboard → SQL Editor → paste supabase/seed/dev_seed.sql → Run

The seed auto-resolves James and Yuki by email — no UUID changes needed.
`)
