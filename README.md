# Luciérnagas — Luz para su mañana

Landing page estática y responsive para la iniciativa social **Luciérnagas**, en formación en Bolivia.

## Contenido

- Portada editorial con composición orgánica y detalles de luciérnagas.
- Presentación de la misión y tres líneas de acción: recolección de libros/materiales, tutorías gratuitas y talleres extracurriculares.
- Opciones para donar, ser voluntario/a y proponer alianzas.
- Preparador de mensajes para expresar interés (funciona sin recolectar datos personales).
- Función de compartir mediante Web Share API o copia al portapapeles.
- Preguntas frecuentes y avisos transparentes sobre la etapa inicial de la iniciativa.
- Animaciones de entrada, navegación móvil accesible y compatibilidad con movimiento reducido.

## Archivos

```
index.html
css/styles.css
js/main.js
assets/logo-original.webp  # logotipo original aprobado, con eslogan
assets/isotipo.webp        # símbolo recortado del logotipo para la interfaz
assets/favicon.webp
```

## Vista local

Abre `index.html` en el navegador. No requiere dependencias, npm ni backend.

Si quieres usar un servidor estático en Windows (con Python instalado):

```bash
python -m http.server 5500
```

Abre `http://localhost:5500`.

## Publicación en GitHub Pages

La web se publica automáticamente con **GitHub Pages desde la rama `main` y su carpeta raíz**. El repositorio es [nixorgx/Luciernagas](https://github.com/nixorgx/Luciernagas) y el sitio es [nixorgx.github.io/Luciernagas/](https://nixorgx.github.io/Luciernagas/).

En **Settings → Pages → Build and deployment**, la opción configurada es **Deploy from a branch**, rama `main`, carpeta `/(root)`. Los cambios se publican cada vez que se actualiza `main`.

La página no gestiona todavía pagos, inscripciones ni datos personales. El botón «Preparar mi mensaje» solamente permite redactar y copiar una intención de colaboración.


## Diseño y créditos

**Logotipo:** creación original de Luciérnagas aportada por la persona organizadora. Colores de la marca: verde bosque, crema cálido y ámbar.

**Fotografías:** fotografías documentales de Bolivia tomadas de Wikimedia Commons, sin relación institucional con Luciérnagas. La sección «Créditos de las fotografías» en la web conserva autorías, enlaces y licencias. Los recortes y la composición se adaptan por CSS a cada tamaño de pantalla.

## Próximas decisiones recomendadas

Antes de publicar una campaña real, define el correo o canal de contacto oficial, responsable del proyecto, criterios de recepción de materiales, protección de datos y derechos de imagen de participantes. Más adelante se puede integrar un formulario a un backend o servicio propio.


## Actualización visual — noviembre de 2026

La barra superior y el menú acompañan el desplazamiento; la navegación resalta la sección visible. Se sustituyeron los caracteres decorativos en forma de asterisco por puntos luminosos animados, con opción de movimiento reducido. Las fotografías son reales y documentales de Bolivia, con créditos visibles al pie de la web y enlaces a sus fichas de licencia. No muestran actividades organizadas por Luciérnagas. Se conserva el modo de revisión con `?review=1`.


## Arquitectura de navegación y fondo (versión 2026)

- `css/experience.css` contiene la cabecera fija premium, estados de desplazamiento, navegación móvil y estilos de accesibilidad.
- `js/experience.js` controla el progreso de lectura, la selección de sección y un motor de luciérnagas dibujado sobre Canvas 2D con varias profundidades, resplandores, estelas y trayectorias curvas. Adaptado conceptualmente del componente de estrellas de Tunari Fire Monitor.
- El fondo reduce su carga en dispositivos modestos y detiene la animación al ocultarse la pestaña, cuando el sistema solicita menos movimiento o al utilizar el botón «Pausar luciérnagas».
- `js/main.js` conserva las funciones originales y el modo de revisión visual `?review=1`.
