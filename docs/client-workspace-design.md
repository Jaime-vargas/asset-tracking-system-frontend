# Interfaz y espacio del cliente

## Dirección visual

La interfaz usa un fondo lavanda, navegación lateral clara, superficies blancas, acento violeta, bordes suaves y sombras discretas. Los colores y controles compartidos están en `src/theme.css`, importado por `src/styles.css`. Las reglas de cada vista permanecen en su archivo CSS.

El contenedor de `App` se adapta al ancho disponible. El menú se despliega en móvil y se oculta en login. Los demás módulos conservan sus funcionalidades y reciben el acabado compartido de los controles y la navegación.

## Clientes

Tarjetas con logo de mayor tamaño, equipos, proyectos y reportes abiertos; búsqueda por nombre, orden y filtro de reportes. Las cifras superiores resumen todos los clientes, independientemente del filtro. Paginación de 12 clientes. En móvil la tarjeta concentra la información en aproximadamente 121 px de alto.

## Espacio del cliente

La cabecera muestra el logo guardado del cliente y usa iniciales cuando no existe o no se puede cargar. Se reutiliza la lista del `ClientStore`; al entrar directamente se carga si aún no está disponible. No se modificó el contrato del backend para añadirlo.

- **Documentos:** entrada principal. Búsqueda y filtros independientes por categoría, sucursal y proyecto. En móvil las filas se presentan como tarjetas compactas y los filtros se despliegan con un botón. Los documentos compartidos con todo el cliente siguen apareciendo al elegir una sucursal.
- **Hardware:** tarjetas con sucursal, modelo, serie y reportes abiertos. Búsqueda y filtro por sucursal; conserva alta y edición de cámaras. Paginación de 8 equipos.
- **Proyectos:** tarjetas de actividades, búsqueda, edición y acceso a sus documentos en la biblioteca. Paginación de 8 proyectos. Se conserva el enlace al detalle existente.

La pestaña se conserva en `?tab=documents|hardware|projects`. El filtro de proyecto se puede compartir con `&project=ID`; al limpiarlo también se actualiza la URL. `ListPagination` emite cambios de página; cada vista mantiene sus filtros y señales.

## Login, formularios y avisos

Login muestra únicamente el formulario centrado, con una versión adaptable en PC y móvil. Conserva el endpoint y el destino originales. Evita solicitudes duplicadas mientras espera y recupera el botón si falla la petición. Los campos permiten autocompletado de usuario y contraseña.

`EditSideBar` conserva su nombre y su interfaz de uso para evitar modificar todos los consumidores, pero ahora presenta el formulario en un modal centrado de NG-Zorro. Su ancho predeterminado sigue siendo 600 px, limitado al espacio disponible. Los formularios largos se desplazan dentro del modal y las columnas dobles pasan a una columna en móvil.

Los modales existentes, confirmaciones, notificaciones y mensajes reciben el tema compartido. Los colores de peligro y severidad conservan su significado.

Los nombres históricos `ClientBranchesPage` y `BranchStore` se mantienen para no mezclar el rediseño con una migración de nombres y rutas; la interfaz se refiere a proyectos.

## Validación

15 pruebas correctas: listado, filtros, edición, reintento, biblioteca, alcance y proyecto de documentos, cámaras y login. Revisión visual con datos de ejemplo aislados en PC y a 320/390 px, incluyendo logo dentro del cliente, menú móvil, formularios, confirmaciones y avisos. La vista temporal no cambia la autenticación ni los datos del sistema.

La compilación de producción finalizó correctamente. Mantiene el aviso previo del tamaño del paquete inicial y muestra avisos de presupuesto de estilos en las tres vistas de clientes (entre 4,04 y 4,91 kB frente al umbral de aviso de 4 kB); no se modificaron los límites para ocultarlos.
