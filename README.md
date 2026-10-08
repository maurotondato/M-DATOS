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
  whatsapp:        '5492223431190',              // sin +, sin espacios, sin guiones
  telefonoVisible: '+54 9 2223 43-1190',         // cómo se muestra en pantalla
  whatsappMsg:     '¡Hola M·DATOS! ...',         // mensaje que aparece ya escrito
  email:           'mdatos.ventas@gmail.com',
  formEndpoint:    'https://formsubmit.co/ajax/mdatos.ventas@gmail.com'
};
```

> Si cambiás el teléfono o el mail, actualizá también el bloque `application/ld+json`
> del final de `index.html` (`telephone` y `email`): eso es lo que lee Google.

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

## 3. Activar el formulario — ⚠️ un paso obligatorio

El formulario ya está apuntado a **mdatos.ventas@gmail.com** vía FormSubmit, pero
**FormSubmit no manda nada hasta que confirmes la casilla una vez**:

1. Publicá el sitio.
2. Entrá y mandá una consulta de prueba desde el formulario.
3. Te llega un mail de FormSubmit a mdatos.ventas@gmail.com: **hacé clic en el
   enlace de activación**.
4. Mandá otra prueba y fijate que te llegue. Recién ahí quedó andando.

Hasta que hagas ese paso, al visitante le dice "¡Listo!" pero la consulta no llega.
Mientras tanto el botón de WhatsApp funciona desde el minuto cero.

Si preferís no depender de un tercero, poné `formEndpoint: 'mailto'` en `config.js`:
el formulario abre el cliente de correo del visitante con la consulta ya escrita.
Alternativa a FormSubmit: **Formspree** → `'https://formspree.io/f/TU-ID'`.

## 4. Cambiar textos, casos y logos

| Qué | Dónde |
|---|---|
| Todos los textos, servicios, proceso, FAQ | `index.html` |
| Colores, tipografías, espaciados | `assets/css/style.css` (variables al inicio) |
| Casos de éxito | bloque `<!-- CASOS -->` de `index.html` |
| Animación del fondo | `assets/js/scene.js` |
| Logos procesados | `assets/brand/` |
| Logos originales del Drive | `assets/logos/` |

Los **casos** son los tres proyectos reales, con capturas de cada sitio en
`assets/casos/`. Para sumar uno nuevo, copiá un bloque `<article class="case">` y
cambiá: la imagen, el `alt`, la etiqueta (`case__tag`), el nombre, el rubro
(`case__kind`), el texto, los dos datos (`case__facts`) y las dos URLs.

Para regenerar una captura: abrí el sitio a 1360×850, sacá una foto de la parte de
arriba, recortala a 16:10 y guardala en `assets/casos/` como JPG de 880×550.

## 5. Estructura

```
index.html              La home (one-pager)
nosotros/index.html     Página Nosotros
contacto/index.html     Página Contacto
privacidad/index.html   Política de privacidad
404.html                Página de error, con índice del sitio
CNAME                   Dominio propio (mdatos.com.ar)
llms.txt                Guía para agentes de IA
robots.txt / sitemap.xml  SEO
site.webmanifest        Ícono e identidad al "instalar" el sitio
assets/
  css/style.css         Estilos
  css/fonts.css         Fuentes autoalojadas (sin pedidos a Google)
  fonts/                Space Grotesk, Inter, JetBrains Mono (.woff2, licencia OFL)
  js/config.js          ← tus datos de contacto
  js/main.js            Menú, reveals, contadores, FAQ, formulario
  js/scene.js           Fondo animado
  brand/                Logos listos para web + íconos + imagen para redes
  casos/                Capturas de los sitios de los casos
  logos/                Originales sin tocar
