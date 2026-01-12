# Guía de Migración y Tareas Pendientes

## Estado Actual

✅ **Completado:**
- Schema de base de datos extendido con campos de control de IA
- Actions de backend para gestión de versiones
- Tipos TypeScript actualizados
- Componente EditableField con badges de control
- Componente EditableListItem genérico para listas
- Página de edición de CV con sistema de versiones
- Pestañas: Básicos, Ajustes, IA (completas)
- Sistema de modos: normal, edición, creación
- Vista previa colapsable
- Botones de acción (estructura)

## Tareas Pendientes

### 1. Migración de Base de Datos

**Prioridad: ALTA**

Crear y ejecutar migraciones para añadir los nuevos campos:

```sql
-- Migración para añadir campos de control de IA

-- Resume Basics
ALTER TABLE resume_basics 
ADD COLUMN pinned_fields JSONB DEFAULT '[]',
ADD COLUMN ai_modified_fields JSONB DEFAULT '[]';

-- Resume Profile
ALTER TABLE resume_profile 
ADD COLUMN pinned_fields JSONB DEFAULT '[]',
ADD COLUMN ai_modified_fields JSONB DEFAULT '[]';

-- Resume Work
ALTER TABLE resume_work 
ADD COLUMN pinned_fields JSONB DEFAULT '[]',
ADD COLUMN ai_modified_fields JSONB DEFAULT '[]';

-- Resume Volunteer
ALTER TABLE resume_volunteer 
ADD COLUMN pinned_fields JSONB DEFAULT '[]',
ADD COLUMN ai_modified_fields JSONB DEFAULT '[]';

-- Resume Education
ALTER TABLE resume_education 
ADD COLUMN pinned_fields JSONB DEFAULT '[]',
ADD COLUMN ai_modified_fields JSONB DEFAULT '[]';

-- Resume Skill
ALTER TABLE resume_skill 
ADD COLUMN pinned_fields JSONB DEFAULT '[]',
ADD COLUMN ai_modified_fields JSONB DEFAULT '[]';

-- Resume Project
ALTER TABLE resume_project 
ADD COLUMN pinned_fields JSONB DEFAULT '[]',
ADD COLUMN ai_modified_fields JSONB DEFAULT '[]';
```

Comandos para crear y ejecutar la migración:

```bash
# Usando drizzle-kit
pnpm drizzle-kit generate:pg

# Revisar el SQL generado en drizzle/

# Aplicar migración
pnpm drizzle-kit push:pg
```

### 2. Completar Pestañas

**Prioridad: ALTA**

#### Pestaña "Experiencia" (Work)

Archivo: `/src/app/(authenticated)/resume/[id]/page.tsx`

```tsx
// Añadir estados
const [work, setWork] = useState<Work[]>([]);

// Añadir funciones helper
const workFields: Field[] = [
  { name: "name", label: "Empresa", type: "text" },
  { name: "position", label: "Puesto", type: "text" },
  { name: "url", label: "Sitio web", type: "url" },
  { name: "startDate", label: "Fecha inicio", type: "text", isDate: true },
  { name: "endDate", label: "Fecha fin", type: "text", isDate: true },
  { name: "summary", label: "Descripción", type: "textarea", rows: 3 },
  { name: "highlights", label: "Logros destacados", type: "text" },
];

// Implementar handlers (ver GUIA_COMPONENTES.md)

// Reemplazar TabsContent
<TabsContent value="work" className="space-y-6">
  <EditableListItem
    title="Experiencia laboral"
    // ... props (ver ejemplo completo en GUIA_COMPONENTES.md)
  />
</TabsContent>
```

#### Pestaña "Educación" (Education)

Similar a Work, con campos:
```tsx
const educationFields: Field[] = [
  { name: "institution", label: "Institución", type: "text" },
  { name: "area", label: "Área de estudio", type: "text" },
  { name: "studyType", label: "Tipo", type: "text", placeholder: "Grado, Máster, etc." },
  { name: "url", label: "Sitio web", type: "url" },
  { name: "startDate", label: "Fecha inicio", type: "text", isDate: true },
  { name: "endDate", label: "Fecha fin", type: "text", isDate: true },
  { name: "score", label: "Nota", type: "text" },
  { name: "courses", label: "Cursos", type: "text" }, // Array
];
```

