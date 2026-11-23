# Luciérnagas — Luz para su mañana

Landing page estática y responsive para la iniciativa social **Luciérnagas**, en formación en Bolivia.

## Contenido

- Portada editorial con composición orgánica y detalles de luciérnagas.
- Presentación de la misión y tres líneas de acción: recolección de libros/materiales, tutorías gratuitas y talleres extracurriculares.
- Opciones para donar, ser voluntario/a y proponer alianzas.
- Formulario para registrar propuestas de materiales, tutorías, talleres y alianzas, preparado para conectarse de forma segura a Supabase.
- Función de compartir mediante Web Share API o copia al portapapeles.
- Preguntas frecuentes y avisos transparentes sobre la etapa inicial de la iniciativa.
- Animaciones de entrada, navegación móvil accesible y compatibilidad con movimiento reducido.

## Archivos

El proyecto también incluye `admin/` (panel de gestión), `supabase/` (esquema y permisos), `css/gestion.css`, `js/solicitudes.js` y `js/backend-config.js`.

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

La página no gestiona pagos. El formulario de propuestas recopilará datos de contacto **solo después de conectar y configurar Supabase**. Hasta entonces permite copiar una propuesta sin enviarla ni almacenarla.


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


## Sistema de gestión de colaboraciones (conectado a Supabase Free)

La sección «Quiero sumarme» contiene un formulario para personas interesadas en donar materiales, dar tutorías, impartir talleres, crear alianzas u otras colaboraciones. El panel privado está en [`/admin/`](./admin/). Incluye búsqueda, filtros, estados, notas internas y exportación a CSV, con acceso restringido a personas autorizadas mediante Supabase Auth y Row Level Security (RLS).

**Sistema conectado:** la base de datos propia de Luciérnagas está funcionando en Supabase Free, protegida con Row Level Security. El formulario público envía propuestas reales, mientras que el panel privado permite leer y clasificar solicitudes a los coordinadores autorizados.

**Para crear tu acceso**, visita [Crear cuenta de coordinación](https://nixorgx.github.io/Luciernagas/admin/?crear-acceso=1), usa el correo titular de la organización y configura una contraseña personal o genera una segura en tu navegador. Después confirma tu correo y solicita habilitar ese usuario como coordinador. El registro de una cuenta no concede permisos administrativos automáticamente.

El formulario de colaboración tiene tres pasos: tipo de ayuda, información de contacto y descripción de la propuesta. Las contraseñas no se guardan en el repositorio. Consulta [las instrucciones de Supabase](./supabase/README.md) para la gestión del sistema.

Los datos personales requieren un responsable, una política de privacidad y un protocolo de conservación/eliminación antes de aceptar solicitudes reales. Las reglas de RLS protegen lectura y gestión, pero para operaciones a escala se necesita protección anti-spam adicional en servidor.
