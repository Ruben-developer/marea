// Base de los PDFs. En local se sirve desde el mismo origen (/pdfs/);
// en producción apunta al servidor de descargas (ver .env.example).
const PDF_BASE = window.MAREA_PDF_BASE || '/pdfs/';
const PLACEHOLDER = 'covers/placeholder.svg';

let catalogo = [];
let filtroActual = 'todos';
let busquedaActual = '';

async function cargarCatalogo() {
    try {
        const response = await fetch('catalogo.json');
        catalogo = await response.json();
        mostrarCatalogo();
    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        document.getElementById('catalogo').innerHTML =
            '<p class="aviso">Error al cargar el catálogo</p>';
    }
}

function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function urlDescarga(item) {
    if (item.archivo) return PDF_BASE + item.archivo;
    return item.enlace || null;
}

function mostrarCatalogo() {
    const contenedor = document.getElementById('catalogo');
    contenedor.innerHTML = '';

    const filtrados = catalogo.filter(item => {
        const cumpleColeccion = filtroActual === 'todos' || item.coleccion === filtroActual;
        const textoBusqueda = normalizarTexto(item.titulo + ' ' + (item.autor || ''));
        const cumpleBusqueda = busquedaActual === '' || textoBusqueda.includes(normalizarTexto(busquedaActual));
        return cumpleColeccion && cumpleBusqueda;
    });

    if (filtrados.length === 0) {
        contenedor.innerHTML = '<p class="aviso">No se encontraron resultados</p>';
        return;
    }

    filtrados.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        const portada = document.createElement('img');
        portada.className = 'portada';
        portada.src = item.portada || PLACEHOLDER;
        portada.alt = item.titulo || 'Sin título';
        portada.loading = 'lazy';
        portada.onerror = function () {
            this.src = PLACEHOLDER;
        };

        const info = document.createElement('div');
        info.className = 'info';

        const titulo = document.createElement('div');
        titulo.className = 'titulo';
        if (!item.titulo || item.titulo.startsWith('Sin título')) {
            titulo.classList.add('sin-titulo');
        }
        titulo.textContent = item.titulo || 'Sin título';

        const autor = document.createElement('div');
        autor.className = 'autor';
        autor.textContent = item.autor || '';

        const descarga = urlDescarga(item);

        info.appendChild(titulo);
        if (item.autor) info.appendChild(autor);

        if (descarga) {
            const enlace = document.createElement('a');
            enlace.className = 'descargar';
            enlace.href = descarga;
            enlace.target = '_blank';
            enlace.rel = 'noopener noreferrer';
            enlace.textContent = 'Descargar';
            info.appendChild(enlace);
        } else {
            const pendiente = document.createElement('span');
            pendiente.className = 'descargar pendiente';
            pendiente.textContent = 'Próximamente';
            info.appendChild(pendiente);
        }

        itemDiv.appendChild(portada);
        itemDiv.appendChild(info);
        contenedor.appendChild(itemDiv);
    });
}

document.getElementById('buscador').addEventListener('input', (e) => {
    busquedaActual = e.target.value;
    mostrarCatalogo();
});

document.getElementById('filtroColeccion').addEventListener('change', (e) => {
    filtroActual = e.target.value;
    mostrarCatalogo();
});

cargarCatalogo();