#### Pestaña "Habilidades" (Skills)

Similar estructura pero con dos secciones: Skills y Languages

```tsx
const skillFields: Field[] = [
  { name: "name", label: "Habilidad", type: "text" },
  { name: "level", label: "Nivel", type: "text" },
  { name: "keywords", label: "Keywords", type: "text" }, // Array
];

const languageFields: Field[] = [
  { name: "language", label: "Idioma", type: "text" },
  { name: "fluency", label: "Nivel", type: "text" },
];
```

### 3. Integración con Backend Real

**Prioridad: ALTA**

#### Cargar datos al inicio

```tsx
// En page.tsx
const params = useParams();
const resumeId = params.id as string;

useEffect(() => {
  async function loadData() {
    try {
      const resume = await getResume(resumeId);
      const versions = await getResumeVersions(resumeId);
      
      // Set current version
      const currentVersion = resume.currentVersionId 
        ? await getResumeVersion(resume.currentVersionId)
        : versions[0];
      
      setCurrentVersionId(currentVersion.id);
      setVersionTitle(currentVersion.title || "");
      
      // Load version data
      // TODO: Implement getResumeVersionData action
      const data = await getResumeVersionData(currentVersion.id);
      setBasics(data.basics);
      setWork(data.work);
      // ... etc
    } catch (error) {
      console.error("Error loading resume:", error);
    }
  }
  
  loadData();
}, [resumeId]);
```

#### Implementar guardado

```tsx
const handleSave = async () => {
  setIsSaving(true);
  try {
    // Update version
    await updateResumeVersion(currentVersionId, {
      title: versionTitle,
      prompt: aiPrompt,
      jobOfferText: jobOffer,
    });
    
    // Update version data
    // TODO: Implement updateResumeVersionData action
    await updateResumeVersionData(currentVersionId, {
      basics,
      work,
      education,
      skills,
      languages,
      // ... etc
    });
    
    setEditMode("none");
    toast.success("Cambios guardados");
  } catch (error) {
    console.error("Error saving:", error);
    toast.error("Error al guardar");
  } finally {
    setIsSaving(false);
  }
};
```

#### Implementar creación de versión

```tsx
const handleCreateVersion = async () => {
  setIsSaving(true);
  try {
    // Create new version
    const newVersion = await createResumeVersion({
      resumeId: resumeId,
      title: versionTitle,
      basedOn: currentVersionId,
      prompt: aiPrompt,
      jobOfferText: jobOffer,
    });
    
    // Copy data from current version
    await copyResumeVersionData(currentVersionId, newVersion.id);
    
    // Update any changes made
    await updateResumeVersionData(newVersion.id, {
      basics,
      work,
      // ... etc
    });
    
    // Set as current
    await setCurrentVersion(resumeId, newVersion.id);
    
    setCurrentVersionId(newVersion.id);
    setEditMode("none");
    toast.success("Nueva versión creada");
  } catch (error) {
    console.error("Error creating version:", error);
    toast.error("Error al crear versión");
  } finally {
    setIsSaving(false);
  }
};
```

### 4. Implementar Generación con IA

**Prioridad: MEDIA**

Archivo: `/src/actions/ai.ts`

```typescript
"use server";

import { db } from "@/db";
import { generateWithAI } from "@/lib/ai";

export async function generateResumeWithAI(params: {
  versionId: string;
  prompt: string;
  jobOffer?: string;
  currentData: ResumeData;
}) {
  // Get pinned fields from database
  const data = await getResumeVersionData(params.versionId);
  
  // Build context for AI
  const context = {
    prompt: params.prompt,
    jobOffer: params.jobOffer,
    currentData: params.currentData,
    pinnedFields: extractPinnedFields(data),
  };
  
  // Call AI service
  const result = await generateWithAI(context);
  
  // Mark AI-modified fields
  const updatedData = markAIModifiedFields(result, params.currentData);
  
  // Save to database
  await updateResumeVersionData(params.versionId, updatedData);
  
  return updatedData;
}

function extractPinnedFields(data: any): Set<string> {
  const pinned = new Set<string>();
  
  // Extract from basics
  if (data.basics?.pinnedFields) {
    data.basics.pinnedFields.forEach((f: string) => pinned.add(`basics.${f}`));
  }
  
  // Extract from work
  data.work?.forEach((w: any, i: number) => {
    w.pinnedFields?.forEach((f: string) => pinned.add(`work.${i}.${f}`));
  });
  
  // ... etc for other sections
  
  return pinned;
}

function markAIModifiedFields(aiResult: any, original: any): any {
  // Compare aiResult with original
  // Mark fields that changed with aiModifiedFields
  // Return updated data with markers
  
  // TODO: Implement deep comparison logic
  return aiResult;
}
```

