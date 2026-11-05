// Configuración de Marea.
//
// MAREA_PDF_BASE se antepone al campo `archivo` de cada ficha del catálogo.
// Los PDF viven en `pdfs/` dentro del propio sitio (Cloudflare Workers), así
// que la base es relativa y funciona igual en local y en producción.
// Si un `archivo` ya es una URL absoluta (http/https), se usa tal cual.
window.MAREA_PDF_BASE = 'pdfs/';
