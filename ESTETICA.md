# Estética — Marea

Cuatro estéticas conmutables desde la cabecera. Cada una cambia **paleta,
tipografía, geometría, sello y portadas generadas**; no es un tema de color.

| id | Nombre | Papel | Acento | Sello | Portada |
|---|---|---|---|---|---|
| `cuadernillo` | Cuadernillo | `#f1e9d6` | `#1f3d63` azul | circular (`sello.png`) | olas / asamblea |
| `xilografia` | Xilografía | `#ede6d4` | `#b5342a` bermellón | cuadrado (`sello-hanko.svg`) | marco, bloque, talla |
| `washi` | Washi | `#ece5d3` | `#223a52` índigo | cuadrado | panel índigo con trama |
| `sello` | Sello y tipos | `#f2ecdb` | `#a83226` rojo | cuadrado | tipográfica, doble filete |

Referentes de las tres nuevas: el **Movimiento de la Nueva Xilografía** chino
(1930s), las revistas del **proletarian art movement** japonés (1925–34), la
prensa anarquista de Meiji/Taishō (*Heimin Shimbun*, 1903; *Xin Shiji*, 1907;
*MinSheng*, 1912), el estampado con plantilla (*katazome*) y la talla de sellos
(*hanko*). Se usan como lenguaje de imprenta, no como adorno: dos tintas,
filetes, retícula recta y el sello como firma del colectivo.

## Cómo se cambia

- Botón **Estilo** en la cabecera (`#estiloPicker`): panel con radios nativos,
  cierra con `Escape`, clic fuera o al elegir.
- Se guarda en `localStorage` → `marea_estetica_v1`.
- `?estetica=xilografia` fuerza una **vista previa** sin guardar; al elegir en el
  selector se quita el parámetro y manda la elección guardada.
- `data-estetica` vive en `<html>`. Un script en `<head>` lo aplica antes de
  pintar (evita el destello), igual que el tema.

El tema claro/noche es independiente: `data-theme="light|dark"` y clave
`marea_tema_v1_cuadernillo`.

## Arquitectura

```
index.html   <html data-estetica="..."> + selector + sprites de sello
style.css    :root[data-estetica=X] { tokens } + capa común + ajustes por estilo
app.js       ESTILOS, setEstilo(), sincronización del selector y portadas SVG
assets/      sello.png (circular) · sello-hanko.svg (cuadrado, máscara alfa)
```

- **Tokens** (`style.css`): cada bloque define `--bg`, `--bg2`, `--ink`, `--ink2`,
  `--line`, `--acento`, `--indigo`, `--on-acento`, `--display`, `--mono`,
  `--sello-img`, `--trama` y `--radio-ui`/`--radio-panel`. El modo noche repite
  los mismos tokens bajo `[data-theme=dark]`.
- **Capa común**: un `:is([data-estetica=xilografia],[data-estetica=washi],[data-estetica=sello])`
  aplica lo compartido (esquinas rectas, filetes, botones, cabecera, hero,
  tarjetas, ficha). Así una regla nueva no se repite tres veces.
- **Sello**: `.sello` es una máscara alfa; el color sale de `--sello-color`. Para
  las estéticas de imprenta se cambia `--sello-img` a `assets/sello-hanko.svg`.
  El cuadrado pinta y las barras interiores quedan en blanco: estampa tallada.
- **Portadas** (`app.js`): `portada()` despacha según `estiloActual()` a
  `portadaCuadernillo`, `portadaXilo`, `portadaWashi` o `portadaSello`. Todas
  comparten `ajustarTitulo()` y el formato 300×420. El acento lo decide la
  colección: Historia = índigo, Praxis = bermellón (caqui en Washi).
- **Al cambiar de estilo** se regeneran destacados y catálogo (y carrito si está
  visible), se cierran los modales abiertos y se actualiza
  `<meta name="theme-color">`.

## Añadir una estética

1. Elegir un `id` corto y añadirlo a `ESTILOS` en `app.js` y al array del script
   de `<head>`.
2. Copiar un bloque `:root[data-estetica=...]` en `style.css` y definir todos los
   tokens (claro y `[data-theme=dark]`).
3. Añadir los ajustes propios (cabecera, hero, tarjetas) al final.
4. Añadir una portada en `PALETA_PORTADA` + función `portadaX()` y despacharla en
   `portada()`.
5. Añadir la opción al selector (`index.html`) con sus tres muestras de color.
6. Verificar: `node scripts/validar.mjs`, `npx html-validate@9 index.html`,
   contraste AA del acento sobre el papel y revisión en 390 px y 1280 px.

## Pendientes de esta capa

- [ ] **Fuentes**: hoy solo se usan pilas del sistema. Si se quiere una Mincho
      real (o kanji de sello: 無政府, 平民, 労働), hay que **self-hostear** y
      subsetear (`pyftsubset`) porque la CSP prohíbe fuentes externas. Un
      subconjunto de 4–6 glifos pesa <20 KB.
- [ ] **Portadas reales**: al subir las 31 del WordPress viejo, definir si se
      rehacen con la plantilla de cada estética o se muestran tal cual.
- [ ] **Contraste**: `#b5342a` sobre `#e9e1cd` da ≈4.9:1 (AA justo). No usar el
      bermellón para texto pequeño; reservarlo a sellos, titulares y botones.
- [ ] **Verificación visual**: el selector se probó con Chrome headless (cambio,
      persistencia, `?estetica`, tema noche, ficha y móvil). Falta teclado real
      con lector de pantalla.
- [ ] **Modo noche**: revisar los tres estilos nuevos en dispositivos con
      `prefers-color-scheme` y con el tema forzado.
