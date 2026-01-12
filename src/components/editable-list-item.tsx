"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditableField } from "@/components/editable-field";

interface Field {
  name: string;
  label: string;
  type?: "text" | "textarea" | "email" | "tel" | "url";
  placeholder?: string;
  rows?: number;
  isDate?: boolean; // For date/month inputs
}

interface EditableListItemProps<T> {
  title: string;
  description?: string;
  items: T[];
  fields: Field[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  onChange: (index: number, field: string, value: any) => void;
  isEditMode?: boolean;
  section: string;
  getFieldValue: (item: T, field: string) => any;
  isPinned: (section: string, itemId: string, field: string) => boolean;
  isAiModified: (section: string, itemId: string, field: string) => boolean;
  onPinToggle: (section: string, itemId: string, field: string) => void;
  getItemId: (item: T) => string;
  getItemTitle: (item: T) => string;
  getItemDescription?: (item: T) => string;
  emptyMessage?: string;
}

export function EditableListItem<T>({
  title,
  description,
  items,
  fields,
  onAdd,
  onDelete,
  onChange,
  isEditMode = false,
  section,
  getFieldValue,
  isPinned,
  isAiModified,
  onPinToggle,
  getItemId,
  getItemTitle,
  getItemDescription,
  emptyMessage = "No hay elementos añadidos",
}: EditableListItemProps<T>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground text-center">
              {emptyMessage}
            </p>
          </CardContent>
        </Card>
      ) : (
        items.map((item, index) => {
          const itemId = getItemId(item);
          return (
            <Card key={itemId || index}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                  {isEditMode && (
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  )}
                  <div>
                    <CardTitle className="text-base">
                      {getItemTitle(item)}
                    </CardTitle>
                    {getItemDescription && (
                      <CardDescription className="mt-1">
                        {getItemDescription(item)}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(index)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field) => {
                  const fieldValue = getFieldValue(item, field.name);
                  
                  // Handle array fields (like highlights)
                  if (Array.isArray(fieldValue)) {
                    return (
                      <div key={field.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            {field.label}
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onChange(index, field.name, [...fieldValue, ""]);
                            }}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Añadir
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {fieldValue.map((val: string, arrayIndex: number) => (
                            <div key={arrayIndex} className="flex gap-2">
                              <EditableField
                                label=""
                                value={val}
                                onChange={(newValue) => {
                                  const newArray = [...fieldValue];
                                  newArray[arrayIndex] = newValue;
                                  onChange(index, field.name, newArray);
                                }}
                                isPinned={isPinned(
                                  section,
                                  itemId,
                                  `${field.name}.${arrayIndex}`
                                )}
                                isAiModified={isAiModified(
                                  section,
                                  itemId,
                                  `${field.name}.${arrayIndex}`
                                )}
                                onPinToggle={() =>
                                  onPinToggle(
                                    section,
                                    itemId,
                                    `${field.name}.${arrayIndex}`
                                  )
                                }
                                isEditMode={isEditMode}
                                placeholder={field.placeholder}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newArray = fieldValue.filter(
                                    (_: any, i: number) => i !== arrayIndex
                                  );
                                  onChange(index, field.name, newArray);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Handle regular fields
                  return (
                    <EditableField
                      key={field.name}
                      label={field.label}
                      type={field.type}
                      value={fieldValue || ""}
                      onChange={(value) => onChange(index, field.name, value)}
                      isPinned={isPinned(section, itemId, field.name)}
                      isAiModified={isAiModified(section, itemId, field.name)}
                      onPinToggle={() =>
                        onPinToggle(section, itemId, field.name)
                      }
                      isEditMode={isEditMode}
                      placeholder={field.placeholder}
                      rows={field.rows}
                    />
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
