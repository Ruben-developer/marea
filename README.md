# Marea · M.A.R. Editorial Anarquista

Sitio de la editorial libertaria Marea. Dos funciones: **descargar los PDF gratis** y
**comprar los impresos** para sostener la imprenta. El acceso al texto nunca se paga.

- **Dominio**: `marea.antarquia.cl`
- **Stack**: HTML + CSS + JavaScript vanilla. Sin build, sin dependencias, sin CDN.
- **Contenido**: `catalogo.json` (67 fichas) · `pdfs/` (PDFs) · `assets/` (sello y favicon)
- **Contacto**: antarquia@riseup.net

## Estética

El sitio usa una sola estética, **Cuadernillo**: papel crema, serif, tinta azul y el
sello rojo estampado (`data-estetica="cuadernillo"` en `<html>`). El rojo queda
reservado al sello; el azul es el acento de botones y títulos.

El tema (papel claro / modo noche) se guarda en `localStorage` y se aplica antes de
pintar para evitar el destello.

## Estructura

```
index.html      Todas las vistas (inicio, catálogo, difusión, carrito) + modales
style.css       Estética Cuadernillo; el tema noche cuelga de [data-theme=dark]
app.js          Router por hash, catálogo, filtros, carrito, modales, portadas SVG
config.js       window.MAREA_PDF_BASE (base del servidor de PDFs)
catalogo.json   Las fichas
assets/         sello.png (máscara alfa del sello real) y favicon.png
pdfs/           PDFs servidos junto al sitio
```

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
  (distinta en cada estética), así que nunca hay hueco roto.
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
de correo con un `mailto:` a antarquia@riseup.net; el pedido se acuerda por correo.
El carrito se guarda en `localStorage` y solo acepta títulos con impreso y stock.

## Desarrollo local

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. El catálogo se carga con `fetch`, así que hay que
servirlo por HTTP (`file://` lo bloquea).

## Añadir contenido

1. Copia el PDF a `pdfs/` y escribe su nombre en `archivo`.
2. Si hay portada real, cópiala a `covers/` y escribe la ruta en `portada`.
3. Añade o edita la ficha en `catalogo.json`.

## Origen del catálogo

Las 67 fichas salen de `MAREA.xlsx` (inventario real de la editorial). La
clasificación Historia/Praxis es **provisional**: la planilla no trae ese campo y
se asignó por tema. Faltan año, sinopsis y portadas reales; el precio y el stock
también hay que verificarlos antes de publicar.
