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
            '<p style="color: #ff0000; text-align: center; grid-column: 1/-1;">Error al cargar el catálogo</p>';
    }
}

function normalizarTexto(texto) {
    if (!texto) return '';
    return texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
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
        contenedor.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #cccccc;">No se encontraron resultados</p>';
        return;
    }
    
    filtrados.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        const portada = document.createElement('img');
        portada.className = 'portada';
        portada.src = item.portada || 'https://porlaanarquia.wordpress.com/wp-content/uploads/2016/01/placeholder.jpg';
        portada.alt = item.titulo || 'Sin título';
        portada.onerror = function() {
            this.src = 'https://porlaanarquia.wordpress.com/wp-content/uploads/2016/01/placeholder.jpg';
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
        
        const descargar = document.createElement('a');
        descargar.className = 'descargar';
        descargar.href = item.enlace;
        descargar.target = '_blank';
        descargar.rel = 'noopener noreferrer';
        descargar.textContent = 'Descargar';
        
        info.appendChild(titulo);
        if (item.autor) info.appendChild(autor);
        info.appendChild(descargar);
        
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
