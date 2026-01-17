"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  Home,
  LogOut,
  Menu,
  Moon,
  Palette,
  Settings,
  Sparkles,
  Sun,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { signOut, useSession } from "@/lib/auth-client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Mis CVs", href: "/resumes", icon: FileText },
  { name: "Estilos", href: "/styles", icon: Palette },
  { name: "Configuración IA", href: "/settings/ai", icon: Sparkles },
];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Toggle */}
          <div
            className={cn(
              "flex items-center border-b dark:border-zinc-800 h-16",
              isSidebarCollapsed
                ? "justify-center px-2"
                : "justify-between px-4",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isSidebarCollapsed ? "gap-0" : "gap-2",
              )}
            >
              <Sparkles className="h-6 w-6 text-primary shrink-0" />
              {!isSidebarCollapsed && (
                <span className="text-xl font-bold">CV AI</span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className={cn(
                "hidden lg:flex items-center justify-center h-8 w-8 rounded-md",
                "text-zinc-500 dark:text-zinc-400",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200",
                "transition-colors",
                isSidebarCollapsed &&
                  "absolute -right-3 top-4 bg-white dark:bg-zinc-900 border dark:border-zinc-700 shadow-sm",
              )}
              title={
                isSidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"
              }
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    isSidebarCollapsed && "justify-center",
                  )}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4 dark:border-zinc-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 px-3",
                    isSidebarCollapsed
                      ? "justify-center px-3"
                      : "justify-start",
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!isSidebarCollapsed && (
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium truncate max-w-[140px]">
                        {session?.user?.name || "Usuario"}
                      </span>
                      <span className="text-xs text-zinc-500 truncate max-w-[140px]">
                        {session?.user?.email}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {theme === "dark" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : (
                      <Sun className="mr-2 h-4 w-4" />
                    )}
                    Modo oscuro
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <div className="container max-w-full mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
