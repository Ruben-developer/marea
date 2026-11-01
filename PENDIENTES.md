# Pendientes — Marea

Catálogo digital de la editorial libertaria Marea.
Dominio final: `marea.antarquia.cl`

## 1. Contenido (lo urgente)

El catálogo real sigue en el WordPress viejo (`porlaanarquia.wordpress.com/catalogos/`),
que se va a retirar. Hay **31 publicaciones** con portada y enlace de descarga:

| Página del WordPress | Publicaciones |
|---|---|
| `/catalogos/libros-y-cuadernillos-antiguos` | 18 |
| `/catalogos/cuadernillos` | 11 |
| `/catalogos/cuadernillos-hackratas` | 2 |

- [ ] Extraer las 31 fichas a `catalogo.json` (título, autoría, portada, descripción).
- [ ] Clasificar cada una en `historia` o `praxis` (el WP separa por época y formato, no por tema).
- [ ] Descargar las 31 portadas a `covers/` y corregir la ruta `portada` en cada ficha.
- [ ] Verificar los 31 enlaces de Mega (son de 2016–2019, muchos pueden estar caídos).
- [ ] Completar los títulos que faltan (cuadernillos antiguos sin portada).

## 2. Servidor de PDFs (aún no existe)

- [ ] Montar el almacenamiento de PDFs y definir `MAREA_PDF_BASE` / `PDF_BASE`.
- [ ] Subir los PDFs y rellenar el campo `archivo` de cada ficha.
- [ ] Sustituir los enlaces de Mega por `archivo` a medida que se rehospeden.

## 3. Publicación

- [ ] Crear repo público `marea` en GitHub (cuenta `Ruben-developer`). Hoy no existe (404).
- [ ] `git push -u origin main`.
- [ ] Activar Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.
- [ ] Añadir `CNAME` con `marea.antarquia.cl` (ya está en el repo).
- [ ] Crear el registro DNS `marea` → `ruben-developer.github.io` en Cloudflare.
- [ ] URL provisional: `https://ruben-developer.github.io/marea/`

## 4. Después

- [ ] Aviso en el WordPress viejo apuntando a `marea.antarquia.cl`.
- [ ] Revisar si el catálogo de la editorial debe enlazarse desde `porlaanarquia.antarquia.cl`.
