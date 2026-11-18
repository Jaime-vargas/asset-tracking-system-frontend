# Publicación del frontend 0.1.0-beta.1

El frontend se publicará en https://infra.sks.com.mx y consume directamente la API https://assets-control-api.taile7fb37.ts.net.

## Preparar el paquete

Ejecutar npm run build. El script verifica que la primera entrada de src/app/release-notes.json coincide con package.json y agrega la fecha de compilación. El encabezado y About usan la misma versión con identificador de build.

La configuración production obtiene deployment.js de deployment/production. El entorno development obtiene su archivo de public y usa el proxy local.

## Subir a cPanel

1. En Domains, identificar el document root asignado exactamente a infra.sks.com.mx.
2. Guardar una copia de los archivos del frontend anterior, si existen.
3. Subir el ZIP generado a esa carpeta y extraerlo. index.html, deployment.js, ngsw.json y ngsw-worker.js deben quedar directamente en la raíz del subdominio.
4. Abrir https://infra.sks.com.mx y comprobar el certificado HTTPS.
5. Iniciar sesión. La ruta de producción usa hash, por ejemplo /#/login, por lo que la navegación no requiere reglas de reescritura del servidor.
6. Abrir About y comprobar la versión 0.1.0-beta.1, la fecha de build y las release notes.
7. Probar carga y descarga de documentos y fotos, instalar la PWA y verificar un proyecto descargado en modo avión.

El paquete contiene archivos estáticos. El backend y las credenciales de base de datos se administran en la VM.

## Alcance de esta beta

Incluye mantenimiento con checklist y fotos, consulta de proyectos descargados con documentos vigentes y cola de fotos de mantenimiento y reportes de hardware. La sesión persistente, el acceso offline con JWT vencido y la cola de documentos del proyecto siguen pendientes.

El primer login y la descarga inicial necesitan conexión. La prueba de instalación y modo avión en un teléfono queda a cargo de la revisión visual del usuario.
