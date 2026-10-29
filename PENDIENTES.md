# Pendientes — Tinta Negra

Catálogo digital de cuadernillos y publicaciones (antes "Editorial Gato Negro").
Dominio final: `tintanegra.antarquia.cl`

## Publicar en GitHub Pages (pendiente)

1. Crear repo público `tinta-negra` en github.com (cuenta `Ruben-developer`).
   - El remote ya está configurado en este repo.
2. Subir:
   ```bash
   cd /home/nbk/Repositorios/tinta-negra
   git push -u origin main
   ```
3. Activar Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.
4. URL provisional: `https://ruben-developer.github.io/tinta-negra/`

## Datos del catálogo (pendiente)

- [ ] Completar los 5 títulos sin nombre (`Sin título N (completar)`):
      3 cuadernillos antiguos sin portada + 2 actuales con portadas
      `diapositiva10-1` y `diapositiva11-1`.
- [ ] Correr `python3 descargar_portadas.py` para bajar las portadas a `covers/`
      (mientras no se haga, se cargan desde WordPress como respaldo).
- [ ] Revisar los enlaces `mega.nz/#!...` de 2016–2019: pueden haber caído.

## Después

- [ ] Conectar Cloudflare Pages y dominio `tintanegra.antarquia.cl`.
- [ ] Revisar si el WordPress viejo (`porlaanarquia.wordpress.com/catalogos`)
      se deja con aviso o se paga el "Site Redirect".
