# Estética — M.A.R.E.A.

Estética única: **Xilografía**. Dos tintas planas, papel crudo y tinta negra,
con el bermellón reservado al sello y a los acentos. La referencia es la imprenta
de talla: marcos, filetes, título en bloque y sello estampado.

Sin texturas, sin tramas, sin degradados, sin sombras y sin capas translúcidas.
Todo se resuelve con colores planos.

## Tokens

Definidos en `style.css` bajo `:root` (claro) y `:root[data-theme=dark]`:

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#e9e1cd` | `#14130f` | fondo |
| `--bg2` | `#f4eddc` | `#1c1a15` | paneles y tarjetas |
| `--ink` | `#17150f` | `#efe7d4` | texto, filetes y botones |
| `--ink2` | `#4a4437` | `#b6ad97` | texto secundario |
| `--line` | `#c3b795` | `#3f3a2e` | líneas suaves |
| `--acento` | `#b5342a` | `#e0574a` | sello, acentos y CTA |
| `--on-acento` | `#f7f1e3` | `#14130f` | texto sobre bermellón |

Tipografías: pila serif del sistema para titulares (`--display`), serif para el
cuerpo (`--body`), sans para botones (`--sans`) y mono para metadatos (`--mono`).
No hay fuentes externas: la CSP solo permite el propio dominio.

## Logo y sello

El logo es `assets/sello-rojo.png` (500×500, fondo transparente). Se usa como
`<img class="logo">` en cabecera, portada, pie y ficha; el tamaño se controla con
`--s` (`style="--s:64px"`). Las portadas generadas ya no dibujan sello: solo
título y autor.

## Portadas

`portada()` en `app.js` usa la imagen de `catalogo.json` si existe; si no, dibuja
`portadaXilo()`: papel crema `#ede6d4` con retícula de puntos, barra roja
(`#b5342a`) junto al título, título en serif arriba a la izquierda y autor sobre
una barra negra al pie. Solo se muestran título y autor: sin colección, sello,
marcos ni numeración.

La retícula se dibuja con un `<pattern>` SVG con id único por portada; así varias
tarjetas comparten trama sin llenar el DOM de círculos. La portada es arte de
cubierta: los puntos no se usan como fondo de la interfaz.

## Tema claro / oscuro

`data-theme="light|dark"` en `<html>`. Se guarda en `localStorage`
(`marea_tema_v1`) y un script en `<head>` lo aplica antes de pintar para evitar
el destello. El botón de la cabecera alterna y actualiza `<meta name="theme-color">`.

## Reglas de estilo

- Esquinas rectas: sin `border-radius` en paneles, botones ni tarjetas.
- Filetes de 1–2 px; el pie y la cabecera usan trazos más gruesos.
- El bermellón no se usa para párrafos pequeños: solo titulares, sellos, el
  cierre de la portada y botones.
- Nada decorativo que simule papel: ni ruido, ni puntos, ni líneas de fondo en la
  interfaz. La única excepción es la retícula de puntos de las portadas generadas.
