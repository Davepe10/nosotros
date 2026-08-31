'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function friendlyError(message: string) {
  if (message.includes('ALREADY_LINKED')) return 'Esta cuenta ya pertenece a un espacio.'
  if (message.includes('INVALID_INVITE')) return 'El código de invitación no es válido.'
  if (message.includes('COUPLE_FULL')) return 'Ese espacio ya tiene sus dos integrantes.'
  return 'No pudimos completar la acción. Inténtalo nuevamente.'
}

export default function Onboarding() {
  const [name, setName] = useState('')
  const [spaceName, setSpaceName] = useState('Nosotros')
  const [code, setCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function createSpace() {
    setBusy(true); setMessage('')
    const supabase = createClient()
    const { data, error } = await supabase.rpc('create_couple_space', { space_name: spaceName, member_name: name || null })
    setBusy(false)
    if (error) return setMessage(friendlyError(error.message))
    const invite = Array.isArray(data) ? data[0]?.invite_code : undefined
    if (invite) setCreatedCode(invite)
    else router.replace('/app')
  }

  async function joinSpace() {
    if (!code.trim()) return setMessage('Escribe el código de invitación.')
    setBusy(true); setMessage('')
    const supabase = createClient()
    const { error } = await supabase.rpc('join_couple_space', { code: code.trim(), member_name: name || null })
    setBusy(false)
    if (error) return setMessage(friendlyError(error.message))
    router.replace('/app'); router.refresh()
  }

  if (createdCode) return <main className="auth"><div className="eyebrow">Espacio creado</div><h2>Invita a tu persona 🤍</h2><p className="muted">Comparte este código únicamente con la persona que quieres vincular.</p><div className="inviteCode">{createdCode}</div><button className="btn" onClick={()=>{router.replace('/app');router.refresh()}}>Entrar a Juntos</button></main>

  return <main className="auth"><div className="eyebrow">Primer paso</div><h2 style={{fontSize:36,marginBottom:8}}>Creen su espacio privado</h2><p className="muted">Una persona crea el espacio y comparte el código. La otra se une con ese código.</p><label className="field">Tu nombre<input maxLength={60} value={name} onChange={e=>setName(e.target.value)} placeholder="Cómo quieres aparecer" /></label><hr className="divider"/><h3>Crear un espacio</h3><label className="field">Nombre del espacio<input maxLength={80} value={spaceName} onChange={e=>setSpaceName(e.target.value)} /></label><button className="btn" disabled={busy} onClick={createSpace}>{busy?'Procesando…':'Crear espacio'}</button><hr className="divider"/><h3>Unirme a uno existente</h3><label className="field">Código de invitación<input autoCapitalize="none" autoCorrect="off" value={code} onChange={e=>setCode(e.target.value)} placeholder="Ej. a1b2c3d4e5f6" /></label><button className="btn secondary" disabled={busy} onClick={joinSpace}>{busy?'Procesando…':'Unirme con código'}</button>{message&&<p className="tiny" role="alert">{message}</p>}</main>
}
