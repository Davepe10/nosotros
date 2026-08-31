'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const [busy,setBusy]=useState(false)
  const router=useRouter()

  async function login(e?:FormEvent) {
    e?.preventDefault(); setBusy(true); setMsg('')
    const s=createClient()
    const {error}=await s.auth.signInWithPassword({email:email.trim(),password})
    setBusy(false)
    if(error) setMsg('Correo o contraseña incorrectos.')
    else { router.replace('/app'); router.refresh() }
  }

  async function signup() {
    if(password.length<8) return setMsg('Usa una contraseña de al menos 8 caracteres.')
    setBusy(true); setMsg('')
    const s=createClient()
    const origin=window.location.origin
    const {error}=await s.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${origin}/auth/callback?next=/onboarding`}})
    setBusy(false)
    setMsg(error?'No pudimos crear la cuenta. Revisa los datos e inténtalo otra vez.':'Cuenta creada. Revisa tu correo para confirmar el acceso.')
  }

  return <main className="auth"><div className="eyebrow">Solo ustedes</div><h2 style={{fontSize:36,marginBottom:8}}>Bienvenido a Juntos 🤍</h2><p className="muted">Cada persona usa su propia cuenta. Lo privado sigue siendo privado hasta que decidas compartirlo.</p><form onSubmit={login}><label className="field">Correo<input required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="tu@correo.com"/></label><label className="field">Contraseña<input required minLength={8} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••"/></label>{msg&&<p className="tiny" role="alert">{msg}</p>}<div className="actions"><button disabled={busy} className="btn" type="submit">{busy?'Procesando…':'Entrar'}</button><button disabled={busy} className="btn secondary" type="button" onClick={signup}>Crear cuenta</button></div></form></main>
}
