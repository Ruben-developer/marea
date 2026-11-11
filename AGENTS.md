# AGENTS.md — Marea

## Qué es

M.A.R.E.A. Editorial Anarquista: catálogo, fichas, descarga libre del PDF y
compra del impreso.

- **Producción:** <https://marea.antarquia.cl/> (`main`)
- **Beta:** <https://marea-beta.antarquia.cl/> (`develop`)

## Stack

HTML, CSS y JavaScript vanilla. Sin framework, sin CDNs y sin fuentes externas
en tiempo de ejecución. Los datos viven en `catalogo.json`; las portadas en
`covers/` y los PDFs en `pdfs/`.

## Comandos

```bash
node scripts/validar.mjs
node --check app.js
npx html-validate@9 index.html
node scripts/build.mjs
npm run dev          # build + wrangler dev
npm run deploy:beta  # beta
npm run deploy       # producción (solo con OK)
```

## Flujo

1. Trabaja en `develop` y valida antes de commitear.
2. Push a `develop` → CI + deploy beta.
3. `main` es producción: no lo toques sin decisión explícita.

## Reglas

- No añadas CDNs, fuentes externas ni dependencias de runtime.
- No rompas las rutas `/catalogo` y `/catalogo/descarga`.
- Portadas y PDFs son locales; no enlaces a Mega ni a discos externos.
- Cada obra conserva su licencia; no inventes enlaces ni metadatos.
- Si cambia el catálogo o el deploy, actualiza `README.md` y `PENDIENTES.md`.

## Agentes y skills

- Skill `antarquia-sitios`: convenciones, Workers, cabeceras y verificación.
- Skill `antarquia-contenido`: esquema del catálogo y licencias.
- `antarquia-qa` para revisar; `antarquia-ops` para desplegar.
