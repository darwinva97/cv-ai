# 📝 Notas sobre el Comportamiento Inicial del CV

## Cambio Implementado

Se ha modificado el comportamiento de la página de edición de CV para manejar el caso de **CVs nuevos sin versiones previas**.

## Comportamiento

### 🆕 CV Nuevo (Sin Versiones)

Cuando un CV no tiene versiones previas (primera creación):

**Estado inicial:**
- ✅ Modo automático: `create` (edición activa)
- ✅ Campos vacíos y editables desde el inicio
- ❌ NO se muestra el selector de versiones
- ❌ NO se muestran botones "Editar versión" ni "Crear nueva versión"
- ❌ NO se muestra el menú de acciones (tres puntos)
- ❌ NO hay botón "Cancelar" (no hay nada que cancelar)

**Botón visible:**
- Solo "Crear primera versión"

**Flujo:**
1. Usuario completa los campos
2. Click en "Crear primera versión"
3. Se crea la primera versión
4. La página cambia a modo normal con todas las opciones

### 📄 CV Existente (Con Versiones)

Cuando un CV ya tiene una o más versiones:

**Estado inicial:**
- Modo: `none` (visualización)
- Selector de versiones visible
- Botones "Editar versión" y "Crear nueva versión"
- Menú de acciones completo
- Todas las funcionalidades disponibles

## Código Relevante

### Variable de Control

```typescript
const hasVersions = mockResume.versions.length > 0;
```

Esta variable determina todo el comportamiento de la UI.

### Estado Inicial del Modo

```typescript
const [editMode, setEditMode] = useState<EditMode>(
  hasVersions ? "none" : "create"
);
```

- Si hay versiones → modo `none` (normal)
- Si NO hay versiones → modo `create` (edición)

### Campos Iniciales

```typescript
const mockBasics: Basics = {
  name: "",
  label: "",
  email: "",
  phone: "",
  url: "",
  summary: "",
  location: {
    city: "",
    countryCode: "",
    region: "",
  },
  pinnedFields: [],
  aiModifiedFields: [],
};
```

Todos los campos comienzan vacíos para un CV nuevo.

## Pruebas

### Para Probar CV Nuevo

En el archivo `/src/app/(authenticated)/resume/[id]/page.tsx`, cambia:

```typescript
// Línea ~108
const hasVersions = mockResume.versions.length > 0;
```

Por:

```typescript
const hasVersions = mockResumeEmpty.versions.length > 0; // false
```

Y actualiza la referencia:

```typescript
const currentResume = hasVersions ? mockResume : mockResumeEmpty;
```

### Para Probar CV Existente

Usa la configuración por defecto:

```typescript
const hasVersions = mockResume.versions.length > 0; // true
```

## Casos de Prueba

### ✅ Caso 1: Crear Primera Versión

**Setup:** `hasVersions = false`

**Resultado esperado:**
- [x] Página se abre en modo edición
- [x] No hay selector de versiones
- [x] Solo botón "Crear primera versión"
- [x] Campos vacíos y editables
- [x] No hay menú de acciones

### ✅ Caso 2: CV con Versiones Existentes

**Setup:** `hasVersions = true`

**Resultado esperado:**
- [x] Página se abre en modo visualización
- [x] Selector de versiones visible
- [x] Botones "Editar" y "Crear nueva" disponibles
- [x] Menú de acciones visible
- [x] Campos con datos existentes

### ✅ Caso 3: Crear Nueva Versión (desde existente)

**Setup:** `hasVersions = true` → Click "Crear nueva versión"

**Resultado esperado:**
- [x] Entra en modo creación
- [x] Selector de versiones se deshabilita
- [x] Botón "Cancelar creación" visible
- [x] Botón "Crear versión" (no "primera")
- [x] Campos pre-llenados con datos actuales

## Integración con Backend Real

Cuando se integre con el backend, reemplaza la lógica mock:

```typescript
// Actual (mock)
const hasVersions = mockResume.versions.length > 0;
const currentResume = hasVersions ? mockResume : mockResumeEmpty;

// Futuro (real)
const [resume, setResume] = useState<Resume | null>(null);
const [versions, setVersions] = useState<ResumeVersion[]>([]);

useEffect(() => {
  async function loadResume() {
    const resumeData = await getResume(params.id as string);
    const versionsData = await getResumeVersions(params.id as string);
    setResume(resumeData);
    setVersions(versionsData);
  }
  loadResume();
}, [params.id]);

const hasVersions = versions.length > 0;
```

## Archivos Modificados

- `/src/app/(authenticated)/resume/[id]/page.tsx`
  - Añadida variable `hasVersions`
  - Añadido objeto `mockResumeEmpty`
  - Condicionales en selector de versiones
  - Condicionales en botones de acción
  - Condicionales en menú de acciones
  - Texto dinámico en botón crear ("primera versión" vs "versión")

- `/IMPLEMENTACION_VERSIONADO.md`
  - Actualizada sección "Flujo de Trabajo"
  - Añadido "Crear Primera Versión"

- `/NOTAS_CV_NUEVO.md` (este archivo)
  - Documentación del cambio
  - Guía de pruebas

## Consideraciones Futuras

1. **Validación**: Antes de crear la primera versión, validar que al menos los campos básicos estén completos
2. **Guardado automático**: Considerar guardar un draft antes de crear la versión
3. **Tour guiado**: Mostrar un tutorial la primera vez que se crea un CV
4. **Plantillas**: Ofrecer plantillas predefinidas para acelerar la creación

## Estado Actual

✅ Implementación completada  
✅ Sin errores de compilación  
✅ Listo para pruebas  
⏳ Pendiente integración con backend real
