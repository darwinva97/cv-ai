# Sistema de Versionado de CV con Control de IA

## Resumen de Implementación

Se ha implementado un sistema completo de versionado de currículums con control granular de edición por IA. El sistema permite crear múltiples versiones de un CV, editar versiones existentes, y controlar qué campos pueden ser modificados por la inteligencia artificial.

## Características Implementadas

### 1. **Sistema de Versiones**

#### Estructura de Versiones
- Las versiones usan el sistema `ltree` de PostgreSQL para jerarquías (ej: `1`, `1.1`, `1.1.1`)
- Cada versión puede basarse en otra versión existente
- Select dropdown para cambiar entre versiones

#### Modos de Edición

**Modo Normal:**
- Visualización de la versión actual
- Botones disponibles:
  - `Editar versión`: Activa el modo de edición
  - `Crear nueva versión`: Activa el modo de creación

**Modo Edición:**
- Todos los campos se vuelven editables con badges de control
- Botones disponibles:
  - `Cancelar edición`: Descarta cambios
  - `Actualizar`: Guarda cambios en la versión actual
- El select de versiones se deshabilita

**Modo Creación:**
- Similar al modo edición pero crea una nueva versión
- Botones disponibles:
  - `Cancelar creación`: Descarta la nueva versión
  - `Crear versión`: Crea una nueva versión basada en la actual

### 2. **Control de IA con Badges**

#### Sistema de Fijado (Pinning)
Cada campo editable tiene dos badges en las esquinas:

**Badge de Fijado (checkeable):**
- **Fijado** (azul con icono de pin): El campo NO puede ser editado por IA
- **No fijado** (gris con icono de pin-off): El campo SÍ puede ser editado por IA
- Solo visible en modo edición
- Se puede togglear haciendo click

**Badge de Modificación por IA (informativo):**
- **"Editado por IA"** (amarillo con icono sparkles): Indica que el campo fue modificado por IA
- Solo informativo, no se puede cambiar manualmente
- Visible siempre que aplique

#### Componente EditableField
```tsx
<EditableField
  label="Nombre completo"
  value={basics.name}
  onChange={(value) => setBasics({ ...basics, name: value })}
  isPinned={isFieldPinned("basics", "name")}
  isAiModified={isFieldAiModified("basics", "name")}
  onPinToggle={() => toggleFieldPin("basics", "name")}
  isEditMode={isEditingMode}
/>
```

### 3. **Pestañas de Navegación**

#### Pestaña "Básicos"
- Información personal (nombre, email, teléfono, etc.)
- Cada campo con sistema de badges de control de IA

#### Pestaña "Experiencia"
- Listado de experiencias laborales
- Cada campo con control de IA

#### Pestaña "Educación"
- Historial académico
- Control de IA por campo

#### Pestaña "Habilidades"
- Skills técnicas y profesionales
- Idiomas
- Control de IA

#### Pestaña "Ajustes"
Configuraciones específicas de la versión:

1. **Nombre de la versión**
   - Campo editable para personalizar el nombre
   - Por defecto usa el número de versión

2. **Visibilidad**
   - CV público (cualquiera con el link puede verlo)
   - Mostrar en comunidad (visible como ejemplo)

3. **Estilo visual**
   - Selector de estilos predefinidos
   - Preview del estilo seleccionado

#### Pestaña "IA"
Control completo de la edición por IA:

1. **Prompt de IA**
   - Campo de texto para instrucciones a la IA
   - Ejemplo: "Enfatiza experiencia en React y habilidades de liderazgo"

2. **Oferta de trabajo (opcional)**
   - Campo para pegar la descripción de la oferta
   - La IA adapta el CV a la oferta

3. **Botón "Generar con IA"**
   - Ejecuta la generación/edición con IA
   - Solo edita campos NO fijados

4. **Lista de Campos Fijables**
   Secciones colapsables organizadas por pestaña:
   - **Información básica** → campos: name, label, email, phone, summary
   - **Experiencia laboral** → por cada trabajo
   - **Educación** → por cada institución
   - **Habilidades** → por cada habilidad
   
   Cada item tiene un Switch sincronizado con los badges de los campos.

### 4. **Botones de Acción**

Disponibles en el menú dropdown (tres puntos):

- **Ver página**: Abre el CV renderizado en nueva pestaña
- **Exportar PDF**: Descarga el CV en formato PDF
- **Compartir**: Opciones para compartir el CV
- **Eliminar CV**: Elimina todo el CV y todas sus versiones

### 5. **Vista Previa**

- Panel lateral colapsable que muestra cómo se ve el CV
- Botón para mostrar/ocultar: "Mostrar/Ocultar vista previa"
- Se actualiza en tiempo real mientras se edita
- Sticky para mantenerla visible al hacer scroll

## Estructura de Base de Datos

### Campos Añadidos a las Tablas

