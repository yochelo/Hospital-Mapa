# Auditoría rápida: código muerto, duplicaciones y archivos innecesarios

> Alcance: relevamiento estático (sin cambiar arquitectura ni flujos).

## 1) Código muerto (candidatos a eliminar)

En `public/app.js` hay símbolos declarados que no se usan en ninguna otra parte del archivo:

- `imageUrl`.
- `startY`.
- `tapStartY`.
- `overlayPB`.
- `destinoLayer`.
- `zonaOrigen`.
- `visorAbierto`.
- `visorEstado`.
- `fotoFocoIndex`.
- `ultimoRecorridoCfg`.
- `PANEL_VISIBLE_PX`.
- `ORDEN_PISOS`.
- `prepararPlanos(...)` (definida pero nunca invocada).
- En `dibujarTramo(...)`, la variable local `puntos` se calcula y luego no participa en ninguna lógica.

Además, `TRACE(...)` está definido pero no tiene llamadas reales en el flujo de la app (solo su propia definición).

## 2) Duplicaciones evitables

### 2.1 Duplicación de entradas en preload

En `precargarRecursos()` (`public/app.js`) aparecen duplicados en el array de imágenes:

- `assets/fotos/Anato.webp` (repetida).
- `assets/fotos/onco.webp` (repetida).

Esto no rompe la app, pero sí agrega trabajo de preload innecesario.

### 2.2 Duplicación de clave en configuración de fotos

En `public/recorrido-config.js` la clave `"Anatomía Patológica"` está duplicada. En objetos JS, la última definición pisa la anterior, por lo que la primera queda efectivamente inútil.

## 3) Archivos innecesarios o inconsistentes (candidatos)

### 3.1 Archivo de sistema operativo dentro del repo

- `SERVER.lnk`: acceso directo de Windows; no aporta al runtime web ni al build.

### 3.2 Recursos aparentemente no referenciados

A partir de búsqueda de referencias por path literal, hay imágenes que no aparecen enlazadas en HTML/CSS/JS/JSON:

- `public/assets/replay.png` (se usa `replay.webp` para el botón).
- `public/assets/fotos/As-F.webp`
- `public/assets/fotos/As-G.webp`
- `public/assets/fotos/Neumo.webp`
- `public/assets/fotos/As-H1.webp`
- `public/assets/fotos/esc-J2.webp`
- `public/assets/fotos/As-C.webp`
- `public/assets/fotos/esc-J1.webp`
- `public/assets/fotos/As-P.webp`

Recomendación: validar funcionalmente antes de borrar, pero como análisis estático son candidatos claros.

### 3.3 Inconsistencias de path/nombre (probable referencia rota)

- Existe `public/assets/fotos/gin-guar.webp` pero en código/config se referencia `assets/fotos/Gin-guar.webp` (diferencia de mayúscula en `G`). En entornos case-sensitive puede fallar.
- `public/manifest.json` apunta a `/icon-192.png` y `/icon-512.png`, pero los archivos presentes están en `public/assets/icon-192.png` y `public/assets/icon-512.png`. Así como está, los iconos PWA no matchean por path.

## 4) Qué eliminar primero (prioridad sugerida)

1. **Bajo riesgo inmediato**: `SERVER.lnk`, `public/assets/replay.png`, variables/constantes no usadas en `app.js`.
2. **Bajo/medio**: duplicados de arrays y clave duplicada en `recorrido-config.js`.
3. **Medio**: imágenes sin referencia detectada (validar con QA rápido).
4. **Antes de borrar, corregir**: inconsistencias de path/casing (`gin-guar`, iconos del `manifest`).

