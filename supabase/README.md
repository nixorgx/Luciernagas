# Gestión de propuestas · Luciérnagas

## Objetivo

Capturar propuestas de donación de libros y útiles, tutorías gratuitas, talleres, alianzas y otras iniciativas. Organizar el seguimiento en una bandeja privada y exportar datos si el equipo lo necesita.

### Estructura

- \`index.html\`: formulario público con tipo de ayuda, contacto, ciudad, descripción y consentimiento.
- \`css/gestion.css\`: estilos de recepción.
- \`js/solicitudes.js\`: validación y envío a Supabase cuando está configurado.
- \`js/backend-config.js\`: URL y clave publicable de Supabase, nunca una clave secreta.
- \`admin/index.html\`: panel de gestión con inicio de sesión.
- \`admin/admin.js\`: autenticación Supabase, permisos de coordinadores, filtros, cambios de estado, notas y exportación CSV.
- \`admin/admin.css\`: diseño del panel.
- \`supabase/schema.sql\`: tablas, restricciones, permisos y políticas RLS.

## Estado real del sistema (noviembre de 2026)

- Proyecto exclusivo de Luciérnagas en el plan Free de Supabase, región São Paulo, separado de Tunari Fire Monitor.
- Base de datos y políticas RLS activadas. Prueba de inserción anónima realizada dentro de una transacción; la prueba no conservó datos.
- Formulario público conectado con clave publicable. Nunca se incluyen claves privadas en la web.
- El acceso a las propuestas depende del usuario autenticado y de los permisos de coordinación.

### Crear el primer acceso administrativo

1. Abre https://nixorgx.github.io/Luciernagas/admin/?crear-acceso=1.
2. Registra el correo titular de la organización de Supabase. Pulsa «Generar contraseña segura», guarda la contraseña en tu gestor personal y crea la cuenta.
3. Confirma el email recibido de Supabase. Si el enlace de confirmación conduce a otro sitio, vuelve manualmente a la web administrativa.
4. Comunica a ChatGPT «Ya registré y confirmé mi cuenta administrativa». Se localizará el usuario en Supabase y se autorizará su UUID en la tabla privada coordinadores.
5. Abre https://nixorgx.github.io/Luciernagas/admin/ e inicia sesión.

**Importante:** crear la cuenta no permite leer solicitudes. La autorización administrativa se aplica por separado, después de verificar el correo. Nunca compartas la contraseña en un chat ni en GitHub.

El servicio gratuito de emails de Supabase tiene límites y normalmente envía mensajes de autenticación únicamente a correos autorizados de la organización. No debe tratarse como servicio masivo de notificaciones.

## Estados de seguimiento

\`nueva\`, \`contactada\`, \`en_coordinacion\`, \`completada\`, \`archivada\`.

## Seguridad y operación

- PostgreSQL con RLS, acceso de lectura solo a usuarios autorizados y escritura pública limitada a nuevos formularios.
- El registro de usuarios está disponible desde la página de administración, pero no concede privilegios. Las cuentas de coordinación se autorizan separadamente después de revisar el correo.
- El panel está bajo \`/admin/\`, pero la protección real es el servidor, no la URL.
- El CSV contiene datos personales; guárdalo de forma segura y elimínalo cuando no sea necesario.
- Deben existir una política de privacidad y un responsable del tratamiento antes de recibir datos reales, especialmente en un proyecto dedicado a niñas y niños.
- Las reglas del formulario, los límites de frecuencia en el navegador y el campo anti-bot **no sustituyen** controles anti-spam del servidor. Para volumen real, conviene añadir Supabase Edge Function + Turnstile y límites de frecuencia.
- Los formularios no solicitan nombres, fotografías ni datos de menores beneficiarios.
- No se ha habilitado ninguna notificación automática por correo; el equipo consulta propuestas desde el panel. Puedes añadir notificaciones privadas mediante un webhook/función con secretos mantenidos en el servidor.

## Pruebas funcionales

- Si se elimina la configuración del backend, el formulario no afirma haber enviado la propuesta. En este despliegue está conectado a Supabase.
- Cuando está configurado, el formulario solicita datos mínimos y confirma éxito solo cuando Supabase devuelve una respuesta exitosa.
- Sin sesión autorizada, no es posible listar propuestas ni editar sus estados.
- Con sesión autorizada, la bandeja muestra un máximo de 500 propuestas recientes, admite búsqueda, clasificación y exportación a CSV.


## Experiencia actualizada

La participación pública se organiza en tres pasos (modalidad, contacto y propuesta). El panel administrativo tiene nueva identidad visual, acceso y registro de cuenta, generador de claves locales mediante Web Crypto, filtros, estadísticas, notas de seguimiento y exportación CSV.
