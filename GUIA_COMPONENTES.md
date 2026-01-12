# Guía de Uso de Componentes

## EditableField

Componente para campos individuales con control de IA.

### Props

```typescript
interface EditableFieldProps {
  label: string;                    // Etiqueta del campo
  value: string;                    // Valor actual
  onChange?: (value: string) => void; // Callback al cambiar
  type?: "text" | "textarea" | "email" | "tel" | "url"; // Tipo de input
  placeholder?: string;              // Placeholder
  disabled?: boolean;                // Si está deshabilitado
  isPinned?: boolean;                // Si está fijado (no editable por IA)
  isAiModified?: boolean;            // Si fue modificado por IA
  onPinToggle?: () => void;          // Callback al cambiar estado de fijado
  isEditMode?: boolean;              // Si está en modo edición
  rows?: number;                     // Número de filas para textarea
}
```

### Ejemplo de uso

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

## EditableListItem

Componente genérico para listas de elementos con control de IA (experiencia laboral, educación, etc.).

### Props

```typescript
interface EditableListItemProps<T> {
  title: string;                     // Título de la sección
  description?: string;              // Descripción de la sección
  items: T[];                        // Array de items
  fields: Field[];                   // Definición de campos
  onAdd: () => void;                 // Callback al añadir item
  onDelete: (index: number) => void; // Callback al eliminar item
  onChange: (index: number, field: string, value: any) => void; // Callback al cambiar campo
  isEditMode?: boolean;              // Si está en modo edición
  section: string;                   // Nombre de la sección
  getFieldValue: (item: T, field: string) => any; // Obtener valor de campo
  isPinned: (section: string, itemId: string, field: string) => boolean; // Verificar si está fijado
  isAiModified: (section: string, itemId: string, field: string) => boolean; // Verificar si fue modificado por IA
  onPinToggle: (section: string, itemId: string, field: string) => void; // Toggle de fijado
  getItemId: (item: T) => string;    // Obtener ID del item
  getItemTitle: (item: T) => string; // Obtener título del item para el card
  getItemDescription?: (item: T) => string; // Obtener descripción del item
  emptyMessage?: string;             // Mensaje cuando no hay items
}

interface Field {
  name: string;      // Nombre del campo en el objeto
  label: string;     // Etiqueta visible
  type?: "text" | "textarea" | "email" | "tel" | "url";
  placeholder?: string;
  rows?: number;     // Para textarea
  isDate?: boolean;  // Si es un campo de fecha
}
```

### Ejemplo completo: Experiencia Laboral

```tsx
import { EditableListItem } from "@/components/editable-list-item";
import type { Work } from "@/types/resume";

// En tu componente
const [work, setWork] = useState<Work[]>([]);

// Definir campos
const workFields: Field[] = [
  { name: "name", label: "Empresa", type: "text" },
  { name: "position", label: "Puesto", type: "text" },
  { name: "url", label: "Sitio web", type: "url" },
  { name: "startDate", label: "Fecha inicio", type: "text", isDate: true },
  { name: "endDate", label: "Fecha fin", type: "text", isDate: true },
  { name: "summary", label: "Descripción", type: "textarea", rows: 3 },
  { name: "highlights", label: "Logros destacados", type: "text" }, // Array field
];

// Funciones helper
const getWorkFieldValue = (item: Work, field: string) => {
  return (item as any)[field];
};

const isWorkFieldPinned = (section: string, itemId: string, field: string) => {
  const item = work.find(w => w.id === itemId);
  return item?.pinnedFields?.includes(field) || false;
};

const isWorkFieldAiModified = (section: string, itemId: string, field: string) => {
  const item = work.find(w => w.id === itemId);
  return item?.aiModifiedFields?.includes(field) || false;
};

const toggleWorkFieldPin = (section: string, itemId: string, field: string) => {
  setWork(prev => prev.map(item => {
    if (item.id !== itemId) return item;
    
    const pinnedFields = item.pinnedFields || [];
    const isPinned = pinnedFields.includes(field);
    
    return {
      ...item,
      pinnedFields: isPinned
        ? pinnedFields.filter(f => f !== field)
        : [...pinnedFields, field],
    };
  }));
};

const handleAddWork = () => {
  const newWork: Work = {
    id: crypto.randomUUID(),
    name: "",
    position: "",
    startDate: "",
    summary: "",
    highlights: [],
    pinnedFields: [],
    aiModifiedFields: [],
  };
  setWork([...work, newWork]);
};

const handleDeleteWork = (index: number) => {
  setWork(work.filter((_, i) => i !== index));
};

const handleChangeWork = (index: number, field: string, value: any) => {
  const newWork = [...work];
  (newWork[index] as any)[field] = value;
  setWork(newWork);
};

// Uso del componente
<EditableListItem
  title="Experiencia laboral"
  description="Tu historial profesional"
  items={work}
  fields={workFields}
  onAdd={handleAddWork}
  onDelete={handleDeleteWork}
  onChange={handleChangeWork}
  isEditMode={editMode !== "none"}
  section="work"
  getFieldValue={getWorkFieldValue}
  isPinned={isWorkFieldPinned}
  isAiModified={isWorkFieldAiModified}
  onPinToggle={toggleWorkFieldPin}
  getItemId={(item) => item.id || ""}
  getItemTitle={(item) => item.position || "Nuevo puesto"}
  getItemDescription={(item) => `${item.name} • ${item.startDate}${item.endDate ? ` - ${item.endDate}` : " - Presente"}`}
  emptyMessage="No hay experiencia laboral añadida"
/>
```

