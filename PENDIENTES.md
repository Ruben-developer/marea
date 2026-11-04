# Pendientes — Marea

Sitio de la editorial libertaria Marea. Dominio final: `marea.antarquia.cl`.

## 0. Correo

- [ ] Crear en Riseup el alias `contacto-marea@riseup.net` (entrega en
      `antarquia@riseup.net`) y probar un pedido real.

## 1. Catálogo (estado real)

El inventario completo de `MAREA.xlsx` tiene **67 fichas** (29 Historia / 38
Praxis), 32 con stock y 1 con PDF propio. Por pedido, `catalogo.json` quedó
**reducido a 2 fichas de muestra**: `m-001` *Ai Ferri Corti* y `m-067` *La
anarquía desde el punto de vista de un cristiano* (la única con PDF). Las otras
65 se recuperan de la planilla o del historial de git.

Lo que falta verificar o completar:

- [ ] **Clasificación Historia/Praxis**: es provisional. La planilla no trae colección;
      se asignó por tema (teoría y organización → Praxis; episodios y biografías → Historia).
      Revisar una por una con la editorial.
- [ ] **Año y sinopsis**: hoy van `null` / vacíos. Hay que escribirlos.
- [ ] **Precio y stock**: salen de la planilla y pueden estar desactualizados.
- [ ] **Restaurar el catálogo completo**: si se retoma el inventario de 67, recuperar
      las fichas desde `MAREA.xlsx` o el commit anterior a la reducción.
- [ ] **Portadas reales**: las fichas usan portada SVG generada. Descargar las
      portadas del WordPress viejo a `covers/` y rellenar `portada`.
- [ ] **Títulos dudosos**: «Ai Ferri Corti» (¿es el título o una expresión?) y
      «Golpear donde duele y El buque de los necios» (¿dos textos en un cuadernillo?).
- [ ] **«Contra los jueces»**: la planilla dice 180 páginas y $2.000; parece un libro,
      no un cuadernillo. Confirmar.

## 2. PDFs (servidor aún inexistente)

Hoy solo hay un PDF de muestra: `pdfs/la-anarquia-desde-el-punto-de-vista-de-un-cristiano.pdf`.

- [ ] Definir dónde vivirán los PDFs (mismo sitio o servidor aparte).
- [ ] Subirlos y rellenar `archivo` en cada ficha.
- [ ] Si se rehospedan desde Mega, mantener `enlace` como respaldo mientras se migra.
- [ ] Confirmar peso y licencia de cada texto antes de publicarlo.

## 3. Contenido del WordPress viejo

`porlaanarquia.wordpress.com/catalogos/` tiene **31 publicaciones** con portada y
enlace de Mega (18 antiguas, 11 actuales, 2 hackratas). El WordPress se va a retirar.

- [ ] Rescatar las 31 portadas y sus descripciones.
- [ ] Verificar los enlaces de Mega (2016–2019; varios pueden estar caídos).
- [ ] Cruzar esas 31 fichas con las 67 de la planilla y unificar duplicados.

## 4. Publicación

- [x] Crear el repo público `marea` en GitHub (cuenta `Ruben-developer`).
- [x] `git push -u origin main`.
- [x] Activar Pages: `main` / `(root)`.
- [x] URL provisional: https://ruben-developer.github.io/marea/
- [ ] Registro DNS `marea` → `ruben-developer.github.io` en Cloudflare.
- [ ] Renombrar `CNAME.pending` a `CNAME` y hacer push (hoy está fuera para que
      funcione la URL de `github.io`).
- [ ] En GitHub: Settings → Pages → Custom domain `marea.antarquia.cl` + «Enforce HTTPS».

## 5. Seguridad y CI

- [x] Escapado del catálogo y validación de esquemas (`http(s)` o relativo).
- [x] CSP en `index.html`; `.nojekyll` para servir `pdfs/` y `covers/`.
- [x] `LICENSE`, `SECURITY.md`, `robots.txt`, `.editorconfig`, `.gitattributes`.
- [ ] Subir `.github/workflows/ci.yml`: el token de `gh` no tiene scope `workflow`.
      Ejecutar `gh auth refresh -s workflow` y luego `git push`.

## 6. Decisiones de diseño

- [x] **Cuatro estéticas conmutables** desde la cabecera (3 nov 2026): Cuadernillo
      (base), Xilografía, Washi y Sello y tipos. Selector accesible, persistencia
      en `localStorage` y vista previa con `?estetica=`. Ver [`ESTETICA.md`](ESTETICA.md).
- [x] Cada estética tiene portadas SVG propias; la colección decide el acento
      (Historia = índigo, Praxis = bermellón/caqui).
- [ ] **Decidir la estética definitiva** después de la revisión visual. Si se elige
      una de las tres nuevas, borrar los bloques de las otras dos de `style.css`
      y sus portadas de `app.js`.
- [ ] **Fuentes**: evaluar una Mincho self-hosteada y subseteada para titulares
      (la CSP prohíbe fuentes externas). Hoy todo va con pilas del sistema.
- [ ] Purgar del CSS la capa base heredada de Imprenta que ya no se usa
      (tokens y reglas que cada estética pisa). No afecta al render, es limpieza.
- [ ] Definir si el manifiesto de la vista Difusión queda así o se reemplaza por el
      texto definitivo (hoy está marcado como provisional).
- [ ] Quitar el aviso de «versión en desarrollo» cuando estén los PDFs y los precios
      verificados.

## 7. Después

- [ ] Aviso en el WordPress viejo apuntando a `marea.antarquia.cl`.
- [ ] Enlazar el catálogo desde `porlaanarquia.antarquia.cl`.
- [ ] Revisar accesibilidad con teclado y lector de pantalla en las dos estéticas.
