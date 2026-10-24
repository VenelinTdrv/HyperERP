import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'HyperERP · Вход' }, { name: 'description', content: 'Вход в HyperERP за управление на продажби на козметика.' },
    { property: 'og:title', content: 'HyperERP · Вход' }, { property: 'og:description', content: 'Защитен достъп до работното пространство на HyperERP.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = register
        ? await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth` } })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) { setMessage(register ? 'Регистрацията не е успешна. Проверете данните и опитайте отново.' : 'Невалиден имейл или парола, или имейлът още не е потвърден.'); return; }
      setPassword('');
      if (result.data.session) await navigate({ to: '/' });
      else setMessage('Проверете имейла си за потвърждение на регистрацията.');
    } catch { setMessage('Няма връзка със системата. Опитайте отново.'); }
    finally { setBusy(false); }
  }
  return <div className="min-h-dvh flex items-center justify-center bg-background px-5 py-12"><div className="w-full max-w-sm">
    <div className="flex items-center gap-3 mb-10"><div className="brand-mark">h</div><div className="brand-name">hyper<span>ERP</span></div></div>
    <LockKeyhole className="text-primary mb-4" size={28}/><h1 className="text-2xl font-bold mb-6">{register ? 'Регистрация' : 'Вход в HyperERP'}</h1>
    <form className="delivery-editor" onSubmit={submit}>
      {register && <div className="field"><label htmlFor="auth-name">Име</label><input id="auth-name" autoComplete="name" required value={name} onChange={e => setName(e.target.value)}/></div>}
      <div className="field"><label htmlFor="auth-email">Имейл</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}/></div>
      <div className="field"><label htmlFor="auth-password">Парола</label><input id="auth-password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)}/></div>
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      <Button type="submit" disabled={busy}><LogIn/>{busy ? 'Моля, изчакайте…' : register ? 'Регистрирай се' : 'Вход'}</Button>
      <Button type="button" variant="link" disabled={busy} onClick={() => { setRegister(!register); setMessage(''); }}>{register ? 'Вече имам профил' : 'Създай профил'}</Button>
    </form>
  </div></div>;
}