Todas las tablas de entidades del CV ahora incluyen:

```typescript
pinnedFields: string[]        // Campos que NO pueden ser editados por IA
aiModifiedFields: string[]    // Campos que fueron modificados por IA
```

Tablas actualizadas:
- `resumeBasics`
- `resumeProfile`
- `resumeWork`
- `resumeVolunteer`
- `resumeEducation`
- `resumeSkill`
- `resumeProject`

### Tabla resumeVersion

Campos importantes:
- `id`: ltree (jerarquía de versiones)
- `title`: Nombre personalizable
- `basedOn`: ID de la versión padre
- `prompt`: Prompt usado para generar con IA
- `jobOfferText`: Texto de la oferta de trabajo
- `resumeId`: Referencia al CV padre

## Actions de Backend

Nuevas funciones en `/src/actions/resume.ts`:

```typescript
// Gestión de versiones
getResumeVersions(resumeId: string)
getResumeVersion(versionId: string)
createResumeVersion(data: {...})
updateResumeVersion(versionId: string, data: {...})
deleteResumeVersion(versionId: string)
setCurrentVersion(resumeId: string, versionId: string)
```

## Tipos TypeScript

### Interface AIControlFields
```typescript
interface AIControlFields {
  pinnedFields?: string[];
  aiModifiedFields?: string[];
}
```

Todas las interfaces de entidades del CV ahora extienden `AIControlFields`:
- `Basics`
- `Profile`
- `Work`
- `Volunteer`
- `Education`
- `Skill`
- `Project`

## Flujo de Trabajo

### Crear Primera Versión (CV Nuevo)
1. Usuario crea un nuevo CV desde cero
2. La página se abre automáticamente en modo creación
3. NO se muestra el selector de versiones
4. NO se muestran botones "Editar versión" ni "Crear nueva versión"
5. Los campos están en modo edición desde el inicio
6. Solo hay un botón: "Crear primera versión"
7. Usuario completa los campos
8. Usuario hace click en "Crear primera versión"
9. Se crea la primera versión del CV
10. La página cambia a modo normal con todas las opciones disponibles

### Crear Nueva Versión (Desde Versión Existente)
1. Usuario hace click en "Crear nueva versión"
2. La página entra en modo creación
3. El select de versiones se deshabilita
4. Usuario edita los campos deseados
5. Usuario hace click en "Crear versión"
6. Se crea nueva versión basada en la actual
7. Se vuelve al modo normal

### Editar Versión Existente
1. Usuario hace click en "Editar versión"
2. La página entra en modo edición
3. Aparecen badges de control en cada campo
4. Usuario modifica campos y ajusta el estado de fijado
5. Usuario hace click en "Actualizar"
6. Se guardan los cambios
7. Se vuelve al modo normal

### Usar IA para Editar
1. Usuario entra a la pestaña "IA"
2. Configura qué campos están fijados (no editables por IA)
3. Escribe un prompt con instrucciones
4. Opcionalmente pega descripción de oferta de trabajo
5. Hace click en "Generar con IA"
6. La IA solo modifica campos NO fijados
7. Los campos modificados se marcan con badge "Editado por IA"

## Archivos Modificados/Creados

### Nuevos Archivos
- `/src/components/editable-field.tsx` - Componente de campo con badges
- `/src/app/(authenticated)/resume/[id]/page.tsx` - Nueva página de edición
- `/src/app/(authenticated)/resume/[id]/page-old.tsx` - Backup de la página anterior

### Archivos Modificados
- `/src/db/schema/resume.ts` - Añadidos campos de control de IA
- `/src/actions/resume.ts` - Añadidas funciones de versiones
- `/src/types/resume.ts` - Añadidos tipos para control de IA
- `/src/components/index.ts` - Exportación del nuevo componente

## Próximos Pasos

1. **Integración con backend real**
   - Conectar con la base de datos
   - Implementar las queries de versiones
   - Guardar/cargar datos reales

2. **Implementación de generación con IA**
   - Integrar con el servicio de IA
   - Respetar campos fijados
   - Marcar campos modificados

3. **Completar pestañas restantes**
   - Implementar CRUD completo para experiencia laboral
   - Implementar CRUD completo para educación
   - Implementar CRUD completo para habilidades
   - Añadir otras secciones (proyectos, certificados, etc.)

4. **Funcionalidades adicionales**
   - Exportar a PDF
   - Sistema de compartir
   - Preview mejorado con estilos reales
   - Historial de cambios entre versiones

## Notas Técnicas

- El sistema usa `ltree` de PostgreSQL para versiones jerárquicas
- Los badges se muestran solo en modo edición
- La vista previa es sticky y se actualiza en tiempo real
- El estado de fijado está sincronizado entre la pestaña "IA" y los campos individuales
- Se mantiene backward compatibility con datos existentes
