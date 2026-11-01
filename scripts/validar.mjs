// Valida catalogo.json antes de publicar.
// Uso: node scripts/validar.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = new URL('../', import.meta.url);
const archivo = new URL('catalogo.json', raiz);
const errores = [];
const avisos = [];

let catalogo;
try {
  catalogo = JSON.parse(readFileSync(archivo, 'utf8'));
} catch (e) {
  console.error(`\n✗ catalogo.json no es JSON válido: ${e.message}\n`);
  process.exit(1);
}
if (!Array.isArray(catalogo)) {
  console.error('\n✗ catalogo.json debe ser una lista ([ ... ])\n');
  process.exit(1);
}

const texto = v => typeof v === 'string' && v.trim().length > 0;
const numero = v => v === null || (typeof v === 'number' && Number.isFinite(v));
const COLECCIONES = ['praxis', 'historia'];

const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const ids = new Map();
let sinArchivo = 0, sinPortada = 0, sinSinopsis = 0, impresos = 0, descargables = 0;

catalogo.forEach((p, i) => {
  const donde = `catalogo.json[${i}]`;
  const nombre = texto(p.titulo) ? `«${p.titulo}»` : '(sin título)';

  if (!texto(p.titulo)) errores.push(`${donde}: falta «titulo»`);
  if (!COLECCIONES.includes(p.coleccion)) {
    errores.push(`${donde} ${nombre}: «coleccion» debe ser praxis o historia (tiene «${p.coleccion}»)`);
  }

  // id: el sitio lo genera del título si falta, así que solo se revisan duplicados
  const id = texto(p.id) ? p.id.trim() : `m-${slug(p.titulo || '')}`;
  if (ids.has(id)) errores.push(`${donde} ${nombre}: id repetido «${id}» (ya en ${ids.get(id)})`);
  else ids.set(id, donde);

  ['anio', 'paginas', 'precio', 'stock'].forEach(c => {
    if (!numero(p[c])) errores.push(`${donde} ${nombre}: «${c}» debe ser número o null (tiene ${JSON.stringify(p[c])})`);
  });
  if (typeof p.precio === 'number' && p.precio < 0) errores.push(`${donde} ${nombre}: precio negativo`);
  if (typeof p.stock === 'number' && p.stock < 0) errores.push(`${donde} ${nombre}: stock negativo`);
  if (typeof p.destacado !== 'boolean') errores.push(`${donde} ${nombre}: «destacado» debe ser true o false`);

  if (p.archivo && p.enlace) avisos.push(`${donde} ${nombre}: tiene «archivo» y «enlace»; se usará el archivo`);
  if (p.archivo && !/^https?:\/\//i.test(p.archivo) && p.archivo.includes(':')) {
    errores.push(`${donde} ${nombre}: «archivo» solo admite ruta relativa o http(s) (tiene «${p.archivo}»)`);
  }
  if (p.enlace && !/^https?:\/\//i.test(p.enlace)) {
    errores.push(`${donde} ${nombre}: «enlace» debe empezar por http:// o https:// (tiene «${p.enlace}»)`);
  }
  if (p.archivo) {
    descargables++;
    if (!/^https?:\/\//i.test(p.archivo) && !existsSync(fileURLToPath(new URL(`pdfs/${p.archivo.replace(/^\/+/, '')}`, raiz)))) {
      avisos.push(`${donde} ${nombre}: «${p.archivo}» no está en pdfs/ (¿ya se subió a R2?)`);
    }
  } else if (p.enlace) descargables++;
  else sinArchivo++;

  if (!p.portada) sinPortada++;
  if (!texto(p.sinopsis)) sinSinopsis++;
  if (typeof p.precio === 'number') impresos++;
});

if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s) en el catálogo:\n`);
  errores.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

console.log(`✓ Catálogo válido: ${catalogo.length} fichas (${impresos} con precio, ${descargables} con descarga).`);
console.log(`  Sin PDF ni enlace: ${sinArchivo} · sin portada: ${sinPortada} · sin sinopsis: ${sinSinopsis}.`);
if (avisos.length) {
  console.log(`\n  ${avisos.length} aviso(s):`);
  avisos.slice(0, 12).forEach(a => console.log('  - ' + a));
  if (avisos.length > 12) console.log(`  - … y ${avisos.length - 12} más`);
}
