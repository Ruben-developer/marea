#!/usr/bin/env python3
import json
import os
import urllib.request

def descargar_portadas():
    with open('catalogo.json', 'r', encoding='utf-8') as f:
        catalogo = json.load(f)
    
    os.makedirs('covers', exist_ok=True)
    
    for item in catalogo:
        if 'portada' in item and item['portada'].startswith('http'):
            try:
                nombre = f"cover_{item['id']}.jpg"
                ruta = os.path.join('covers', nombre)
                if not os.path.exists(ruta):
                    print(f"Descargando {nombre}...")
                    urllib.request.urlretrieve(item['portada'], ruta)
                    item['portada_local'] = f'covers/{nombre}'
                else:
                    item['portada_local'] = f'covers/{nombre}'
            except Exception as e:
                print(f"Error descargando portada {item['id']}: {e}")
    
    with open('catalogo.json', 'w', encoding='utf-8') as f:
        json.dump(catalogo, f, ensure_ascii=False, indent=2)
    
    print("Descarga completada")

if __name__ == '__main__':
    descargar_portadas()
