/**
 * Marea — contador privado de descargas.
 *
 * Intercepta solo /pdfs/*.pdf y /api/*. El resto de los assets los sirve
 * Cloudflare directamente (run_worker_first en wrangler.jsonc).
 *
 * Cada descarga completa se suma en un Durable Object con SQLite:
 *   - total histórico por archivo
 *   - detalle diario (para ver tendencias)
 *
 * No guarda IPs, cookies ni identificadores. El endpoint de consulta exige
 * un token Bearer (secreto ADMIN_TOKEN) y no se enlaza desde el sitio.
 */

const PDF_PREFIX = '/pdfs/';
const STATS_PATH = '/api/descargas';
const MAX_FILE = 240;
const MAX_DAYS = 365;

// Bots de buscadores, previsualizadores y crawlers conocidos. No se filtra
// curl/wget: una descarga manual también cuenta.
const BOT_RE = /(bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|googlebot|yandex|baiduspider|duckduckbot)/i;

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      ...extra,
    },
  });
}

function plain(message, status = 200, extra = {}) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      ...extra,
    },
  });
}

function isPdfPath(pathname) {
  return pathname.startsWith(PDF_PREFIX) && /\.pdf$/i.test(pathname);
}

/** Devuelve el nombre relativo dentro de /pdfs/ o null si no es seguro. */
function cleanFile(value) {
  if (typeof value !== 'string') return null;
  let file;
  try {
    file = decodeURIComponent(value).normalize('NFC').trim();
  } catch {
    return null;
  }
  if (!file || file.length > MAX_FILE) return null;
  if (file.includes('..') || file.includes('\\') || file.startsWith('/')) return null;
  if (/[\u0000-\u001f\u007f]/.test(file)) return null;
  if (!/\.pdf$/i.test(file)) return null;
  return file;
}

function cleanDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + 'T00:00:00Z');
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return value;
}

function isBot(request) {
  const ua = request.headers.get('user-agent') || '';
  return BOT_RE.test(ua);
}

function daysFrom(request) {
  const url = new URL(request.url);
  const raw = Number.parseInt(url.searchParams.get('days') || '30', 10);
  if (!Number.isFinite(raw)) return 30;
  return Math.min(MAX_DAYS, Math.max(1, raw));
}

/** Compara dos cadenas sin filtrar su longitud por tiempo. */
async function tokenOk(request, expected) {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(match[1])),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const va = new Uint8Array(a);
  const vb = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < va.length; i += 1) diff |= va[i] ^ vb[i];
  return diff === 0;
}

function counter(env) {
  return env.DESCARGAS.get(env.DESCARGAS.idFromName('global'));
}

async function record(env, file) {
  const day = new Date().toISOString().slice(0, 10);
  const response = await counter(env).fetch('https://contador/hit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, day }),
  });
  if (!response.ok) throw new Error('el contador respondió ' + response.status);
}

async function handlePdf(request, env) {
  const response = await env.ASSETS.fetch(request);

  if (request.method !== 'GET') return response;
  if (response.status !== 200) return response;
  // Las peticiones parciales (visor de PDF, reanudaciones) no son descargas.
  if (request.headers.has('range')) return response;
  if (isBot(request)) return response;

  const type = (response.headers.get('content-type') || '').toLowerCase();
  if (!type.includes('application/pdf')) return response;

  const file = cleanFile(new URL(request.url).pathname.slice(PDF_PREFIX.length));
  if (!file) return response;

  try {
    await record(env, file);
  } catch (error) {
    // Nunca bloquear la descarga por un fallo del contador.
    console.error('contador de descargas:', error);
  }
  return response;
}

function csvCell(value) {
  return '"' + String(value ?? '').replace(/"/g, '""') + '"';
}

function toCsv(files) {
  const rows = ['archivo,descargas,primera,ultima'];
  for (const item of files) {
    rows.push([
      csvCell(item.file),
      item.downloads,
      csvCell(item.first),
      csvCell(item.last),
    ].join(','));
  }
  return rows.join('\n') + '\n';
}

async function handleStats(request, env) {
  if (request.method !== 'GET') return plain('Método no permitido', 405);
  if (!env.ADMIN_TOKEN) return plain('Falta configurar ADMIN_TOKEN', 503);
  if (!(await tokenOk(request, env.ADMIN_TOKEN))) {
    return plain('No autorizado', 401, { 'WWW-Authenticate': 'Bearer realm="descargas"' });
  }

  const url = new URL(request.url);
  const days = daysFrom(request);
  const response = await counter(env).fetch('https://contador/stats?days=' + days);
  if (!response.ok) return plain('El contador no respondió', 502);

  const data = await response.json();
  data.generated_at = new Date().toISOString();
  data.period_days = days;
  data.total_downloads = data.files.reduce((sum, item) => sum + item.downloads, 0);

  if (url.searchParams.get('format') === 'csv') {
    return new Response(toCsv(data.files), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="descargas-marea.csv"',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return json(data);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === STATS_PATH) return handleStats(request, env);
    if (url.pathname.startsWith('/api/')) return json({ error: 'no encontrado' }, 404);
    if (url.pathname.startsWith(PDF_PREFIX)) return handlePdf(request, env);
    return env.ASSETS.fetch(request);
  },
};

export class DownloadCounter {
  constructor(state) {
    this.sql = state.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS total (
        file TEXT PRIMARY KEY,
        n INTEGER NOT NULL DEFAULT 0,
        first_seen TEXT NOT NULL,
        last_seen TEXT NOT NULL
      )
    `);
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS daily (
        file TEXT NOT NULL,
        day TEXT NOT NULL,
        n INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (file, day)
      )
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/hit') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'cuerpo inválido' }, 400);
      }
      const file = cleanFile(body && body.file);
      const day = cleanDay(body && body.day);
      if (!file || !day) return json({ error: 'datos inválidos' }, 400);

      this.sql.exec(
        `INSERT INTO total (file, n, first_seen, last_seen)
         VALUES (?, 1, ?, ?)
         ON CONFLICT(file) DO UPDATE SET
           n = n + 1,
           last_seen = excluded.last_seen`,
        file, day, day
      );
      this.sql.exec(
        `INSERT INTO daily (file, day, n)
         VALUES (?, ?, 1)
         ON CONFLICT(file, day) DO UPDATE SET n = n + 1`,
        file, day
      );
      return json({ ok: true });
    }

    if (request.method === 'GET' && url.pathname === '/stats') {
      const days = Math.min(MAX_DAYS, Math.max(1, Number.parseInt(url.searchParams.get('days') || '30', 10) || 30));
      const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
      const files = this.sql.exec(
        `SELECT file, n AS downloads, first_seen AS first, last_seen AS last
         FROM total
         ORDER BY downloads DESC, file ASC`
      ).toArray();
      const daily = this.sql.exec(
        `SELECT file, day, n AS downloads
         FROM daily
         WHERE day >= ?
         ORDER BY day DESC, downloads DESC, file ASC`,
        since
      ).toArray();
      return json({ files, daily });
    }

    return json({ error: 'no encontrado' }, 404);
  }
}
