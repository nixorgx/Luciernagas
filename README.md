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

## Publicar en GitHub Pages

El repositorio incluye el workflow `.github/workflows/deploy.yml` para publicar automáticamente cada cambio a `main`.

1. Repositorio utilizado: `nixorgx/Luci-rnagas`.
2. Sube todo el contenido de este proyecto conservando las carpetas `.github`, `assets`, `css` y `js`. Si usas Git desde la terminal, desde la carpeta del proyecto ejecuta:

   ```bash
   git remote add origin https://github.com/nixorgx/Luci-rnagas.git
   git push -u origin main
   ```

3. En el repositorio, entra a **Settings → Pages → Build and deployment → Source: GitHub Actions**. Esto permite que el workflow ya incluido despliegue el sitio.
4. Revisa la ejecución de **Actions → Publicar Luciérnagas**. La dirección prevista es `https://nixorgx.github.io/Luci-rnagas/` una vez publicada.

Si prefieres no usar GitHub Actions, en **Settings → Pages** selecciona **Deploy from a branch → main → /(root)** para publicar directamente los archivos estáticos.

> La web no dispone todavía de un formulario de registro, canal oficial de contacto, pasarela de donaciones ni base de datos. No anuncia cifras, eventos ni métodos de pago que no estén verificados. El botón «Preparar mi mensaje» permite escribir y copiar un mensaje para los canales que se habiliten.

## Diseño y créditos

**Logotipo:** creación original de Luciérnagas aportada por la persona organizadora. Colores de la marca: verde bosque, crema cálido y ámbar.

**Fotografías ilustrativas:** imágenes de Unsplash mostradas mediante enlaces al CDN de Unsplash, no representan beneficiarios ni actividades reales de Luciérnagas.

- [Estudiantes leyendo en un aula — Yustinus Tjiuwanda](https://unsplash.com/photos/students-reading-textbooks-in-classroom-BCBGahg0MH0)
- [Niño en biblioteca — Arthur Tseng](https://unsplash.com/photos/a-young-child-reads-a-book-in-front-of-bookshelves-Wv4_uJ0zlTw)
- [Niña leyendo — Stephen Andrews](https://unsplash.com/photos/child-reading-book-u0zTce7KNlY)
- [Docente y estudiante — Vitaly Gariev](https://unsplash.com/photos/teacher-helping-young-student-with-math-problems-at-desk-wr2OzAO5fpc)
- [Material escolar — Volodymyr Proskurovskyi](https://unsplash.com/photos/flat-lay-photo-of-school-supplies-ZlPeHjYoAdU)

Las fotografías están disponibles bajo la [licencia de Unsplash](https://unsplash.com/license). Verifica las condiciones aplicables antes de redistribuir los recursos.

## Próximas decisiones recomendadas

Antes de publicar una campaña real, define el correo o canal de contacto oficial, responsable del proyecto, criterios de recepción de materiales, protección de datos y derechos de imagen de participantes. Más adelante se puede integrar un formulario a un backend o servicio propio.
