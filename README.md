# ReclamosApp

ReclamosApp es una aplicación web frontend para simular la gestión de reclamos generales de clientes. No usa backend ni base de datos: los reclamos iniciales se cargan desde un archivo JSON y los nuevos reclamos se mantienen en memoria durante la sesión.

## Funcionalidades

- Carga inicial de reclamos desde `data/reclamos.json` usando `fetch`.
- Alta de nuevos reclamos mediante formulario.
- Generación automática de ID, estado inicial `Abierto` y fecha actual.
- Búsqueda por cliente, email o descripción.
- Filtros por estado y prioridad.
- Cambio de estado con el flujo `Abierto` a `En proceso` a `Cerrado`.
- Estadísticas generales de reclamos.
- Tarjetas responsive con etiquetas visuales para estado y prioridad.
- Notificaciones y confirmaciones visuales con SweetAlert2.

## Tecnologías usadas

- HTML5
- CSS3
- JavaScript vanilla
- JSON
- SweetAlert2

## Cómo ejecutarlo

1. Abrir la carpeta `ReclamosApp` en Visual Studio Code.
2. Instalar la extension Live Server si no esta instalada.
3. Hacer clic derecho sobre `index.html`.
4. Seleccionar `Open with Live Server`.

> Es importante ejecutarlo con Live Server para que `fetch` pueda cargar correctamente el archivo JSON.

## Librería externa utilizada

Se utiliza SweetAlert2 desde CDN para:

-- Mostrar errores de validación.
- Confirmar cambios de estado.
- Notificar cuando un reclamo se crea o se cierra.

## Conceptos de JavaScript aplicados

-- Manipulación dinámica del DOM.
- Eventos de formulario, inputs, selects y botones.
- Carga de datos con `fetch`.
- Arrays de objetos.
- Metodos de arrays: `map`, `filter`, `find`, `reduce` y `sort`.
- Funciones reutilizables.
- Renderizado dinamico de tarjetas y estadisticas.
