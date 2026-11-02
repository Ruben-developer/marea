# Seguridad — MAREA

Sitio estático (GitHub Pages / dominio propio) sin backend. El catálogo se edita
por JSON con Pages CMS y los PDFs se sirven aparte.

## Cómo reportar

Escribe a **mar-editorial-anarquista@riseup.net** con la URL afectada, qué ocurre
y cómo reproducirlo.

Si el fallo permite ejecutar código en el navegador de otra persona, no abras un
issue público: manda el correo primero.

## Medidas vigentes

- **Escapado** de todo el contenido del catálogo antes de insertarlo en el DOM
  (`esc()` en `app.js`).
- **Validación de esquemas**: `archivo` y `portada` solo admiten ruta relativa o
  `http(s)`; `enlace` debe ser `http(s)`. Se rechazan `javascript:`, `data:` y
  cualquier otro esquema, tanto en el sitio como en `scripts/validar.mjs`.
- **CSP** en `index.html`: todo se sirve del propio dominio; no hay CDN,
  tipografías de terceros ni peticiones externas.
- **CI** (`.github/workflows/ci.yml`): valida el catálogo, el HTML y escanea
  secretos con gitleaks.
- `.nojekyll` para que Pages sirva `pdfs/` y `covers/` tal cual.

## Alcance

Entra: XSS o inyección vía `catalogo.json`, enlaces maliciosos, dependencias
comprometidas.
No entra: errores del catálogo, precios o stock desactualizados, spam al correo.
