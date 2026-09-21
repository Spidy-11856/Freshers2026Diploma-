interface Env {
  FRESHERS_DB: D1Database;
  ORGANISER_ID?: string;
  ORGANISER_PASSWORD?: string;
  SESSION_SECRET?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
}

type Ctx = { request: Request; env: Env; params: Record<string, string> };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const input = async (request: Request) => { try { return await request.json() as Record<string, any>; } catch { return {}; } };
const token = () => crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
const hash = async (value: string) => { const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); return [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, '0')).join(''); };
const settings = async (db: D1Database) => Object.fromEntries((await db.prepare('SELECT key,value FROM settings').all()).results.map((row: any) => [row.key, row.value]));
const authenticated = async (request: Request, env: Env) => { const raw = request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''); if (!raw) return false; const found = await env.FRESHERS_DB.prepare('SELECT token_hash FROM sessions WHERE token_hash=? AND expires_at>?').bind(await hash(raw), Date.now()).first(); return Boolean(found); };
const passCode = () => `F26-${crypto.randomUUID().slice(0, 4).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

export const onRequest: PagesFunction<Env> = async ({ request, env }: Ctx) => {
  const path = new URL(request.url).pathname.replace(/^\/api\/?/, '');
  if (!env.FRESHERS_DB) return json({ error: 'Cloudflare D1 binding FRESHERS_DB is not configured.' }, 503);
  if (request.method === 'GET' && path === 'settings') return json(await settings(env.FRESHERS_DB));
  if (request.method === 'GET' && path === 'announcements') return json((await env.FRESHERS_DB.prepare('SELECT * FROM announcements WHERE published=1 ORDER BY id DESC').all()).results);

  if (request.method === 'POST' && path === 'applications') {
    const x = await input(request); if (!x.full_name || !x.registration || !['Dance', 'Drama / Acting', 'Singing'].includes(x.event_type)) return json({ error: 'Please complete the required fields.' }, 400);
    await env.FRESHERS_DB.prepare('INSERT INTO applications(full_name,registration,branch,phone,email,event_type,performance,participants,description) VALUES (?,?,?,?,?,?,?,?,?)').bind(x.full_name, x.registration, x.branch || '', x.phone || '', x.email || '', x.event_type, x.performance || '', Number(x.participants || 1), x.description || '').run();
    return json({ message: 'Your performance request has been submitted successfully.' });
  }
  if (request.method === 'POST' && path === 'auth/login') {
    const x = await input(request); const id = env.ORGANISER_ID || 'NIKHIL_2515082'; const password = env.ORGANISER_PASSWORD;
    if (!password || x.id !== id || x.password !== password) return json({ error: 'Invalid organiser credentials.' }, 401);
    const raw = token(); await env.FRESHERS_DB.prepare('INSERT INTO sessions(token_hash,expires_at) VALUES (?,?)').bind(await hash(raw), Date.now() + 8 * 60 * 60 * 1000).run(); return json({ token: raw });
  }
  if (request.method === 'POST' && path === 'passes/retrieve') {
    const x = await input(request); const pass = await env.FRESHERS_DB.prepare("SELECT * FROM passes WHERE registration=? AND pass_code=? AND payment_status='VERIFIED'").bind(x.registration, x.pass_code).first(); if (!pass) return json({ error: 'Pass not found.' }, 404); return json(pass);
  }
  if (request.method === 'POST' && path === 'payments/create') {
    const x = await input(request); const s = await settings(env.FRESHERS_DB); const price = Number(s.passPrice || 499); if (!x.full_name || !x.registration || !['FRESHER','SENIOR'].includes(x.pass_type)) return json({ error: 'Registration details are incomplete.' }, 400);
    const code = passCode(); await env.FRESHERS_DB.prepare('INSERT INTO passes(full_name,registration,branch,pass_type,year_semester,phone,email,price,pass_code,qr_token) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(x.full_name, x.registration, x.branch || '', x.pass_type, x.year_semester || '', x.phone || '', x.email || '', price, code, token()).run();
    return json({ status: 'PENDING_PAYMENT', message: env.RAZORPAY_KEY_ID ? 'Razorpay can be connected after deployment.' : 'Payment provider is not configured yet.' });
  }

  if (!(await authenticated(request, env))) return json({ error: 'Authentication required.' }, 401);
  if (request.method === 'GET' && path === 'admin/stats') { const count = async (sql: string) => Number((await env.FRESHERS_DB.prepare(sql).first<any>())?.c || 0); return json({ passes: await count('SELECT count(*) c FROM passes'), paid: await count("SELECT count(*) c FROM passes WHERE payment_status='VERIFIED'"), used: await count('SELECT count(*) c FROM passes WHERE used_at IS NOT NULL'), unused: await count("SELECT count(*) c FROM passes WHERE payment_status='VERIFIED' AND used_at IS NULL"), revenue: await count("SELECT COALESCE(sum(price-discount),0) c FROM passes WHERE payment_status='VERIFIED'"), applications: await count('SELECT count(*) c FROM applications') }); }
  if (request.method === 'GET' && path === 'admin/passes') return json((await env.FRESHERS_DB.prepare('SELECT * FROM passes ORDER BY created_at DESC').all()).results);
  if (request.method === 'GET' && path === 'admin/applications') return json((await env.FRESHERS_DB.prepare('SELECT * FROM applications ORDER BY created_at DESC').all()).results);
  if (request.method === 'PUT' && path === 'admin/settings') { const x = await input(request); for (const [key, value] of Object.entries(x)) await env.FRESHERS_DB.prepare('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key, String(value)).run(); return json(await settings(env.FRESHERS_DB)); }
  if (request.method === 'POST' && path === 'admin/scan') { const x = await input(request); const pass = await env.FRESHERS_DB.prepare("SELECT * FROM passes WHERE qr_token=? AND payment_status='VERIFIED'").bind(x.token).first(); if (!pass) return json({ error: 'Invalid pass.' }, 404); return json({ status: (pass as any).used_at ? 'USED' : 'UNUSED', pass }); }
  if (request.method === 'POST' && path === 'admin/scan/use') { const x = await input(request); const result = await env.FRESHERS_DB.prepare("UPDATE passes SET used_at=CURRENT_TIMESTAMP WHERE qr_token=? AND used_at IS NULL AND payment_status='VERIFIED'").bind(x.token).run(); if (!result.meta.changes) return json({ error: 'Pass already used or invalid.' }, 409); return json({ ok: true }); }
  return json({ error: 'Not found.' }, 404);
};
