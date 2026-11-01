# Marea

Catálogo digital de Marea, editorial libertaria.

- **Dominio**: marea.antarquia.cl
- **Stack**: HTML + CSS + JavaScript vanilla (sin build, sin dependencias)
- **Contenido**: `catalogo.json` (una ficha por publicación) + `covers/` (portadas)
- **Descargas**: PDFs en el servidor de descargas vía `PDF_BASE` (`/pdfs/` por defecto)

## Colecciones

| Clave | Nombre |
|---|---|
| `historia` | Historia Anarquista |
| `praxis` | Ideas y Praxis |

## Estructura de una ficha

```json
{
  "id": 1,
  "titulo": "Contra los jueces",
  "autor": "Sébastien Faure",
  "coleccion": "praxis",
  "portada": "covers/contra-los-jueces.jpg",
  "descripcion": "",
  "archivo": "marea/contra-los-jueces.pdf",
  "enlace": null
}
```

- `archivo`: ruta relativa dentro del servidor de PDFs. Si existe, manda sobre `enlace`.
- `enlace`: URL externa (Mega, etc.) mientras la publicación no esté rehospedada.
- Si ambos son `null`, la ficha se muestra como «Próximamente».

## Desarrollo local

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. El catálogo se carga por `fetch`, así que hace falta
servirlo por HTTP (abrir `index.html` con `file://` no funciona).

## Añadir contenido

1. Copia la portada a `covers/`.
2. Añade la ficha a `catalogo.json`.
3. Si ya está el PDF, súbelo al servidor y rellena `archivo`.
