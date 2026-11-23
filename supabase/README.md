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

## Estado de activación (23 de noviembre de 2026)

1. Crea o selecciona **un proyecto de Supabase dedicado a Luciérnagas**. No uses la base de datos de Tunari Fire Monitor por defecto.
2. Abre **SQL Editor** del proyecto y ejecuta \`supabase/schema.sql\`. Revisa la consulta antes de ejecutarla si el proyecto ya contiene objetos con los mismos nombres.
3. En **Authentication → Users**, crea una cuenta de equipo con correo verificado y contraseña segura.
4. Copia el UUID de esa cuenta y ejecuta el \`INSERT\` comentado al final del archivo SQL para autorizarla en \`private.coordinadores\`.
5. Obtén la **Project URL** y la **publishable key** en Supabase. Coloca esos dos valores en \`js/backend-config.js\`. La clave publicable es segura para el navegador solo porque existen reglas de base de datos adecuadas; nunca escribas \`service_role\` ni una *secret key* en el repositorio.
6. Publica la actualización de GitHub Pages y abre \`/admin/\` con la cuenta autorizada.
7. Prueba con una solicitud ficticia y comprueba en el panel que llegó, y que una sesión no autorizada no puede consultar propuestas ni notas.

**El formulario público ya se ha conectado a Supabase.** El acceso al panel sigue pendiente de habilitar una cuenta administrativa. No se han enviado propuestas reales.

## Estados de seguimiento

\`nueva\`, \`contactada\`, \`en_coordinacion\`, \`completada\`, \`archivada\`.

## Seguridad y operación

- PostgreSQL con RLS, acceso de lectura solo a usuarios autorizados y escritura pública limitada a nuevos formularios.
- No abrir el registro de usuarios del equipo a desconocidos; las cuentas se crean y autorizan de forma manual.
- El panel está bajo \`/admin/\`, pero la protección real es el servidor, no la URL.
- El CSV contiene datos personales; guárdalo de forma segura y elimínalo cuando no sea necesario.
- Deben existir una política de privacidad y un responsable del tratamiento antes de recibir datos reales, especialmente en un proyecto dedicado a niñas y niños.
- Las reglas del formulario, los límites de frecuencia en el navegador y el campo anti-bot **no sustituyen** controles anti-spam del servidor. Para volumen real, conviene añadir Supabase Edge Function + Turnstile y límites de frecuencia.
- Los formularios no solicitan nombres, fotografías ni datos de menores beneficiarios.
- No se ha habilitado ninguna notificación automática por correo; el equipo consulta propuestas desde el panel. Puedes añadir notificaciones privadas mediante un webhook/función con secretos mantenidos en el servidor.

## Pruebas funcionales

- Con el archivo de configuración vacío, el formulario solo copia, sin afirmar que se recibió la propuesta.
- Cuando está configurado, el formulario solicita datos mínimos y confirma éxito solo cuando Supabase devuelve una respuesta exitosa.
- Sin sesión autorizada, no es posible listar propuestas ni editar sus estados.
- Con sesión autorizada, la bandeja muestra un máximo de 500 propuestas recientes, admite búsqueda, clasificación y exportación a CSV.
