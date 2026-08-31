import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AppPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (error || !userId) redirect('/auth')

  const { data: membership } = await supabase
    .from('memberships')
    .select('couple_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!membership) redirect('/onboarding')
  return <Dashboard />
}
