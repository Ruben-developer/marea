// Configuración de Marea.
//
// MAREA_PDF_BASE se antepone al campo `archivo` de cada ficha del catálogo.
// Se deja relativo para que funcione igual en local y en marea.antarquia.cl
// (Cloudflare Workers).
// Cuando exista el servidor de descargas, basta cambiarlo por su URL:
//   window.MAREA_PDF_BASE = 'https://descargas.antarquia.cl/pdfs/';
// Si un `archivo` ya es una URL absoluta (http/https), se usa tal cual.
window.MAREA_PDF_BASE = 'pdfs/';
