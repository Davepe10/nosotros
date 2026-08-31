import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Onboarding from './ui'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (error || !userId) redirect('/auth')

  const { data: membership } = await supabase.from('memberships').select('couple_id').eq('user_id', userId).maybeSingle()
  if (membership) redirect('/app')

  return <Onboarding />
}
