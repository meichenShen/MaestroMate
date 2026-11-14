import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import './feedback.css';

export function FeedbackEntry() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const request = useRef<AbortController | null>(null);
  const attempt = useRef(0);
  const retry = useRef({ signature: '', id: '' });
  const session = useRef({ token: '', until: 0 });
  const [kind, setKind] = useState('impression');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  useEffect(() => () => { attempt.current++; request.current?.abort(); }, []);

  function dismiss() {
    attempt.current++;
    request.current?.abort();
    request.current = null;
    setStatus(s => s === 'sending' ? 'idle' : s);
    opener.current?.focus({ preventScroll: true });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (request.current) return;
    const data = { kind, message: message.trim(), email: email.trim(), page: location.hash.split('?')[0] || '#home' };
    const signature = JSON.stringify(data);
    if (retry.current.signature !== signature) retry.current = { signature, id: crypto.randomUUID() };
    const id = retry.current.id;
    const current = ++attempt.current;
    const controller = new AbortController(); request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    setStatus('sending'); setError('');
    try {
      if (session.current.until <= Date.now()) {
        const res = await fetch('/api/feedback/session', { headers: { 'X-Feedback-Form': '1' }, signal: controller.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(res.status === 429 ? 'Please give us a moment, then try again.' : 'We couldn’t connect. Your note is still here—please try again.');
        const body = await res.json();
        if (typeof body.token !== 'string') throw new Error('We couldn’t connect. Please try again.');
        session.current = { token: body.token, until: Date.now() + 14 * 60_000 };
      }
      const res = await fetch('/api/feedback', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'X-Feedback-Token': session.current.token },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.status === 403) session.current.until = 0;
      if (!res.ok) throw new Error(res.status === 429 ? 'A few notes have arrived at once. Please try again in a little while.' : 'Your note hasn’t been confirmed. It’s still here—please try again.');
      const body = await res.json();
      if (body.ok !== true || body.id !== id) throw new Error('Your note hasn’t been confirmed. Please try again.');
      if (attempt.current === current) setStatus('success');
    } catch (err) {
      if (attempt.current === current) {
        setError(controller.signal.aborted ? 'That took a little too long. Your note is still here—please try again.' : err instanceof Error ? err.message : 'We couldn’t send your note. Please try again.');
        setStatus('error');
      }
    } finally { clearTimeout(timeout); if (attempt.current === current) request.current = null; }
  }
  const sending = status === 'sending';
  return <>
    <button className="feedback-open" ref={opener} onClick={() => dialog.current?.showModal()}>
      Tell us how it felt <ArrowUpRight size={18} />
    </button>
    {createPortal(<dialog className="feedback-dialog" ref={dialog} aria-labelledby="feedback-title" data-lenis-prevent onClose={dismiss}>
      <header className="feedback-header">
        <div><p>A note from you</p><h2 id="feedback-title">How did it feel?</h2></div>
        <button className="feedback-close" aria-label="Close feedback" onClick={() => dialog.current?.close()}><X size={24} /></button>
      </header>
      {status === 'success' ? <div className="feedback-received" role="status">
        <Check size={44} aria-hidden="true" />
        <h3>Your note is with us. Thank you.</h3>
        <p>Small impressions help this little world grow.</p>
        <button className="solid-button" onClick={() => dialog.current?.close()}>Back to the music <ArrowUpRight size={20}/></button>
        <button className="feedback-another" onClick={() => { setMessage(''); setEmail(''); setStatus('idle'); retry.current = { signature: '', id: '' }; }}>Leave another note</button>
      </div> : <form onSubmit={submit} aria-busy={sending}>
        <p className="feedback-intro">Something you loved, something that puzzled you, or a little idea. We’re listening. No account needed.</p>
        <label>About your visit<select value={kind} onChange={e => setKind(e.target.value)} disabled={sending}>
          <option value="impression">An impression</option><option value="idea">An idea</option><option value="problem">Something didn’t work</option>
        </select></label>
        <label>Your note<textarea autoFocus required maxLength={2000} rows={4} value={message} onChange={e => setMessage(e.target.value)} disabled={sending} /></label>
        <div className="feedback-count">{message.length} / 2,000</div>
        <label>Email (optional)<input type="email" maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} disabled={sending} aria-describedby="feedback-privacy" /></label>
        <p id="feedback-privacy" className="feedback-privacy">Only the MaestroMate team can read your note. Add an email if you’d like a reply.</p>
        {status === 'error' && <p className="feedback-error" role="alert">{error}</p>}
        <button className="solid-button feedback-send" type="submit" disabled={sending || !message.trim()}>{sending ? 'Sending…' : 'Send feedback'}<ArrowUpRight size={20}/></button>
      </form>}
    </dialog>, document.body)}
  </>;
}
