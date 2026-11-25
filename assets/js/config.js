/* =========================================================
   M·DATOS — configuración del sitio
   ⚠️  EDITÁ SOLO ESTE ARCHIVO para cambiar los datos de contacto.
   Se aplican automáticamente en toda la página.
   ========================================================= */
window.MD_CONFIG = {

  /* Teléfono de WhatsApp en formato internacional, SIN "+", espacios ni guiones.
     Argentina: 54 + 9 + código de área sin 0 + número sin 15.
     Ej.: (011) 15-5555-5555  →  "5491155555555"                        */
  whatsapp: '5492223431190',

  /* Cómo se muestra el teléfono en pantalla */
  telefonoVisible: '+54 9 2223 43-1190',

  /* Mensaje que aparece ya escrito al abrir WhatsApp */
  whatsappMsg: '¡Hola M·DATOS! Vengo de la web y quiero pedir el diagnóstico gratis.',

  /* Email de contacto */
  email: 'info@mdatos.com.ar',

  /* Destino del formulario. Tres modos:

     - 'whatsapp'  → arma el mensaje con lo que cargó el visitante y abre WhatsApp
                     para que solo tenga que darle enviar. No necesita configurar
                     nada ni depender de ningún servicio. (modo actual)

     - 'mailto'    → abre el cliente de correo del visitante con la consulta escrita.

     - una URL     → se envía por POST en segundo plano (FormSubmit, Formspree,
                     Getform, Basin…). Para recibirlos en la casilla sin backend:
                       1) Poné aquí: 'https://formsubmit.co/ajax/TU-EMAIL@dominio.com'
                       2) Mandá una consulta de prueba y confirmá el mail de activación.
                     Formspree: 'https://formspree.io/f/TU-ID'                     */
  formEndpoint: 'whatsapp'
};
