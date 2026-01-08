# 🤖 CV AI - Generador Inteligente de CVs

Plataforma moderna para crear, gestionar y personalizar CVs de forma inteligente usando IA. Genera versiones optimizadas de tu CV adaptadas a diferentes ofertas laborales, con múltiples estilos y soporte para múltiples proveedores de IA.

## ✨ Características Principales

### 🎯 Gestión Inteligente de CVs
- **Sistema de Versiones con ltree**: Organización jerárquica de versiones de CVs con trazabilidad completa
- **Versiones Basadas en Ofertas**: Genera CVs personalizados para ofertas laborales específicas
- **Slugs Personalizables**: URLs amigables para compartir tus CVs públicamente
- **Información Versionable**: Administra datos fijos y versionables por separado

### 🤖 Generación con IA
- **Multi-Proveedor**: Soporte para múltiples proveedores de IA:
  - OpenAI, Anthropic, Google (Gemini), Azure OpenAI
  - Mistral, Cohere, DeepSeek, Groq, Perplexity
  - Amazon Bedrock, Cerebras, Together AI, xAI
  - Fireworks AI, DeepInfra, Baseten, Fal, Luma
  - OpenRouter, Portkey
- **Generación Contextual**: Usa prompts, ofertas laborales y CVs base como entrada
- **Configuración Personal**: Cada usuario configura sus propias API keys
- **Análisis de Ofertas**: Extrae información de links de ofertas de trabajo

### 🎨 Sistema de Estilos
- **Estilos Predefinidos**: Minimal, Modern, Classic, Creative, Professional, Tech, Academic
- **Layouts Flexibles**: Single-column, Two-column, Sidebar (left/right)
- **Personalización Total**: Colores, tipografía, espaciado, bordes
- **Vista Previa**: Visualiza tus CVs con diferentes estilos antes de exportar
- **Comunidad**: Comparte y descubre estilos de la comunidad

### 🔐 Autenticación y Seguridad
- **Better Auth**: Autenticación moderna y segura
- **Email/Password**: Autenticación tradicional con email
- **OAuth**: Soporte para GitHub y Google (configurable)
- **Multi-tenant**: Cada usuario gestiona sus propios CVs y configuraciones

### 📊 Dashboard y Analytics
- **Panel de Control**: Vista general de todos tus CVs y versiones
- **Estadísticas**: Total de CVs, versiones, y generaciones con IA
- **Historial**: Seguimiento de todas las versiones y cambios
- **Búsqueda y Filtros**: Encuentra rápidamente tus CVs

## 🏗️ Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Última versión de React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utility-first
- **Radix UI** - Componentes accesibles y sin estilos
- **Shadcn/ui** - Sistema de componentes reutilizables
- **React Hook Form + Zod** - Manejo de formularios con validación
- **Lucide React** - Iconos modernos

### Backend
- **Next.js Server Actions** - API serverless
- **Drizzle ORM** - ORM moderno para TypeScript
- **PostgreSQL** - Base de datos relacional
- **Better Auth** - Sistema de autenticación

### IA
- **Vercel AI SDK** - Framework para integración con múltiples LLMs
- **Soporte Multi-Provider** - 20+ proveedores de IA integrados

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 20+ o superior
- PostgreSQL 14+ o superior
- pnpm (recomendado) o npm
- Cuenta en algún proveedor de IA (OpenAI, Anthropic, etc.)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd cv-ai
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

Edita `.env` con tus credenciales:

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/cv_ai

# Autenticación
BETTER_AUTH_SECRET=tu-secret-key-aqui  # Genera con: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# OAuth (opcional)
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-client-secret
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. **Configurar la base de datos**

Crea la base de datos:
```bash
createdb cv_ai
```

Ejecuta las migraciones:
```bash
pnpm db:push
# O si prefieres usar migraciones
pnpm db:generate
pnpm db:migrate
```

5. **Iniciar el servidor de desarrollo**
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📋 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo

# Producción
pnpm build            # Construye la aplicación
pnpm start            # Inicia servidor de producción

# Base de datos
pnpm db:generate      # Genera migraciones de Drizzle
pnpm db:migrate       # Ejecuta migraciones pendientes
pnpm db:push          # Sincroniza schema directamente (dev)
pnpm db:studio        # Abre Drizzle Studio (GUI)

# Calidad de código
pnpm lint             # Ejecuta ESLint
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### `resume`
CVs principales con información básica

#### `resume_version` (ltree)
Sistema jerárquico de versiones con:
- Prompts de generación
- Ofertas laborales asociadas
- Referencias a CVs base
- Configuración de privacidad
- Slugs personalizables

#### `resume_basics`
Información básica del CV (nombre, email, teléfono, etc.)

#### `resume_*` (work, education, skills, etc.)
Tablas para cada sección del CV siguiendo el schema JSON Resume

#### `ai`
Configuración de proveedores de IA por usuario

#### `style`
Estilos personalizados y de la comunidad

## 🎨 Sistema de Estilos

Cada estilo incluye:
- **Colores**: Primary, secondary, accent, background, text
- **Tipografía**: Fuentes para headers y body, tamaños, pesos
- **Layout**: Tipo de columnas, spacing, márgenes
- **Componentes**: Bordes, sombras, radius

Los usuarios pueden crear estilos privados o compartirlos con la comunidad.

## 🔒 Seguridad

- Variables de entorno para credenciales sensibles
- API keys de IA almacenadas por usuario (no en servidor)
- Autenticación con Better Auth
- Validación con Zod en formularios y server actions
- Protección de rutas con middleware
- Políticas de privacidad por versión de CV

## 🌐 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Agrega PostgreSQL (Vercel Postgres o Neon)
4. Despliega

### Otras Plataformas

La aplicación es compatible con cualquier plataforma que soporte Next.js:
- Railway
- Render
- AWS (Amplify o EC2)
- DigitalOcean
- Fly.io

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Exportación a PDF con diferentes templates
- [ ] Editor WYSIWYG para personalización visual
- [ ] Análisis de ATS (Applicant Tracking Systems)
- [ ] Sugerencias de mejora con IA
- [ ] Integración con LinkedIn
- [ ] Marketplace de templates premium
- [ ] Sistema de puntuación de CVs
- [ ] Modo colaborativo

## 📄 Licencia

Este proyecto está bajo la licencia que especifiques aquí.

## 🙏 Agradecimientos

- [Vercel AI SDK](https://sdk.vercel.ai/) - Framework de IA
- [Better Auth](https://better-auth.com/) - Sistema de autenticación
- [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [JSON Resume](https://jsonresume.org/) - Estándar de CV en JSON

---

Hecho con ❤️ usando Next.js y IA