```

Las tres páginas internas comparten el mismo `style.css`, `config.js` y `main.js`
que la home. No cargan el fondo animado: usan un degradado fijo, que se lee mejor
en textos largos y pesa menos.

## 9. Que las IA te encuentren y te recomienden

Esto es lo que ya está resuelto para que ChatGPT, Perplexity, Claude y los
buscadores entiendan el negocio y puedan recomendarlo:

- **`llms.txt`** — el archivo que leen los agentes de IA. Dice qué hace M·DATOS,
  **cuándo recomendarla**, cuándo no, cómo derivar una consulta y qué páginas
  existen. Si cambian los servicios o las condiciones, actualizalo: es el archivo
  que más influye en cómo te describe una IA.
- **Páginas reales de Nosotros, Contacto y Privacidad.** Los agentes las revisan
  para verificar que el negocio es legítimo antes de recomendarlo. Las tres tienen
  contenido de verdad, no una línea de relleno.
- **Datos estructurados (JSON-LD)** al final de `index.html`: un grafo con
  `Organization` (con `contactPoint` y `address`), `ProfessionalService` (con el
  catálogo de los seis servicios y los horarios) y `WebSite`.
- **404 de verdad.** GitHub Pages devuelve HTTP 404 para cualquier ruta que no
  exista, y la página lista el índice del sitio, el `sitemap.xml` y el `llms.txt`.
  Para comprobarlo una vez publicado:
  `curl -s -o /dev/null -w "%{http_code}" https://mdatos.com.ar/ruta-inventada`
  tiene que imprimir `404`.
- **Sin cookies ni analítica**, lo que hace que la política de privacidad sea
  corta y verificable. Si algún día agregás Google Analytics, hay que actualizar
  `privacidad/index.html` antes de activarlo.

### Lo que conviene completar

| Qué | Dónde | Por qué |
|---|---|---|
| Localidad y calle | `address` en el JSON-LD de `index.html` | Hoy solo dice "Buenos Aires, AR". Una dirección completa ayuda a que te verifiquen y a aparecer en búsquedas locales. |
| Redes sociales | `sameAs` en el JSON-LD (hay que agregarlo) | Confirma la identidad del negocio cruzando perfiles. |
| Ficha de Google Business | Fuera del sitio | Es la señal más fuerte para búsquedas locales. |

> **Nota sobre la cabecera `Vary: Accept`:** aparece en varias auditorías, pero no
> aplica acá. GitHub Pages no permite definir cabeceras HTTP propias y el sitio no
> sirve markdown por negociación de contenido. Si algún día migra a Netlify o
> Cloudflare Pages, se resuelve con un archivo `_headers`.

## 6. El fondo animado

Un único `<canvas>` encadena tres escenas según cuánto bajaste en la página:

1. **Red de datos** — partículas que arman el isotipo M y se disuelven en una
   constelación al empezar a scrollear. Reacciona al mouse.
2. **Grilla en perspectiva** — con pulsos de luz corriendo hacia el horizonte.
3. **Aurora líquida** — degradados azules en movimiento detrás del contacto.

Está hecho en Canvas 2D, sin librerías, adaptado a la densidad de cada pantalla.
Si el visitante tiene activado *reducir movimiento* en su sistema, se dibuja un
solo cuadro fijo y no se anima nada.

## 7. Las animaciones de la página

Además del fondo, hay cuatro animaciones propias. Todas se apagan solas si el
visitante tiene activado *reducir movimiento* en su sistema.

- **Hero**: "Soluciones digitales para empresas" se escribe letra por letra, con
  cursor y un ritmo irregular para que se sienta tecleado. El recuadro ya reserva
  su tamaño final, así que nada se mueve mientras escribe. Para cambiar el texto,
  editá el atributo `data-type` **y** el contenido de `.type__ghost` en `index.html`
  (los dos tienen que decir lo mismo).
- **Íconos de servicios**: cada uno tiene su propia animación en bucle —la ventana
  dibuja sus líneas, el rayo se carga, las barras se mueven como datos en vivo, los
  nodos se pasan información, la chincheta rebota con un radar— y **redes y contenido
  lleva un contador de likes que sube solo**. Se animan únicamente mientras la
  tarjeta está a la vista.
- **Proceso**: la barra celeste de cada paso se carga siguiendo el scroll, uno
  después del otro. El número del paso se enciende cuando le toca.
- **Nosotros**: los cuatro checkpoints se van tildando de a uno a medida que bajás.

Las tres últimas se manejan solas con el orden del HTML: si agregás o sacás una
tarjeta, un paso o un ítem de la lista, el reparto se recalcula sin tocar nada.

## 10. Probarlo en tu máquina

Alcanza con abrir `index.html` en el navegador. Para que el isotipo se arme con
partículas hace falta un servidor local (el navegador bloquea la lectura de la
imagen desde `file://`):

```bash
python3 -m http.server 8000
# y entrar a http://localhost:8000
```

Ese servidor también replica el 404: pedile una ruta que no exista y responde con
el código correcto, igual que GitHub Pages.

---

© M·DATOS. Las fuentes se distribuyen bajo SIL Open Font License.
