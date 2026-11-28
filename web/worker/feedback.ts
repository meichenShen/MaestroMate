interface Statement {
  bind(...values: (string | number | null)[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ meta: { changes: number } }>;
}
export interface Database { prepare(sql: string): Statement; batch(statements: Statement[]): Promise<unknown[]> }
export interface FeedbackEnv { DB: Database }
const minute = 60_000;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const json = (status: number, body: Record<string, unknown>, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
});
const failure = (status: number) => json(status, { ok: false });
async function hash(token: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join('');
}
async function boundedBody(request: Request) {
  if (Number(request.headers.get('content-length')) > 8192) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); throw new RangeError(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const all = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder('utf-8', { fatal: true }).decode(all);
}
type Note = { id: string; kind: string; message: string; email: string | null; page: string };
function validate(value: unknown): Note | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const p = value as Record<string, unknown>;
  if (typeof p.id !== 'string' || !uuid.test(p.id) || !['impression', 'idea', 'problem'].includes(String(p.kind))) return null;
  if (typeof p.message !== 'string' || !p.message.trim() || p.message.length > 2000) return null;
  if (typeof p.email !== 'string' || p.email.length > 254 || (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))) return null;
  if (typeof p.page !== 'string' || !/^#[a-z0-9/_-]{0,120}$/i.test(p.page)) return null;
  return { id: p.id, kind: String(p.kind), message: p.message.trim(), email: p.email || null, page: p.page };
}

export async function handleFeedback(request: Request, env: FeedbackEnv): Promise<Response> {
  const url = new URL(request.url);
  const session = url.pathname === '/api/feedback/session';
  if (request.method !== (session ? 'GET' : 'POST')) return json(405, { ok: false }, { Allow: session ? 'GET' : 'POST' });
  const origin = request.headers.get('origin');
  // A same-origin GET may omit Origin. Sec-Fetch-Site + a custom header still
  // prevents cross-origin forms and browsers from minting write capabilities.
  const sameOrigin = origin === url.origin || (session && !origin && request.headers.get('sec-fetch-site') === 'same-origin');
  if (!sameOrigin || (session && request.headers.get('x-feedback-form') !== '1')) return failure(403);
  try {
    const now = Date.now();
    if (session) {
      const token = crypto.randomUUID(); const tokenHash = await hash(token);
      await env.DB.prepare('DELETE FROM feedback_sessions WHERE created_at < ?').bind(now - 60 * minute).run();
      const result = await env.DB.prepare(`INSERT INTO feedback_sessions(token_hash, created_at, expires_at)
        SELECT ?, ?, ? WHERE (SELECT count(*) FROM feedback_sessions WHERE created_at >= ?) < 2000`)
        .bind(tokenHash, now, now + 15 * minute, now - 60 * minute).run();
      return result.meta.changes ? json(200, { token }) : json(429, { ok: false }, { 'Retry-After': '60' });
    }
    const token = request.headers.get('x-feedback-token') || '';
    if (!uuid.test(token)) return failure(403);
    const tokenHash = await hash(token);
    const capability = await env.DB.prepare('SELECT expires_at FROM feedback_sessions WHERE token_hash = ?').bind(tokenHash).first<{ expires_at: number }>();
    if (!capability || capability.expires_at <= now) return failure(403);
    if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) return failure(415);
    let note: Note | null;
    try { note = validate(JSON.parse(await boundedBody(request))); }
    catch (error) { return failure(error instanceof RangeError ? 413 : 400); }
    if (!note) return failure(400);
    // One conditional write makes quota checks atomic, including concurrent requests.
    const result = await env.DB.prepare(`INSERT INTO feedback(id, session_hash, created_at, kind, message, email, page)
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE (SELECT count(*) FROM feedback WHERE session_hash = ? AND created_at >= ?) < 3
      AND (SELECT count(*) FROM feedback WHERE created_at >= ?) < 300
      ON CONFLICT(id) DO NOTHING`)
      .bind(note.id, tokenHash, now, note.kind, note.message, note.email, note.page, tokenHash, now - 10 * minute, now - 60 * minute).run();
    if (result.meta.changes) return json(201, { ok: true, id: note.id });
    // Only acknowledge an exact retry. Never return saved text/contact details.
    const previous = await env.DB.prepare('SELECT kind, message, email, page FROM feedback WHERE id = ?').bind(note.id).first<Omit<Note, 'id'>>();
    if (previous) return previous.kind === note.kind && previous.message === note.message && previous.email === note.email && previous.page === note.page
      ? json(200, { ok: true, id: note.id }) : failure(409);
    return json(429, { ok: false }, { 'Retry-After': '600' });
  } catch {
    // Do not log user messages, email addresses or capability values.
    return failure(503);
  }
}
