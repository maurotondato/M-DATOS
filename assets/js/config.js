/* =========================================================
   M·DATOS — configuración del sitio
   ⚠️  EDITÁ SOLO ESTE ARCHIVO para cambiar los datos de contacto.
   Se aplican automáticamente en toda la página.
   ========================================================= */
window.MD_CONFIG = {

  /* Teléfono de WhatsApp en formato internacional, SIN "+", espacios ni guiones.
     Argentina: 54 + 9 + código de área sin 0 + número sin 15.
     Ej.: (011) 15-5555-5555  →  "5491155555555"                        */
  whatsapp: '5491100000000',

  /* Cómo se muestra el teléfono en pantalla */
  telefonoVisible: '+54 9 11 0000-0000',

  /* Mensaje que aparece ya escrito al abrir WhatsApp */
  whatsappMsg: '¡Hola M·DATOS! Vengo de la web y quiero pedir el diagnóstico gratis.',

  /* Email de contacto */
  email: 'hola@mdatos.com.ar',

  /* Destino del formulario.
     - 'mailto'   → abre el cliente de correo del visitante (funciona siempre, sin configurar nada)
     - una URL    → se envía por POST (FormSubmit, Formspree, Getform, Basin…)

     Para recibirlos en tu casilla sin backend, la opción más simple es FormSubmit:
       1) Poné aquí:  'https://formsubmit.co/ajax/TU-EMAIL@dominio.com'
       2) Enviá el formulario una vez y confirmá el mail de activación.
     Formspree:  'https://formspree.io/f/TU-ID'                          */
  formEndpoint: 'mailto'
};
