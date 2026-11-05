# M.A.R.E.A. · Editorial Anarquista

Sitio de la editorial libertaria M.A.R.E.A. Dos funciones: **descargar los PDF gratis** y
**comprar los impresos** para sostener la imprenta. El acceso al texto nunca se paga.

- **En línea**: https://ruben-developer.github.io/marea/
- **Dominio final**: `marea.antarquia.cl` (pendiente de DNS; ver «Publicación»)
- **Stack**: HTML + CSS + JavaScript vanilla. Sin build, sin dependencias, sin CDN.
- **Contenido**: `catalogo.json` (2 fichas de muestra) · `pdfs/` (PDFs) · `assets/` (sello rojo y favicon)
- **Contacto**: contacto-marea@riseup.net (alias de Riseup; crearlo antes de usarlo)

## Estética

El sitio usa una sola estética, **Xilografía**: papel crudo, tinta negra y
bermellón para el sello y los acentos. Dos tintas planas, esquinas rectas,
filetes y portadas generadas en SVG. Sin texturas, tramas, degradados ni sombras.

El logo es `assets/sello-rojo.png`; el tema claro/noche (`data-theme`) se guarda
en `localStorage` (`marea_tema_v1`) y se aplica antes de pintar. Detalle de
tokens y reglas: [`ESTETICA.md`](ESTETICA.md).

## Estructura

```
index.html      Todas las vistas + modales
style.css       Tokens de Xilografía y componentes (colores planos)
app.js          Router, catálogo, carrito, modales, portadas SVG en Xilografía
config.js       window.MAREA_PDF_BASE (base del servidor de PDFs)
catalogo.json   Las fichas
covers/         Portadas subidas desde el CMS (hoy vacío: se generan en SVG)
assets/         sello-rojo.png (logo), favicon.png y sello.png (histórico)
pdfs/           PDFs servidos junto al sitio
.pages.yml      Configuración de Pages CMS (formularios sobre catalogo.json)
scripts/        validar.mjs, revisa el catálogo antes de publicar
.nojekyll       Evita que Pages procese pdfs/ y covers/ con Jekyll
.github/        CI (catálogo + HTML + gitleaks) y Dependabot
```

## Seguridad y CI

- `enlace` debe ser `http(s)` y `archivo`/`portada` solo admiten ruta relativa o
  `http(s)`: se rechazan `javascript:`, `data:` y otros esquemas, tanto en el
  sitio (`app.js`) como en `scripts/validar.mjs`.
- CSP en `index.html`: sin CDN, sin tipografías de terceros, sin peticiones
  externas.
- CI: `node scripts/validar.mjs`, `html-validate` y gitleaks en cada PR.
- Cómo reportar un fallo: ver [`SECURITY.md`](SECURITY.md).
- Licencia del código: MIT (ver [`LICENSE`](LICENSE)).

## Ficha del catálogo

```json
{
  "id": "m-001",
  "titulo": "Ai Ferri Corti",
  "autor": "Anónimo",
  "coleccion": "praxis",
  "anio": null,
  "paginas": 28,
  "sinopsis": "",
  "portada": null,
  "archivo": null,
  "enlace": null,
  "precio": 500,
  "stock": 3,
  "destacado": true
}
```

- `coleccion`: `historia` o `praxis` (Historia y Praxis).
- `portada`: ruta a una imagen. Si es `null` se dibuja una portada SVG generada
  en Xilografía, así que nunca hay hueco roto.
- `archivo`: nombre del PDF dentro de `MAREA_PDF_BASE`. Si empieza por `http`,
  se usa tal cual.
- `enlace`: URL externa de respaldo (Mega, etc.). Solo se usa si no hay `archivo`.
- `precio`: precio del impreso en CLP. **`null` = solo digital**, sin edición impresa;
  la ficha ofrece escribir a la editorial en vez de comprar.
- `stock`: unidades disponibles. `0` = agotado (el PDF sigue libre).
- Sin `archivo` ni `enlace` la ficha se muestra como «Próximamente».

## Descargas

`app.js` resuelve el enlace en este orden:

1. `archivo` absoluto (`https://…`) → tal cual.
2. `archivo` relativo → `MAREA_PDF_BASE + archivo` (por defecto `pdfs/`).
3. `enlace` externo → tal cual.
4. Nada → botón «Próximamente» deshabilitado.

`MAREA_PDF_BASE` es relativo a propósito: funciona igual en local, en
`ruben-developer.github.io/marea/` y en `marea.antarquia.cl`. Cuando exista el
servidor de descargas, basta cambiarlo por su URL en `config.js`.

## Carrito

No hay backend ni pago en línea. «Armar pedido» genera un resumen y abre el cliente
de correo con un `mailto:` a contacto-marea@riseup.net; el pedido se acuerda por correo.
El carrito se guarda en `localStorage` y solo acepta títulos con impreso y stock.

## Desarrollo local

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. El catálogo se carga con `fetch`, así que hay que
servirlo por HTTP (`file://` lo bloquea).

## Añadir contenido

La ficha se puede editar de dos maneras: con **Pages CMS** (formularios, sin
tocar JSON) o a mano en `catalogo.json`.

Con Pages CMS:

1. Entrar a `app.pagescms.org` y autorizar la GitHub App sobre
   `Ruben-developer/marea` (una vez).
2. Abrir **Catálogo** → **Add entry**, o editar una ficha existente.
3. Las portadas se suben desde el campo «Portada» y quedan en `covers/`.
4. Guardar: hace commit y el workflow despliega en Cloudflare Workers.

A mano:

1. Si el PDF va al sitio (mientras no exista R2), copiarlo a `pdfs/` y escribir
   su nombre en `archivo`. Con R2, subirlo allá y dejar solo el nombre.
2. Si hay portada real, copiarla a `covers/` y escribir la ruta en `portada`.
3. Añadir o editar la ficha en `catalogo.json`.
4. Validar antes de subir:

```bash
node scripts/validar.mjs
```

El `id` es opcional: si falta, el sitio lo genera del título (`m-titulo`). Las
fichas viejas conservan `m-001`…`m-067`.

## Publicación

El sitio se sirve desde **Cloudflare Workers** con assets estáticos:

- Producción: `main` → **https://marea.antarquia.cl/** (`deploy-workers.yml`).
- Beta: `develop` → **https://marea-beta.antarquia.cl/** (`deploy-beta.yml`).

`scripts/build.mjs` copia a `dist/` solo lo publicable. El Worker sirve
`index.html` ante cualquier ruta desconocida
(`not_found_handling: "single-page-application"`), por eso el router usa rutas
reales (`/catalogo`, `/catalogo/descarga`) sin `#`.

Para desplegar a mano:

```bash
npm ci
npm run build
npx wrangler deploy --config wrangler.jsonc       # producción
npx wrangler deploy --config wrangler.beta.jsonc  # beta
```

GitHub Pages quedó retirado: era hosting estático sin rewrites y obligaba a usar
`#/...` en las URLs.

## Origen del catálogo

Las 67 fichas originales salen de `MAREA.xlsx` (inventario real de la
editorial). **Hoy `catalogo.json` conserva solo 2 fichas de muestra**
(`m-001` y `m-067`, esta última con PDF); el resto sigue en la planilla y en el
historial de git, en el commit anterior a la reducción. La clasificación
Historia/Praxis es **provisional**: la planilla no trae ese campo y se asignó por
tema. Faltan año, sinopsis y portadas reales; el precio y el stock también hay
que verificarlos antes de publicar.
