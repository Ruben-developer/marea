/* =========================================================
   M.A.R.E.A. · Editorial Anarquista
   Estética única: Xilografía. Router, catálogo, carrito y
   modales. Sin dependencias.

   El catálogo vive en catalogo.json. Campos por ficha:
     id, titulo, autor, coleccion, paginas, sinopsis, portada,
     archivo, enlace, precio, stock, destacado
   - id:      opcional; si falta se genera del título (m-titulo)
   - archivo: nombre en el servidor de PDFs (se antepone MAREA_PDF_BASE)
   - enlace:  URL externa de respaldo (p. ej. Mega)
   - Estados: sin PDF = Próximamente; con PDF y precio = en venta;
     con PDF y sin precio = solo digital. El stock 0 deshabilita
     el encargo pero mantiene la descarga.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- constantes ---------- */
  var COLECCIONES = { historia: 'Historia', praxis: 'Praxis' };
  var MICROCOPY_DESCARGA = 'Copia, comparte, reimprime. Se reconoce la autoría, no su propiedad.';
  var LS_CART = 'marea_carrito_v1';
  var LS_THEME = 'marea_tema_v1';
  var CONTACTO = { correo: 'contacto-marea@riseup.net', sitio: 'marea.antarquia.cl' };
  var TITULOS = {
    inicio: 'Inicio',
    catalogo: 'Catálogo',
    historia: 'Colección Historia',
    praxis: 'Colección Praxis',
    difusion: 'Difusión',
    carrito: 'Carrito'
  };

  var ICON_DL = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 20h16"/></svg>';

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // ignora acentos y mayúsculas al buscar
  function norm(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  // genera un id legible cuando la ficha no trae uno (las que se crean desde el CMS)
  function slug(s) {
    return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  // acepta rutas con o sin barra inicial; deja intactas las URL absolutas
  function rutaMedia(v) {
    if (!v) return null;
    var s = String(v).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null; // rechaza javascript:, data:, etc.
    return s.replace(/^\/+/, '');
  }
  function clp(n) {
    if (n == null || isNaN(n)) return '';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  }
  function num(v) {
    if (v === null || v === undefined || v === '') return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- estado ---------- */
  var PUBLICACIONES = [];
  var cargado = false;
  var state = { q: '', col: 'todas', disp: 'todo' };
  var cart = {};
  var ultimoFoco = null;
  var toastT = null;

  function byId(id) {
    for (var i = 0; i < PUBLICACIONES.length; i++) if (PUBLICACIONES[i].id === id) return PUBLICACIONES[i];
    return null;
  }
  function pdfBase() { return window.MAREA_PDF_BASE || 'pdfs/'; }
  // Solo http(s) cuenta como enlace externo: evita javascript:, data: y similares
  // colados desde el CMS en un href.
  function urlExterna(v) {
    if (!v) return null;
    var s = String(v).trim();
    return /^https?:\/\//i.test(s) ? s : null;
  }
  function urlDescarga(p) {
    if (p.archivo) return /^https?:\/\//i.test(p.archivo) ? p.archivo : pdfBase() + p.archivo.replace(/^\/+/, '');
    return urlExterna(p.enlace);
  }
  function hayDescarga(p) { return !!urlDescarga(p); }
  function esExterno(p) { return !p.archivo && !!urlExterna(p.enlace); }
  function hayImpreso(p) { return p.precio != null; }

  /* =========================================================
     DATOS
     ========================================================= */
  function normalizar(p) {
    if (!p || !p.titulo) return null;
    var id = p.id ? String(p.id).trim() : 'm-' + slug(p.titulo);
    if (!id || id === 'm-') return null;
    return {
      id: id,
      titulo: String(p.titulo),
      autor: p.autor ? String(p.autor) : 'Sin autoría',
      coleccion: p.coleccion === 'historia' ? 'historia' : 'praxis',
      paginas: num(p.paginas),
      sinopsis: p.sinopsis ? String(p.sinopsis).trim() : '',
      portada: rutaMedia(p.portada),
      archivo: p.archivo || null,
      enlace: p.enlace || null,
      precio: num(p.precio),
      stock: num(p.stock) || 0,
      destacado: !!p.destacado
    };
  }

  function cargarCatalogo() {
    return fetch('catalogo.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) throw new Error('catalogo.json no es una lista');
        PUBLICACIONES = data.map(normalizar).filter(Boolean);
        cargado = true;
      });
  }

  function errorCatalogo() {
    var msg = '<div class="empty"><h2>No se pudo cargar el catálogo</h2>' +
      '<p>Revisa que <code>catalogo.json</code> exista y que la página se esté sirviendo por HTTP ' +
      '(con <code>python3 -m http.server</code>, por ejemplo). Abrir el archivo con <code>file://</code> bloquea la lectura.</p></div>';
    var g = $('#catalogGrid'); if (g) g.innerHTML = msg;
    var f = $('#featured'); if (f) f.innerHTML = msg;
  }

  /* =========================================================
     PORTADAS
     Sin imagen propia se dibuja un SVG en línea: papel crudo,
     doble marco, título en bloque, barra de acento fija y
     etiqueta negra con el autor al pie. Cero imágenes
     externas, cero peticiones.
     ========================================================= */
  function wrapText(text, max) {
    var out = [], line = '';
    String(text).split(/\s+/).forEach(function (w) {
      if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; }
      else line = (line + ' ' + w).trim();
    });
    if (line) out.push(line);
    return out;
  }

  /* Elige el mayor cuerpo de letra que quepa en el ancho y el alto dados.
     Evita que los títulos largos se salgan de la barra de acento: baja de
     cuerpo y gana líneas antes que recortar el texto. El factor 0.68
     estima el ancho medio de glifo + el letter-spacing. */
  function ajustarTitulo(titulo, maxW, maxH, tamanos) {
    var fs = tamanos[tamanos.length - 1], lines = [], i, k, maxChars, ancho, alto;
    for (i = 0; i < tamanos.length; i++) {
      fs = tamanos[i];
      maxChars = Math.max(6, Math.floor(maxW / (fs * 0.68)));
      lines = wrapText(titulo, maxChars);
      ancho = 0;
      for (k = 0; k < lines.length; k++) ancho = Math.max(ancho, lines[k].length);
      alto = (lines.length - 1) * (fs + 8) + fs * 1.24;
      if (ancho * fs * 0.68 <= maxW && alto <= maxH) return { fs: fs, lines: lines };
    }
    /* Último recurso: cuerpo mínimo, las líneas que quepan y elipsis. */
    maxChars = Math.max(6, Math.floor(maxW / (fs * 0.68)));
    lines = wrapText(titulo, maxChars);
    var cabe = Math.max(1, Math.floor((maxH - fs * 1.24) / (fs + 8)) + 1);
    if (lines.length > cabe) {
      lines = lines.slice(0, cabe);
      lines[cabe - 1] = lines[cabe - 1].slice(0, maxChars - 1).trim() + '…';
    }
    return { fs: fs, lines: lines };
  }

  function portada(p, label) {
    if (p.portada) {
      var alt = label ? 'Portada de ' + p.titulo + ', de ' + p.autor : '';
      return '<img src="' + esc(p.portada) + '" alt="' + esc(alt) + '" loading="lazy" width="300" height="420">';
    }
    return portadaXilo(p, label);
  }

  /* Portada generada en Xilografía: papel crudo, doble marco, título en
     bloque y barra de acento. La colección invierte los dos acentos:
     Praxis = barra bermellón en el título y etiqueta negra en el autor;
     Historia = barra negra en el título y etiqueta bermellón en el autor. */
  var PALETA_PORTADA = { papel: '#ede6d4', tinta: '#17150f', rojo: '#b5342a' };

  function acentoPortada(p) { return p.coleccion === 'historia' ? PALETA_PORTADA.tinta : PALETA_PORTADA.rojo; }

  function etiquetaPortada(p) { return p.coleccion === 'historia' ? PALETA_PORTADA.rojo : PALETA_PORTADA.tinta; }

  function ariaPortada(p, label) {
    if (!label) return 'aria-hidden="true"';
    return 'role="img" aria-label="Portada de ejemplo: ' + esc(p.titulo) + ', de ' + esc(p.autor) + '"';
  }

  function portadaXilo(p, label) {
    var pal = PALETA_PORTADA, ac = acentoPortada(p);
    var aj = ajustarTitulo(p.titulo, 215, 118, [30, 26, 22, 19, 16, 14, 13, 12]);
    var fs = aj.fs, lines = aj.lines, y = 104, salto = fs + 8;
    var txt = lines.map(function (l, k) {
      return '<text x="32" y="' + (y + fs + k * salto) + '" font-family="Georgia,serif" font-size="' + fs +
        '" font-weight="700" letter-spacing="-0.4" fill="' + pal.tinta + '">' + esc(String(l).toUpperCase()) + '</text>';
    }).join('');
    var autor = p.autor.toUpperCase();
    if (autor.length > 30) autor = autor.slice(0, 29).trim() + '…';
    /* Etiqueta al pie centrada: negra en Praxis, bermellón en Historia,
       ancha, con aire a los costados y levantada del marco inferior. */
    return '<svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" ' + ariaPortada(p, label) + '>' +
      '<rect width="300" height="420" fill="' + pal.papel + '"/>' +
      '<rect x="12" y="12" width="276" height="396" fill="none" stroke="' + pal.tinta + '" stroke-width="2"/>' +
      '<rect x="17" y="17" width="266" height="386" fill="none" stroke="' + pal.tinta + '" stroke-width="0.8"/>' +
      /* Barra de acento de alto fijo: el mismo de la portada de título largo. */
      '<rect x="19" y="88" width="7" height="132" fill="' + ac + '"/>' +
      txt +
      '<rect x="32" y="362" width="236" height="26" fill="' + etiquetaPortada(p) + '"/>' +
      '<text x="150" y="379" text-anchor="middle" font-family="Courier New,monospace" font-size="9" letter-spacing="1.6" fill="' + pal.papel + '">' +
      esc(autor) + '</text>' +
      '</svg>';
  }

  /* =========================================================
     CARRITO
     ========================================================= */
  function loadCart() {
    var out = {};
    try {
      var raw = JSON.parse(lsGet(LS_CART) || '{}');
      Object.keys(raw).forEach(function (id) {
        var p = byId(id), n = Math.floor(Number(raw[id]));
        if (p && hayDescarga(p) && p.precio != null && p.stock > 0 && n > 0) out[id] = Math.min(n, p.stock);
      });
    } catch (e) { out = {}; }
    return out;
  }
  function saveCart() { lsSet(LS_CART, JSON.stringify(cart)); updateCartUI(); }
  function cartItems() {
    return Object.keys(cart).map(function (id) { return { p: byId(id), q: cart[id] }; })
      .filter(function (it) { return it.p; });
  }
  function cartCount() {
    return Object.keys(cart).reduce(function (a, id) { return a + cart[id]; }, 0);
  }
  function cartTotal() {
    return cartItems().reduce(function (a, it) { return a + it.p.precio * it.q; }, 0);
  }
  function updateCartUI() {
    var n = cartCount(), c = $('#cartCount'), l = $('#cartLink');
    if (c) c.textContent = n;
    if (l) l.setAttribute('aria-label', 'Carrito, ' + n + (n === 1 ? ' artículo' : ' artículos'));
  }

  function addToCart(id) {
    var p = byId(id);
    if (!p || !hayDescarga(p) || p.precio == null || p.stock <= 0) return;
    var cur = cart[id] || 0;
    if (cur >= p.stock) { toast('Ya tienes todo el stock disponible (' + p.stock + ')'); return; }
    cart[id] = cur + 1;
    saveCart();
    toast('«' + p.titulo + '» añadido al carrito');
    if (!$('[data-view="carrito"]').hidden) renderCart();
  }
  function setQty(id, q) {
    var p = byId(id);
    if (!p) return;
    if (q <= 0) delete cart[id];
    else cart[id] = Math.min(q, p.stock);
    saveCart();
    renderCart();
  }

  /* =========================================================
     TOAST
     ========================================================= */
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    try { t.hidePopover(); t.showPopover(); } catch (e) {}
    clearTimeout(toastT);
    toastT = setTimeout(function () {
      t.classList.remove('show');
      try { t.hidePopover(); } catch (e) {}
    }, 3400);
  }

  /* =========================================================
     TARJETAS
     ========================================================= */
  function metaLinea(p) {
    var partes = [COLECCIONES[p.coleccion]];
    if (p.paginas) partes.push(p.paginas + ' p.');
    return partes.join(' · ');
  }

  /* Tres estados: sin PDF (Próximamente), con PDF y precio (en venta)
     y con PDF sin precio (solo digital). El stock agotado deja el
     título en «Solo digital» y deshabilita solo el encargo. */
  function estadoPublicacion(p) {
    if (!hayDescarga(p)) return 'proximamente';
    if (hayImpreso(p)) return 'venta';
    return 'digital';
  }

  function puedeEncargar(p) {
    return estadoPublicacion(p) === 'venta' && p.stock > 0;
  }

  function estadoTexto(p) {
    var estado = estadoPublicacion(p);
    if (estado === 'proximamente') return 'Próximamente';
    if (estado === 'digital' || p.stock <= 0) return 'Solo digital';
    return 'Impreso ' + clp(p.precio) + ' · quedan ' + p.stock;
  }

  function botonDescarga(p, clase) {
    var url = urlDescarga(p);
    if (!url) {
      return '<button class="btn ' + (clase || '') + '" type="button" disabled>' +
        ICON_DL + ' Descargar PDF</button>';
    }
    var ext = esExterno(p);
    return '<a class="btn btn-solid ' + (clase || '') + '" href="' + esc(url) + '"' +
      (ext ? ' target="_blank" rel="noopener"' : ' download') +
      ' data-action="download" aria-label="Descargar PDF de ' + esc(p.titulo) + '">' +
      ICON_DL + ' ' + (ext ? 'Descargar (externo)' : 'Descargar PDF') + '</a>';
  }

  function botonCompra(p, clase) {
    var puede = puedeEncargar(p);
    var motivo = estadoPublicacion(p) === 'proximamente'
      ? 'Todavía no está disponible'
      : (estadoPublicacion(p) === 'digital' ? 'Sin edición impresa por ahora' : 'Sin stock por ahora');
    return '<button class="btn ' + (clase || '') + '" type="button" data-action="add" data-id="' + esc(p.id) +
      '" aria-label="Encargar impreso de ' + esc(p.titulo) + '"' +
      (puede ? '' : ' disabled title="' + motivo + '"') + '>Encargar</button>';
  }

  function cardHTML(p) {
    var tiene = hayDescarga(p);
    var nota;
    if (!tiene) nota = '<p class="note">Todavía no hay PDF ni edición impresa. Vuelve pronto.</p>';
    else nota = '<p class="micro">' + MICROCOPY_DESCARGA + '</p>';

    return '<article class="card">' +
      '<button class="cover-btn" type="button" data-action="open" data-id="' + esc(p.id) + '" aria-label="Ver ficha de ' + esc(p.titulo) + '">' + portada(p) + '</button>' +
      '<div class="card-body">' +
      '<p class="meta">' + esc(metaLinea(p)) + '</p>' +
      '<h3><button type="button" data-action="open" data-id="' + esc(p.id) + '">' + esc(p.titulo) + '</button></h3>' +
      '<p class="autor">' + esc(p.autor) + '</p>' +
      '<p class="price">' + esc(estadoTexto(p)) + '</p>' +
      '<div class="actions">' + botonCompra(p, 'btn-sm') + botonDescarga(p, 'btn-sm') + '</div>' +
      nota +
      '</div></article>';
  }

  /* =========================================================
     CATÁLOGO
     ========================================================= */
  function filtrar() {
    var q = norm(state.q).trim();
    var out = PUBLICACIONES.filter(function (p) {
      if (state.col !== 'todas' && p.coleccion !== state.col) return false;
      if (state.disp === 'descarga' && !hayDescarga(p)) return false;
      if (state.disp === 'proximamente' && hayDescarga(p)) return false;
      if (q && norm(p.titulo + ' ' + p.autor + ' ' + p.sinopsis + ' ' + COLECCIONES[p.coleccion]).indexOf(q) === -1) return false;
      return true;
    });
    var porTitulo = function (a, b) { return a.titulo.localeCompare(b.titulo, 'es'); };
    return out.sort(porTitulo);
  }

  function renderCatalog() {
    if (!cargado) return;
    var res = filtrar(), total = PUBLICACIONES.length;
    var rc = $('#resultCount');
    if (rc) rc.textContent = 'Mostrando ' + res.length + ' de ' + total + (total === 1 ? ' publicación' : ' publicaciones');
    var g = $('#catalogGrid');
    if (!g) return;

    if (!res.length) {
      var activos = [];
      if (state.q.trim()) activos.push('búsqueda «' + esc(state.q.trim()) + '»');
      if (state.col !== 'todas') activos.push('colección ' + COLECCIONES[state.col]);
      if (state.disp === 'descarga') activos.push('solo con descarga');
      if (state.disp === 'proximamente') activos.push('solo próximamente');
      var extra = state.disp === 'descarga'
        ? ' Todavía estamos subiendo los PDF: por ahora solo hay un título descargable.'
        : '';
      g.innerHTML = '<div class="empty"><h2>Nada coincide con eso</h2>' +
        '<p>Filtros activos: ' + (activos.join(' · ') || 'ninguno') + '.' + extra +
        ' La búsqueda ya ignora tildes y mayúsculas; prueba con menos palabras o quita algún filtro.</p>' +
        '<button class="btn btn-solid" type="button" data-action="clearfilters">Limpiar filtros</button></div>';
    } else {
      g.innerHTML = '<div class="grid">' + res.map(cardHTML).join('') + '</div>';
    }
  }

  function syncControls() {
    $$('#segCol button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.col === state.col)); });
    $$('#segDisp button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.disp === state.disp)); });
    if ($('#q')) $('#q').value = state.q;
    if ($('#h-catalogo')) $('#h-catalogo').textContent = state.col === 'todas' ? 'Catálogo' : 'Colección ' + COLECCIONES[state.col];
  }

  function renderFeatured() {
    if (!cargado) return;
    var f = $('#featured');
    if (!f) return;
    var destacados = PUBLICACIONES.filter(function (p) { return p.destacado; });
    if (!destacados.length) destacados = PUBLICACIONES.slice(0, 4);
    f.innerHTML = destacados.map(cardHTML).join('');
  }

  /* =========================================================
     CARRITO · vista
     ========================================================= */
  function renderCart() {
    var b = $('#cartBody');
    if (!b) return;
    var items = cartItems();
    if (!items.length) {
      b.innerHTML = '<div class="empty"><h2>Tu carrito está vacío</h2>' +
        '<p>No hace falta comprar nada para leer: todos los PDF disponibles se descargan libres. Si quieres sostener el proyecto, elige un impreso.</p>' +
        '<p><a class="btn btn-solid" href="/catalogo">Ver catálogo</a> <a class="btn" href="/catalogo/descarga">Descargar gratis</a></p></div>';
      return;
    }
    b.innerHTML = items.map(function (it) {
      var p = it.p, q = it.q;
      return '<div class="cart-row">' +
        portada(p) +
        '<div><h3>' + esc(p.titulo) + '</h3><p class="autor" style="margin:0">' + esc(p.autor) + ' · impreso</p></div>' +
        '<div class="line-total">' + clp(p.precio * q) + '</div>' +
        '<div class="cart-tools">' +
        '<div class="qty" role="group" aria-label="Cantidad de ' + esc(p.titulo) + '">' +
        '<button type="button" data-action="dec" data-id="' + esc(p.id) + '" aria-label="Quitar una unidad">−</button>' +
        '<output aria-live="polite">' + q + '</output>' +
        '<button type="button" data-action="inc" data-id="' + esc(p.id) + '" aria-label="Añadir una unidad"' + (q >= p.stock ? ' disabled' : '') + '>+</button>' +
        '</div>' +
        '<button class="linklike" type="button" data-action="remove" data-id="' + esc(p.id) + '" aria-label="Quitar ' + esc(p.titulo) + ' del carrito">Quitar</button>' +
        (hayDescarga(p) ? '<a class="linklike" href="' + esc(urlDescarga(p)) + '" data-action="download">o descarga el PDF libre</a>' : '') +
        '</div></div>';
    }).join('') +
      '<div class="subtotal"><span>Subtotal</span><span>' + clp(cartTotal()) + '</span></div>' +
      '<p class="note">Envío no incluido. Tu aporte financia impresión y reimpresión; el contenido no se vende.</p>' +
      '<div class="cta-row" style="margin-top:18px">' +
      '<button class="btn btn-solid" type="button" data-action="checkout">Armar pedido</button>' +
      '<a class="btn" href="/catalogo">Seguir mirando</a>' +
      '</div>';
  }

  /* =========================================================
     MODALES
     <dialog>.showModal() aporta foco atrapado, Escape y fondo inerte.
     ========================================================= */
  function openDialog(dlg) {
    ultimoFoco = document.activeElement;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeDialog(dlg) {
    if (!dlg) return;
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
  }
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) closeDialog(d); });
    d.addEventListener('close', function () {
      if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
    });
  });

  function openFicha(id) {
    var p = byId(id);
    if (!p) return;
    var tiene = hayDescarga(p), stock = p.stock > 0, estado = estadoPublicacion(p);
    var consulta = 'mailto:' + CONTACTO.correo + '?subject=' + encodeURIComponent('Consulta: ' + p.titulo);

    var datos = '<dt>Colección</dt><dd>' + COLECCIONES[p.coleccion] + '</dd>';
    if (p.paginas) datos += '<dt>Páginas</dt><dd>' + p.paginas + '</dd>';
    if (estado === 'venta') {
      datos += '<dt>Impreso</dt><dd>' +
        (stock ? clp(p.precio) + ' · ' + p.stock + ' en stock' : 'Agotado · solo digital') + '</dd>';
    }

    /* Los botones van antes de la sinopsis: descarga siempre, encargo
       cuando hay impreso (deshabilitado si todavía no o no hay stock). */
    var acciones = botonDescarga(p) + botonCompra(p);
    var notaAcciones = tiene
      ? '<p class="micro">' + MICROCOPY_DESCARGA + '</p>'
      : '<p class="note">Este texto todavía no tiene archivo. Cuando exista, será libre y sin registro.</p>';

    var apoyo;
    if (estado === 'proximamente') {
      apoyo = '<p class="note" style="margin-top:0">Todavía no hay PDF ni edición impresa. ' +
        'Si quieres que te avisemos cuando esté, <a class="linklike" href="' + esc(consulta) + '">escríbenos</a>.</p>';
    } else if (estado === 'digital') {
      apoyo = '<p class="note" style="margin-top:0">Por ahora este título circula solo en digital. ' +
        'Si quieres una edición impresa, <a class="linklike" href="' + esc(consulta) + '">escríbenos</a>.</p>';
    } else if (stock) {
      apoyo = '<p class="note" style="margin-top:0">Impreso: ' + clp(p.precio) + ' · quedan ' + p.stock +
        '. Tu compra financia papel y tinta; no es el precio del texto.</p>';
    } else {
      apoyo = '<p class="note" style="margin-top:0">Impreso agotado por ahora. Mientras tanto, el PDF sigue libre.</p>';
    }

    $('#fichaBody').innerHTML =
      '<div class="dlg-head">' +
      '<p class="meta" style="margin:0">' + esc(metaLinea(p)) + '</p>' +
      '<button class="close-btn" type="button" data-action="close" aria-label="Cerrar ficha">✕</button>' +
      '</div>' +
      '<div class="ficha">' +
      '<div class="cover-col">' + portada(p, true) + '</div>' +
      '<div class="ficha-info">' +
      '<h2 id="fichaTitulo">' + esc(p.titulo) + '</h2>' +
      '<p class="autor" style="font-size:1.1rem;margin-top:.4em">' + esc(p.autor) + '</p>' +
      '<dl class="datos">' + datos + '</dl>' +
      '<div class="ficha-acciones">' + acciones + '</div>' + notaAcciones +
      (p.sinopsis ? '<p class="sinopsis">' + esc(p.sinopsis) + '</p>' : '<p class="sinopsis vacio">Sin sinopsis todavía.</p>') +
      '<div class="block"><h3>Apoya el proyecto</h3>' + apoyo + '</div>' +
      '<div class="contra"><img class="logo" src="assets/sello-rojo.png" alt="" width="500" height="500" aria-hidden="true">' +
      '<span>' + CONTACTO.correo + '<br>' + CONTACTO.sitio + '</span></div>' +
      '</div></div>';

    openDialog($('#dlgFicha'));
  }

  function openCheckout() {
    var items = cartItems();
    if (!items.length) return;

    var lineas = items.map(function (it) {
      return '- ' + it.q + ' × ' + it.p.titulo + ' — ' + it.p.autor + ' — ' + clp(it.p.precio * it.q);
    });
    var cuerpo = ['Hola:', '', 'Quiero encargar estos impresos de M.A.R.E.A.:', '']
      .concat(lineas)
      .concat(['', 'Subtotal: ' + clp(cartTotal()), '', 'Mi nombre:', 'Dirección o punto de entrega:', 'Comuna / ciudad:', '', 'Gracias.'])
      .join('\n');
    var mailto = 'mailto:' + CONTACTO.correo +
      '?subject=' + encodeURIComponent('Pedido de impresos · M.A.R.E.A.') +
      '&body=' + encodeURIComponent(cuerpo);

    $('#checkoutBody').innerHTML =
      '<div class="dlg-head">' +
      '<h2 id="checkoutTitulo" style="font-size:1.6rem">Resumen del pedido</h2>' +
      '<button class="close-btn" type="button" data-action="close" aria-label="Cerrar resumen">✕</button>' +
      '</div>' +
      '<div class="block libre" role="note"><h3>Cómo funciona</h3>' +
      '<p class="note" style="margin:0;font-size:.95rem">No hay pago en línea ni datos guardados en el sitio. ' +
      'El resumen se envía por correo y la editorial acuerda contigo el pago y la entrega.</p></div>' +
      '<ul style="list-style:none;padding:0;margin:18px 0">' +
      items.map(function (it) {
        return '<li style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--line)">' +
          '<span>' + it.q + ' × ' + esc(it.p.titulo) + '</span><span>' + clp(it.p.precio * it.q) + '</span></li>';
      }).join('') +
      '</ul>' +
      '<div class="subtotal"><span>Subtotal</span><span>' + clp(cartTotal()) + '</span></div>' +
      '<p class="note">Gracias por sostener la imprenta. Los PDF siguen libres, hayas comprado o no.</p>' +
      '<div class="cta-row" style="margin-top:14px">' +
      '<a class="btn btn-solid" href="' + esc(mailto) + '">Enviar pedido por correo</a>' +
      '<button class="btn" type="button" data-action="clear">Vaciar carrito</button>' +
      '</div>';

    openDialog($('#dlgCheckout'));
  }

  /* =========================================================
     EVENTOS
     ========================================================= */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t || t.disabled) return;
    var action = t.dataset.action, id = t.dataset.id;
    switch (action) {
      case 'open': openFicha(id); break;
      case 'add': addToCart(id); break;
      case 'download': {
        var p = byId(id);
        if (p) toast('Descargando «' + p.titulo + '». Sin registro.');
        break; // deja que el navegador siga el enlace
      }
      case 'inc': setQty(id, (cart[id] || 0) + 1); break;
      case 'dec': setQty(id, (cart[id] || 0) - 1); break;
      case 'remove': setQty(id, 0); break;
      case 'checkout': openCheckout(); break;
      case 'clear':
        cart = {}; saveCart(); renderCart();
        closeDialog($('#dlgCheckout')); toast('Carrito vaciado'); break;
      case 'close': closeDialog(t.closest('dialog')); break;
      case 'clearfilters':
        state.q = ''; state.col = 'todas'; state.disp = 'todo';
        syncControls(); renderCatalog(); break;
    }
  });

  if ($('#q')) $('#q').addEventListener('input', function (e) { state.q = e.target.value; renderCatalog(); });
  if ($('#segCol')) $('#segCol').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.col = b.dataset.col; syncControls(); renderCatalog();
  });
  if ($('#segDisp')) $('#segDisp').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    state.disp = b.dataset.disp; syncControls(); renderCatalog();
  });

  /* ---------- tema ---------- */
  function aplicarColorBarra() {
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) return;
    m.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#14130f' : '#e9e1cd');
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    var claro = t === 'light';
    var b = $('#themeBtn');
    if (b) {
      b.textContent = claro ? 'Modo noche' : 'Modo papel';
      b.setAttribute('aria-pressed', String(claro));
    }
    lsSet(LS_THEME, t);
    aplicarColorBarra();
  }
  if ($('#themeBtn')) $('#themeBtn').addEventListener('click', function () {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  });
  aplicarColorBarra();

  /* =========================================================
     ROUTER (rutas reales, sin recargar)
     /inicio  /catalogo[/descarga]  /historia  /praxis  /difusion  /carrito
     En el respaldo de GitHub Pages se usa hash (#/catalogo): allí no hay
     rewrites y cualquier ruta real devolvería 404.
     ========================================================= */
  var primeraCarga = true;
  var ES_PAGES = /\.github\.io$/i.test(location.hostname);
  var BASE = ES_PAGES ? '/marea/' : '/';

  function hrefDe(ruta) {
    var limpia = String(ruta || 'inicio').replace(/^\/+/, '');
    return ES_PAGES ? '#/' + limpia : BASE + limpia;
  }

  function rutaActual() {
    var ruta;
    if (ES_PAGES) {
      ruta = location.hash.replace(/^#\/?/, '');
    } else {
      ruta = location.pathname;
      if (BASE !== '/' && ruta.indexOf(BASE) === 0) ruta = ruta.slice(BASE.length);
      ruta = ruta.replace(/^\/+/, '');
    }
    return ruta;
  }

  function irA(ruta) {
    var href = hrefDe(ruta);
    var actual = ES_PAGES ? (location.hash || '#/inicio') : (location.pathname + location.search);
    if (actual === href) { route(); return; }
    if (ES_PAGES) location.hash = href;
    else history.pushState(null, '', href);
    route();
  }

  function route() {
    if (!cargado) return;
    var trozos = (rutaActual() || 'inicio').split('/');
    var n0 = trozos[0], param = trozos[1];
    var name = TITULOS[n0] ? n0 : 'inicio';
    var vista = name;
    // Ruta desconocida: se muestra el inicio y se corrige la URL.
    if (!ES_PAGES && n0 !== 'inicio' && !TITULOS[n0]) history.replaceState(null, '', hrefDe('inicio'));

    if (name === 'historia' || name === 'praxis') { state.col = name; vista = 'catalogo'; }
    else if (name === 'catalogo') { state.col = 'todas'; state.disp = param === 'descarga' ? 'descarga' : 'todo'; }

    $$('dialog[open]').forEach(closeDialog);
    $$('.view').forEach(function (v) { v.hidden = v.dataset.view !== vista; });
    $$('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    if (vista === 'catalogo') { syncControls(); renderCatalog(); }
    if (vista === 'carrito') renderCart();

    document.title = TITULOS[name] + ' · M.A.R.E.A. Editorial Anarquista';
    window.scrollTo(0, 0);
    if (!primeraCarga) {
      var h = $('[data-view="' + vista + '"] h1');
      if (h) h.focus({ preventScroll: true });
    }
    primeraCarga = false;
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var href = a.getAttribute('href') || '';
    if (/^(mailto:|tel:|https?:|\/\/)/i.test(href)) return;
    var ruta = null;
    if (href.indexOf('#/') === 0) ruta = href.slice(2);
    else if (href.charAt(0) === '/' && href.indexOf('//') !== 0) ruta = href.slice(1);
    if (!ruta) return;
    e.preventDefault();
    irA(ruta);
  });
  window.addEventListener('popstate', route);
  window.addEventListener('hashchange', route);

  // Enlaces antiguos con hash en el dominio propio: se canonizan a ruta real.
  if (!ES_PAGES && /^#\/?/.test(location.hash)) {
    var rutaLegada = location.hash.replace(/^#\/?/, '');
    if (rutaLegada) history.replaceState(null, '', hrefDe(rutaLegada));
  }
  // La raíz se normaliza a /inicio.
  if (!ES_PAGES && !rutaActual()) history.replaceState(null, '', hrefDe('inicio'));

  /* =========================================================
     ARRANQUE
     ========================================================= */
  setTheme(lsGet(LS_THEME) || 'light');
  updateCartUI();

  cargarCatalogo()
    .then(function () {
      cart = loadCart();
      updateCartUI();
      renderFeatured();
      route();
    })
    .catch(function (err) {
      if (window.console) console.error('Marea: no se pudo cargar catalogo.json', err);
      errorCatalogo();
    });
})();
