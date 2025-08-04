"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModelIndicatorCompact } from "@/components/model-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Menu,
  X,
  PanelRightOpen,
  PanelRightClose,
  Search,
  ChevronRight,
  Database,
  FileText,
  Home,
  BarChart3,
  Users,
  Settings,
  Bot,
  Bell,
  Calendar,
  Sparkles,
  Edit3,
  Eye,
  Tags,
  Archive,
  LogOut,
  User,
  UserCircle,
  CreditCard
} from "lucide-react"

interface HeaderProps {
  className?: string
  children: React.ReactNode
}

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string
  items?: MenuItem[]
}

export function Header({ className, children }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [platformOpen, setPlatformOpen] = React.useState(true)
  const [editorialOpen, setEditorialOpen] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const pathname = usePathname()
  const { data: session } = useSession()

  const platformItems: MenuItem[] = [
    {
      title: "Feed Overview",
      icon: Home,
      href: "/",
    },
    {
      title: "Analytics Dashboard",
      icon: BarChart3,
      href: "/dashboard",
    },
    {
      title: "Community",
      icon: Users,
      href: "/community",
    },
    {
      title: "AI Models",
      icon: Bot,
      href: "/llm-management",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/notifications",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  const editorialItems: MenuItem[] = [
    {
      title: "AI Create",
      icon: Sparkles,
      href: "/create-post",
      badge: "AI"
    },
    {
      title: "Draft Manager",
      icon: Edit3,
      href: "/drafts",
    },
    {
      title: "Published Posts",
      icon: Eye,
      href: "/posts",
    },
    {
      title: "Content Calendar",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "Categories & Tags",
      icon: Tags,
      href: "/taxonomy",
    },
    {
      title: "Archive",
      icon: Archive,
      href: "/archive",
    },
  ]

  const testingItems: MenuItem[] = [
    {
      title: "AI Testing",
      icon: Bot,
      href: "/test-ai",
    },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const NavItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => (
    <li key={item.title}>
      {item.href ? (
        <Link
          href={item.href}
          onClick={() => setIsSidebarOpen(false)} // Close sidebar on navigation
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive(item.href) && "bg-accent text-accent-foreground font-medium",
            level > 0 && "ml-4"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      ) : (
        <div className={cn("px-3 py-2 text-sm font-medium", level > 0 && "ml-4")}>
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
        </div>
      )}
    </li>
  )

  const CollapsibleSection = ({
    title,
    icon: Icon,
    items,
    isOpen,
    onToggle,
  }: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    items: MenuItem[]
    isOpen: boolean
    onToggle: () => void
  }) => (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <Icon className="h-4 w-4" />
          <span className="flex-1 text-left">{title}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-90"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        <ul className="space-y-1">
          {items.map((item) => (
            <NavItem key={item.title} item={item} level={1} />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )

  return (
    <div className={cn("flex flex-col h-screen", className)}>
      {/* Compact Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-12 max-w-screen-2xl items-center justify-between px-3">
          {/* Left Section: Logo + Primary Links */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                V
              </div>
              <span className="hidden sm:inline-block font-bold text-sm">Veridict</span>
            </Link>

            {/* Primary Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4 text-xs font-mono">
              <Link
                href="/"
                className={cn(
                  "transition-colors hover:text-foreground/80 text-xs font-mono",
                  pathname === "/" ? "text-foreground font-semibold" : "text-foreground/60 font-extralight"
                )}
              >
                Feed
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "transition-colors hover:text-foreground/80 text-xs font-mono",
                  pathname.startsWith("/dashboard") ? "text-foreground font-semibold" : "text-foreground/60 font-extralight"
                )}
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Center Section: Search Bar */}
          <div className="flex-1 max-w-sm mx-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 h-7 text-sm"
              />
            </form>
          </div>

          {/* Right Section: Theme + Auth + Sidebar Toggle */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Authentication Control */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback className="text-xs">
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/billing" className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/signout" className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/api/auth/signin">
                <Button size="sm" variant="default" className="h-7 px-3 text-xs">
                  Login
                </Button>
              </Link>
            )}

            {/* Sidebar Trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-7 w-7 p-0"
            >
              <PanelRightOpen className="h-3 w-3" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout Container with Push Behavior */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main 
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isSidebarOpen ? "mr-80" : "mr-0"
          )}
        >
          <div className="container max-w-screen-2xl px-4 py-6">
            {children}
          </div>
        </main>

        {/* Right Sidebar with Push Behavior */}
        <div 
          className={cn(
            "fixed right-0 top-12 h-[calc(100vh-3rem)] w-80 border-l bg-background shadow-lg transition-transform duration-300 ease-in-out z-40",
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="flex h-12 items-center justify-between border-b px-4">
              <h2 className="text-sm font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="h-6 w-6 p-0"
              >
                <PanelRightClose className="h-3 w-3" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>

            {/* Sidebar Content */}
            <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
              {/* Platform Section */}
              <CollapsibleSection
                title="Platform"
                icon={Database}
                items={platformItems}
                isOpen={platformOpen}
                onToggle={() => setPlatformOpen(!platformOpen)}
              />

              {/* Editorial Section */}
              <CollapsibleSection
                title="Editorial"
                icon={FileText}
                items={editorialItems}
                isOpen={editorialOpen}
                onToggle={() => setEditorialOpen(!editorialOpen)}
              />

              {/* Testing Section (Development Only) */}
              {process.env.NODE_ENV === "development" && (
                <div className="pt-4 border-t">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    Development
                  </div>
                  <ul className="space-y-1">
                    {testingItems.map((item) => (
                      <NavItem key={item.title} item={item} />
                    ))}
                  </ul>
                </div>
              )}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t p-4 space-y-3">
              {/* AI Model Indicator */}
              <div className="flex items-center gap-2">
                <ModelIndicatorCompact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