### Características automáticas de EditableListItem

1. **Gestión de arrays**: Los campos de tipo array (como `highlights`) se renderizan automáticamente como una lista de inputs con botones para añadir/eliminar elementos.

2. **Drag handle**: En modo edición, aparece un icono de grip para reordenar items (funcionalidad a implementar).

3. **Badges de control**: Cada campo individual muestra automáticamente los badges de fijado y modificación por IA.

4. **Card colapsable**: Cada item se muestra en un card con título, descripción y botón de eliminar.

5. **Estado vacío**: Muestra un mensaje personalizable cuando no hay items.

## Ejemplo de uso en pestañas

```tsx
<TabsContent value="work" className="space-y-6">
  <EditableListItem
    title="Experiencia laboral"
    description="Tu historial profesional"
    items={work}
    fields={workFields}
    onAdd={handleAddWork}
    onDelete={handleDeleteWork}
    onChange={handleChangeWork}
    isEditMode={editMode !== "none"}
    section="work"
    getFieldValue={getWorkFieldValue}
    isPinned={isWorkFieldPinned}
    isAiModified={isWorkFieldAiModified}
    onPinToggle={toggleWorkFieldPin}
    getItemId={(item) => item.id || ""}
    getItemTitle={(item) => item.position || "Nuevo puesto"}
    getItemDescription={(item) => 
      `${item.name} • ${item.startDate}${item.endDate ? ` - ${item.endDate}` : " - Presente"}`
    }
  />
</TabsContent>
```

## Sincronización con Pestaña IA

Para sincronizar el estado de fijado entre los campos individuales y la pestaña IA:

```tsx
<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full justify-between">
      <span>Experiencia laboral</span>
      <ChevronDown className="h-4 w-4" />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-2 pt-2 pl-4">
    {work.map((job) => (
      <Collapsible key={job.id}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span className="text-sm">{job.position} - {job.name}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2 pl-4">
          {["name", "position", "summary", "highlights"].map((field) => (
            <div key={field} className="flex items-center justify-between py-1">
              <Label className="text-xs">
                {field === "name" ? "Empresa" :
                 field === "position" ? "Puesto" :
                 field === "summary" ? "Descripción" :
                 "Logros"}
              </Label>
              <Switch
                checked={isWorkFieldPinned("work", job.id!, field)}
                onCheckedChange={() => toggleWorkFieldPin("work", job.id!, field)}
              />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    ))}
  </CollapsibleContent>
</Collapsible>
```

## Notas importantes

1. **IDs únicos**: Asegúrate de que cada item tenga un ID único para el correcto funcionamiento del sistema de fijado.

2. **Sincronización**: El estado de fijado debe estar sincronizado entre:
   - Los badges en los campos individuales
   - Los switches en la pestaña IA
   - El estado en el objeto del item

3. **Arrays anidados**: Los campos de tipo array se manejan automáticamente, pero debes proporcionar el campo en la definición con el nombre correcto.

4. **Tipos genéricos**: EditableListItem usa TypeScript generics para ser reutilizable con cualquier tipo de datos.
