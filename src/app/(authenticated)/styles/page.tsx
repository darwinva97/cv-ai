import Link from "next/link";
import {
  Heart,
  Download,
  Eye,
  GitFork,
  Plus,
  Search,
  Sparkles,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Datos de ejemplo
const categories = [
  { value: "all", label: "Todos" },
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Moderno" },
  { value: "classic", label: "Clásico" },
  { value: "creative", label: "Creativo" },
  { value: "professional", label: "Profesional" },
  { value: "tech", label: "Tech" },
  { value: "academic", label: "Académico" },
];

const mockStyles = [
  {
    id: "1",
    name: "Clean Modern",
    description: "Diseño limpio y moderno con colores sutiles",
    slug: "clean-modern",
    category: "modern",
    isOfficial: true,
    isFeatured: true,
    likesCount: 234,
    usageCount: 1520,
    forksCount: 45,
    thumbnailUrl: null,
    author: { name: "CV AI", image: null },
    colors: {
      primary: "#2563eb",
      background: "#ffffff",
    },
  },
  {
    id: "2",
    name: "Developer Dark",
    description: "Tema oscuro perfecto para desarrolladores",
    slug: "developer-dark",
    category: "tech",
    isOfficial: false,
    isFeatured: true,
    likesCount: 189,
    usageCount: 890,
    forksCount: 32,
    thumbnailUrl: null,
    author: { name: "John Doe", image: null },
    colors: {
      primary: "#22c55e",
      background: "#0f172a",
    },
  },
  {
    id: "3",
    name: "Elegant Classic",
    description: "Estilo elegante y atemporal",
    slug: "elegant-classic",
    category: "classic",
    isOfficial: true,
    isFeatured: false,
    likesCount: 156,
    usageCount: 670,
    forksCount: 18,
    thumbnailUrl: null,
    author: { name: "CV AI", image: null },
    colors: {
      primary: "#78716c",
      background: "#fafaf9",
    },
  },
  {
    id: "4",
    name: "Creative Bold",
    description: "Colores vibrantes para destacar",
    slug: "creative-bold",
    category: "creative",
    isOfficial: false,
    isFeatured: true,
    likesCount: 98,
    usageCount: 340,
    forksCount: 12,
    thumbnailUrl: null,
    author: { name: "Jane Smith", image: null },
    colors: {
      primary: "#ec4899",
      background: "#fdf4ff",
    },
  },
  {
    id: "5",
    name: "Minimal Pro",
    description: "Minimalismo profesional",
    slug: "minimal-pro",
    category: "minimal",
    isOfficial: true,
    isFeatured: true,
    likesCount: 445,
    usageCount: 2100,
    forksCount: 67,
    thumbnailUrl: null,
    author: { name: "CV AI", image: null },
    colors: {
      primary: "#18181b",
      background: "#ffffff",
    },
  },
  {
    id: "6",
    name: "Academic Blue",
    description: "Ideal para CV académicos y de investigación",
    slug: "academic-blue",
    category: "academic",
    isOfficial: false,
    isFeatured: false,
    likesCount: 67,
    usageCount: 230,
    forksCount: 8,
    thumbnailUrl: null,
    author: { name: "Dr. Research", image: null },
    colors: {
      primary: "#1e40af",
      background: "#f8fafc",
    },
  },
];

function StylePreview({ colors }: { colors: { primary: string; background: string } }) {
  return (
    <div
      className="aspect-[3/4] rounded-lg border overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Mini preview del CV */}
      <div className="h-full p-3 flex flex-col gap-2">
        {/* Header */}
        <div className="flex gap-2 items-center">
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="flex-1 space-y-1">
            <div
              className="h-2 rounded w-3/4"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="h-1.5 rounded w-1/2 opacity-50"
              style={{ backgroundColor: colors.primary }}
            />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 space-y-2 pt-2">
          <div
            className="h-1.5 rounded w-1/3"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="space-y-1">
            <div className="h-1 rounded w-full bg-gray-200" />
            <div className="h-1 rounded w-5/6 bg-gray-200" />
            <div className="h-1 rounded w-4/6 bg-gray-200" />
          </div>
          <div
            className="h-1.5 rounded w-1/4 mt-3"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="space-y-1">
            <div className="h-1 rounded w-full bg-gray-200" />
            <div className="h-1 rounded w-3/4 bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StyleCard({ style }: { style: (typeof mockStyles)[0] }) {
  return (
    <Card className="group overflow-hidden">
      <CardHeader className="p-0">
        <Link href={`/styles/${style.slug}`}>
          <div className="relative cursor-pointer">
            <StylePreview colors={style.colors} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button size="sm" variant="secondary">
                <Eye className="mr-2 h-4 w-4" />
                Vista previa
              </Button>
            </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {style.name}
              {style.isOfficial && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Oficial
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="line-clamp-1 mt-1">
              {style.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline">{categories.find((c) => c.value === style.category)?.label}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {style.likesCount}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {style.usageCount}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {style.forksCount}
          </span>
        </div>
        <span className="text-xs">{style.author.name}</span>
      </CardFooter>
    </Card>
  );
}

export default function StylesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estilos de CV</h1>
          <p className="text-muted-foreground">
            Explora y usa estilos creados por la comunidad
          </p>
        </div>
        <Button asChild>
          <Link href="/styles/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear estilo
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="explore">
        <TabsList>
          <TabsTrigger value="explore">Explorar</TabsTrigger>
          <TabsTrigger value="my-styles">Mis estilos</TabsTrigger>
          <TabsTrigger value="saved">Guardados</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar estilos..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="popular">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Populares</SelectItem>
                  <SelectItem value="recent">Recientes</SelectItem>
                  <SelectItem value="likes">Más likes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Destacados
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockStyles
                .filter((s) => s.isFeatured)
                .map((style) => (
                  <StyleCard key={style.id} style={style} />
                ))}
            </div>
          </div>

          {/* All styles */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Todos los estilos</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockStyles.map((style) => (
                <StyleCard key={style.id} style={style} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-styles" className="space-y-6">
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No tienes estilos creados
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Crea tu propio estilo personalizado o haz un fork de uno existente
              </p>
              <Button asChild>
                <Link href="/styles/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear estilo
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No tienes estilos guardados
              </h3>
              <p className="text-muted-foreground mb-4">
                Guarda tus estilos favoritos para usarlos después
              </p>
              <Button variant="outline" asChild>
                <Link href="/styles">Explorar estilos</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
