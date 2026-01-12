"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Pencil,
  MoreVertical,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResumeVersion {
  id: string;
  title: string | null;
  description: string | null;
  basedOn: string | null;
  customSlug: string | null;
  resumeId: string;
  createdAt: Date;
  isCommunityPublic: boolean;
  isResultPublic: boolean;
}

interface Resume {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  currentVersionId: string | null;
  versions: ResumeVersion[];
}

interface TreeNode {
  version: ResumeVersion;
  children: TreeNode[];
  level: number;
}

interface ResumeGraphViewProps {
  resumes: Resume[];
}

function buildTree(versions: ResumeVersion[]): TreeNode[] {
  // Create a map for quick lookup
  const versionMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Initialize all nodes
  versions.forEach((version) => {
    versionMap.set(version.id, {
      version,
      children: [],
      level: 0,
    });
  });

  // Build the tree structure
  versions.forEach((version) => {
    const node = versionMap.get(version.id)!;

    if (!version.basedOn) {
      // Root node
      roots.push(node);
    } else {
      // Child node
      const parent = versionMap.get(version.basedOn);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    }
  });

  return roots;
}

function VersionNode({
  node,
  resumeId,
  resumeSlug,
  currentVersionId,
  isLast = false,
}: {
  node: TreeNode;
  resumeId: string;
  resumeSlug: string | null;
  currentVersionId: string | null;
  isLast?: boolean;
}) {
  const isCurrentVersion = node.version.id === currentVersionId;

  return (
    <div className="flex flex-col relative">
      <div className="flex items-center relative">
        {/* Node Card */}
        <Card
          className={`min-w-[280px] max-w-[280px] relative z-10 ${
            isCurrentVersion ? "border-primary border-2 shadow-md" : ""
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="truncate">
                    {node.version.title || `Versión ${node.version.id}`}
                  </span>
                </CardTitle>
                {node.version.description && (
                  <CardDescription className="text-xs line-clamp-2">
                    {node.version.description}
                  </CardDescription>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="ml-2">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/resume/${resumeId}?version=${node.version.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  {node.version.isResultPublic && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/resume-result/${
                          node.version.customSlug || resumeSlug || resumeId
                        }`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver público
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Crear versión basada
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                v{node.version.id}
              </Badge>
              {isCurrentVersion && (
                <Badge variant="default" className="text-xs">
                  Actual
                </Badge>
              )}
              {node.version.isResultPublic && (
                <Badge variant="secondary" className="text-xs">
                  <Eye className="mr-1 h-2.5 w-2.5" />
                  Público
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(node.version.createdAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </CardContent>
        </Card>

        {/* Horizontal connector to children */}
        {node.children.length > 0 && (
          <div className="relative h-0.5 w-12 bg-border ml-4 z-0">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="flex flex-col gap-4 mt-4 pl-[308px] relative">
          {/* Vertical line connecting children */}
          {node.children.length > 1 && (
            <div
              className="absolute left-[296px] top-0 w-0.5 bg-border"
              style={{
                height: `calc(100% - ${node.children.length > 1 ? "16px" : "0px"})`,
              }}
            />
          )}
          
          {node.children.map((child, idx) => (
            <div key={child.version.id} className="relative">
              {/* Horizontal line from vertical connector to child */}
              <div className="absolute left-[-12px] top-[50px] w-3 h-0.5 bg-border" />
              <VersionNode
                node={child}
                resumeId={resumeId}
                resumeSlug={resumeSlug}
                currentVersionId={currentVersionId}
                isLast={idx === node.children.length - 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ResumeGraphView({ resumes }: ResumeGraphViewProps) {
  return (
    <div className="space-y-12">
      {resumes.map((resume) => {
        const trees = buildTree(resume.versions);

        return (
          <Card key={resume.id} className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {resume.title}
              </h2>
              {resume.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {resume.description}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">
                  {resume.versions.length}{" "}
                  {resume.versions.length === 1 ? "versión" : "versiones"}
                </Badge>
                {resume.slug && (
                  <Badge variant="secondary">
                    <Eye className="mr-1 h-3 w-3" />
                    Slug: {resume.slug}
                  </Badge>
                )}
              </div>
            </div>

            {resume.versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay versiones creadas para este CV
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex flex-col gap-6">
                  {trees.map((tree) => (
                    <VersionNode
                      key={tree.version.id}
                      node={tree}
                      resumeId={resume.id}
                      resumeSlug={resume.slug}
                      currentVersionId={resume.currentVersionId}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
