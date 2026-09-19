# M·DATOS — sitio web

Sitio institucional de **M·DATOS**, soluciones digitales para empresas.
HTML, CSS y JavaScript puros: **no necesita npm, ni build, ni servidor**.
Se publica tal cual en GitHub Pages.

---

## 1. Lo primero: cargar tus datos de contacto

Abrí **`assets/js/config.js`** y completá los cinco valores. Es el único archivo
que hay que tocar para poner el sitio en marcha: los datos se aplican solos en el
botón flotante, el formulario, la sección de contacto y el pie de página.

```js
window.MD_CONFIG = {
  whatsapp:        '5491155555555',              // sin +, sin espacios, sin guiones
  telefonoVisible: '+54 9 11 5555-5555',         // cómo se muestra en pantalla
  whatsappMsg:     '¡Hola M·DATOS! ...',         // mensaje que aparece ya escrito
  email:           'hola@mdatos.com.ar',
  formEndpoint:    'mailto'                       // ver punto 3
};
```

> El número de WhatsApp en Argentina va **54 + 9 + código de área sin el 0 +
> número sin el 15**. Ej.: (011) 15-5555-5555 → `5491155555555`.

## 2. Publicar en GitHub Pages

1. En GitHub: **Settings → Pages**.
2. En *Source* elegí **Deploy from a branch**.
3. Branch: la rama donde esté este código, carpeta **`/ (root)`**. Guardá.
4. En un minuto queda online en `https://TU-USUARIO.github.io/M-DATOS/`.

Con dominio propio (`mdatos.com.ar`):

1. Creá un archivo `CNAME` en la raíz con una sola línea: `mdatos.com.ar`.
2. En tu proveedor de dominio apuntá los registros `A` a las IP de GitHub Pages
   (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`) y un `CNAME` de `www`
   a `TU-USUARIO.github.io`.
3. Volvé a Settings → Pages, cargá el dominio y activá **Enforce HTTPS**.

El archivo `.nojekyll` ya está: evita que GitHub procese el sitio con Jekyll.

## 3. Que el formulario te llegue al mail

Por defecto (`formEndpoint: 'mailto'`) el formulario abre el cliente de correo del
visitante con la consulta ya escrita. Funciona siempre y no requiere configurar nada,
pero depende de que la persona tenga un mail configurado.

Para recibirlos directo en tu casilla, sin backend, usá **FormSubmit** (gratis):

1. Poné en `config.js`: `formEndpoint: 'https://formsubmit.co/ajax/TU-EMAIL@dominio.com'`
2. Enviá el formulario una vez desde el sitio publicado.
3. Te llega un mail de FormSubmit: confirmá y listo.

Alternativa: **Formspree** → `'https://formspree.io/f/TU-ID'`.

## 4. Cambiar textos, casos y logos

| Qué | Dónde |
|---|---|
| Todos los textos, servicios, proceso, FAQ | `index.html` |
| Colores, tipografías, espaciados | `assets/css/style.css` (variables al inicio) |
| Casos de éxito | bloque `<!-- CASOS -->` de `index.html` |
| Animación del fondo | `assets/js/scene.js` |
| Logos procesados | `assets/brand/` |
| Logos originales del Drive | `assets/logos/` |

Los **casos** están cargados como referencia del tipo de trabajo. Cuando tengas
proyectos reales, reemplazá título, texto y las dos métricas de cada tarjeta. Para
poner una imagen en vez del fondo geométrico, cambiá el `div.case__media` por un
`<img>` con la captura del proyecto.

## 5. Estructura

```
index.html              Toda la página
404.html                Página de error
site.webmanifest        Ícono e identidad al "instalar" el sitio
robots.txt / sitemap.xml  SEO
assets/
  css/style.css         Estilos
  css/fonts.css         Fuentes autoalojadas (sin pedidos a Google)
  fonts/                Space Grotesk, Inter, JetBrains Mono (.woff2, licencia OFL)
  js/config.js          ← tus datos de contacto
  js/main.js            Menú, reveals, contadores, FAQ, formulario
  js/scene.js           Fondo animado
  brand/                Logos listos para web + íconos + imagen para redes
  logos/                Originales sin tocar
```

## 6. El fondo animado

Un único `<canvas>` encadena tres escenas según cuánto bajaste en la página:

1. **Red de datos** — partículas que arman el isotipo M y se disuelven en una
   constelación al empezar a scrollear. Reacciona al mouse.
2. **Grilla en perspectiva** — con pulsos de luz corriendo hacia el horizonte.
3. **Aurora líquida** — degradados azules en movimiento detrás del contacto.

Está hecho en Canvas 2D, sin librerías, adaptado a la densidad de cada pantalla.
Si el visitante tiene activado *reducir movimiento* en su sistema, se dibuja un
solo cuadro fijo y no se anima nada.

## 7. Probarlo en tu máquina

Alcanza con abrir `index.html` en el navegador. Para que el isotipo se arme con
partículas hace falta un servidor local (el navegador bloquea la lectura de la
imagen desde `file://`):

```bash
python3 -m http.server 8000
# y entrar a http://localhost:8000
```

---

© M·DATOS. Las fuentes se distribuyen bajo SIL Open Font License.
