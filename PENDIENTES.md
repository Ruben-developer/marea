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
- [ ] **Sinopsis**: hoy están vacías. Hay que escribirlas.
- [ ] **Precio y stock**: por ahora todos los impresos valen $1.000. El stock sale
      de la planilla y puede estar desactualizado; `0` deja el título como «Solo digital».
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

- [x] **Estética definitiva: Xilografía** (4 nov 2026). Se eliminó el selector y
      las estéticas Cuadernillo, Washi y Sello y tipos. Papel crudo, tinta negra
      y bermellón, con colores planos (sin texturas ni degradados). Ver
      [`ESTETICA.md`](ESTETICA.md).
- [x] Logo oficial `assets/sello-rojo.png` en cabecera, portada, pie y fichas.
- [x] Marca visible `M.A.R.E.A.`, sin subtítulo.
- [x] Manifiesto definitivo en Difusión y su introducción en Inicio.
- [x] Se quitaron la barra de estado, el aviso del catálogo, las bandas de
      «¡La propiedad es un robo!», la política de reproducción y los lemas.
- [ ] **Fuentes**: evaluar una Mincho self-hosteada y subseteada para titulares
      (la CSP prohíbe fuentes externas). Hoy todo va con pilas del sistema.
- [ ] Revisar el contraste del bermellón en textos pequeños (hoy se usa solo en
      titulares, sellos y botones).

## 7. Después

- [ ] Aviso en el WordPress viejo apuntando a `marea.antarquia.cl`.
- [ ] Enlazar el catálogo desde `porlaanarquia.antarquia.cl`.
- [ ] Revisar accesibilidad con teclado y lector de pantalla en tema claro y oscuro.

## 8. Ideas a investigar

- [ ] **Cuadernillo sobre Ramón Lagos**, anarquista chileno. Idea de la
      editorial **en investigación**. Todavía **no hay texto propio ni
      licencia resuelta**. No crear ficha en `catalogo.json` hasta tener
      material propio o autorizado; iría a la colección `historia`.

      El material vive en el vault de Obsidian, no en este repo:
      `~/Documentos/Antarquia/MAREA/Investigacion/`

      - `Ramón Lagos - dossier.md` — fuentes, citas, cronología, homónimos y
        preguntas abiertas.
      - `Ramón Lagos - cuadernillo.md` — borrador completo del cuadernillo
        (título, nota preliminar, capítulos, documentos y cronología).
      - `ramon-lagos/` — las 11 imágenes citadas, con rutas relativas.

      Pistas ya confirmadas con fuente primaria:
      - **Chileno, chofer/taxista.** «Ramón Lagos, chileno, 35 años, 18 de
        residencia» (*La Mañana*, Montevideo, 29/03/1931, p. 14).
      - **Fuga del penal de Punta Carretas (marzo de 1931).** Alquiló y
        mantuvo la casa de la calle Coquimbo 2314 donde se guardaron los
        autos de la banda de Miguel Arcángel Roscigna; detenido en 18 y Río
        Branco dos días antes que el resto del grupo.
      - **Delegado obrero en la Patagonia.** Fusilado por el comisario
        Douglas en Punta Alta (noviembre de 1921) y sobreviviente; dos
        relatos independientes lo nombran (Bayer, *Rebellion in Patagonia*;
        *La Patagonia Argentina*, FOLB, 1922).
      - **Dirigente y administrador anarquista en Argentina.** Consejero del
        Comité Pro Local de la FORA en Tacuarí 653 y delegado de la FORA en
        1923 (*La Protesta*); administrador de *La Antorcha* (1923) y agente
        de *Brazo y Cerebro* en Bahía Blanca (1926).
      - **Retrato localizado.** *La Mañana*, 27/03/1931, p. 8: «EL CHAUFFEUR
        CHILENO LAGOS, QUE ESCONDIO LOS AUTOS QUE SIRVIERON PARA LA FUGA».
        Es el retrato que, según la p. 14 del 29/03, hizo que lo reconocieran
        como «el titulado Aquino».

      Enfoque decidido: **«el hombre de confianza»**. La introducción declara
      que no es un estudio académico ni una biografía definitiva, sino un
      intento de recuperación de memoria; y que los tres Lagos documentados
      pueden ser la misma persona o no serlo. Texto de trabajo en
      `Ramón Lagos - dossier.md` § 10.0.

      Pendiente antes de escribir:
      - Probar documentalmente que los tres escenarios son la misma persona
        (falta expediente judicial uruguayo de 1931 y ficha policial).
      - Resolver derechos de las imágenes de prensa (digitalización de
        Internet Archive; para impresión habría que ir a la Biblioteca
        Nacional de Uruguay).

      Si la investigación no da para un cuadernillo, dejar constancia acá y
      cerrar la idea.
