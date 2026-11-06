# Build para cPanel

1. Ejecuta `npm run build` y prepara el contenido de `dist/asset-tracking-system-frontend/browser` para el document root del dominio del piloto.
2. En la copia que vas a publicar, abre `deployment.js` y asigna el origen HTTPS del backend a `ASSETS_CONTROL_BACKEND_ORIGIN`. Ejemplo de valor `https://api.example.com`. Usa solo el origen, sin ruta.
3. En el backend configura `APP_CORS_ALLOWED_ORIGINS` con el origen exacto del frontend, por ejemplo `https://assets.example.com`. Si hay varios orígenes autorizados, sepáralos con comas. Para desarrollo local están incluidos localhost y 127.0.0.1 en el puerto 4201. Si pruebas desde la LAN, configura también el origen de esa dirección.
4. Publica los archivos estáticos. Abre la raíz y comprueba el login, una recarga desde `/#/reports`, la carga de una foto y la descarga de un documento.

Con un backend configurado, Angular usa rutas con hash. Con el valor vacío, conserva las rutas actuales y las llamadas relativas que atiende el proxy local de Angular.