### 5. Implementar Funcionalidades de Botones

**Prioridad: MEDIA**

#### Exportar PDF

```tsx
const handleExportPDF = async () => {
  try {
    const response = await fetch(`/api/resume/${currentVersionId}/pdf`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mockResume.title}-${versionTitle}.pdf`;
    a.click();
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast.error("Error al exportar PDF");
  }
};
```

#### Compartir

```tsx
const handleShare = async () => {
  const url = `${window.location.origin}/resume-result/${mockResume.slug}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: mockResume.title,
        text: mockResume.description,
        url,
      });
    } catch (error) {
      // User cancelled
    }
  } else {
    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado al portapapeles");
  }
};
```

#### Eliminar CV

```tsx
const handleDeleteResume = async () => {
  try {
    await deleteResume(resumeId);
    router.push("/resumes");
    toast.success("CV eliminado");
  } catch (error) {
    console.error("Error deleting resume:", error);
    toast.error("Error al eliminar CV");
  }
};
```

### 6. Mejorar Vista Previa

**Prioridad: BAJA**

- Integrar con sistema de estilos real
- Renderizar usando el estilo seleccionado
- Actualización en tiempo real más fluida
- Scroll sincronizado con la sección activa

```tsx
// En el panel de preview
<iframe
  src={`/api/resume/${currentVersionId}/preview`}
  className="w-full h-full border-0"
/>
```

### 7. Testing

**Prioridad: MEDIA**

Crear tests para:
- Componentes EditableField y EditableListItem
- Actions de versiones
- Lógica de fijado de campos
- Integración con IA

### 8. Documentación de API

**Prioridad: BAJA**

Documentar endpoints:
- `GET /api/resume/[id]` - Obtener CV
- `GET /api/resume/[id]/versions` - Obtener versiones
- `GET /api/resume/[id]/versions/[versionId]` - Obtener versión específica
- `POST /api/resume/[id]/versions` - Crear versión
- `PUT /api/resume/[id]/versions/[versionId]` - Actualizar versión
- `DELETE /api/resume/[id]/versions/[versionId]` - Eliminar versión
- `POST /api/resume/[id]/versions/[versionId]/generate` - Generar con IA
- `GET /api/resume/[id]/versions/[versionId]/pdf` - Exportar PDF

## Comandos Útiles

```bash
# Iniciar desarrollo
pnpm dev

# Generar migración
pnpm drizzle-kit generate:pg

# Aplicar migración
pnpm drizzle-kit push:pg

# Ver studio de base de datos
pnpm drizzle-kit studio

# Build para producción
pnpm build

# Linter
pnpm lint

# Formatear código
pnpm format
```

## Notas de Implementación

1. **Optimistic Updates**: Considera implementar actualizaciones optimistas para mejor UX
2. **Validación**: Añadir validación de campos antes de guardar
3. **Undo/Redo**: Sistema de historial de cambios (futuro)
4. **Colaboración**: Sistema de comentarios en versiones (futuro)
5. **Templates**: Sistema de plantillas de CV (futuro)

## Recursos Adicionales

- [Documentación de Drizzle ORM](https://orm.drizzle.team/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Shadcn UI](https://ui.shadcn.com/)
- [PostgreSQL ltree](https://www.postgresql.org/docs/current/ltree.html)

## Soporte

Para dudas o problemas:
1. Revisar esta documentación
2. Revisar IMPLEMENTACION_VERSIONADO.md
3. Revisar GUIA_COMPONENTES.md
4. Consultar los archivos de ejemplo en el código
