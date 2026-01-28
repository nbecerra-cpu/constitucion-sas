# Constitución SAS - Due Legal

Plataforma para automatizar la constitución de sociedades SAS en Colombia.

---

## 🚀 PASOS PARA PUBLICAR

### Opción A: Vercel (Recomendada - Gratis)

#### Paso 1: Subir a GitHub
1. Ve a [github.com](https://github.com) y crea un repositorio nuevo llamado `constitucion-sas`
2. Sube todos los archivos de esta carpeta al repositorio

#### Paso 2: Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com) y crea una cuenta (puedes usar tu cuenta de GitHub)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub (`constitucion-sas`)
4. Vercel detectará automáticamente que es Next.js
5. Haz clic en "Deploy"
6. ¡Listo! Tendrás una URL como: `constitucion-sas-xxxxx.vercel.app`

#### Paso 3: Configurar subdominio personalizado
1. En Vercel, ve a Settings → Domains
2. Agrega: `constitucion.due-legal.com`
3. Vercel te dará instrucciones para configurar el DNS

#### Paso 4: Configurar DNS en tu dominio
En el panel donde administras due-legal.com (GoDaddy, Cloudflare, etc.):

```
Tipo: CNAME
Nombre: constitucion
Valor: cname.vercel-dns.com
TTL: 3600
```

Espera 5-10 minutos y tu app estará en: **https://constitucion.due-legal.com**

---

### Opción B: Netlify (También gratis)

1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta `constitucion-sas-app` al área de deploy
3. Configura el dominio personalizado igual que en Vercel

---

## 📝 EMBEBER EN WEBFLOW

### Opción 1: Iframe (Más fácil)

En Webflow, en la página donde quieres mostrar el formulario:

1. Agrega un componente **Embed** (Code Embed)
2. Pega este código:

```html
<iframe 
  src="https://constitucion.due-legal.com" 
  style="width: 100%; height: 900px; border: none; border-radius: 16px;"
  title="Constitución SAS"
></iframe>
```

3. Ajusta el `height` según necesites (900px funciona bien para todo el flujo)

### Opción 2: Enlace directo

Simplemente crea un botón en Webflow que lleve a:
`https://constitucion.due-legal.com`

El diseño ya está hecho para verse bien como página independiente.

---

## 🎨 PERSONALIZACIÓN

### Cambiar colores
En `app/page.js`, busca el objeto `styles` al final del archivo. Los colores principales son:

- **Naranja Due Legal**: `#D85A2D`
- **Azul oscuro**: `#232C54`
- **Fondo**: `#f8f9fc`

### Cambiar precio
Busca `$1.250.000` en el archivo y reemplázalo por el nuevo precio.

### Cambiar textos
Todos los textos están en español en el archivo `app/page.js`.

---

## 📧 BACKEND (Próximo paso)

Actualmente el formulario solo muestra un código de seguimiento simulado. 
Para hacerlo funcional necesitas:

1. **Google Apps Script** (gratis): Recibe los datos y los guarda en Google Sheets
2. **Backend propio**: API en Python/Node.js que genere los documentos

¿Quieres que prepare el backend con Google Apps Script? Es la opción más rápida.

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
constitucion-sas-app/
├── app/
│   ├── layout.js      # Metadata y estructura HTML
│   └── page.js        # Componente principal (toda la lógica)
├── package.json       # Dependencias
├── next.config.js     # Configuración de Next.js
└── README.md          # Este archivo
```

---

## ❓ SOPORTE

Si tienes dudas, puedes:
1. Consultar la [documentación de Vercel](https://vercel.com/docs)
2. Consultar la [documentación de Webflow Embeds](https://university.webflow.com/lesson/custom-code-embed)

