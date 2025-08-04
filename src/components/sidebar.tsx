"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ModelIndicatorCompact } from "@/components/model-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ChevronRight,
  Home,
  Search,
  BarChart3,
  Users,
  Settings,
  Database,
  Shield,
  FileText,
  PlusCircle,
  Edit3,
  Eye,
  Archive,
  Tags,
  Menu,
  X,
  Sparkles,
  Bot,
  TrendingUp,
  Globe,
  MessageSquare,
  Bell,
  Calendar,
  Filter,
  LogOut,
  User,
  Crown
} from "lucide-react"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string
  items?: MenuItem[]
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [platformOpen, setPlatformOpen] = React.useState(true)
  const [editorialOpen, setEditorialOpen] = React.useState(true)
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
      title: "Search & Discovery",
      icon: Search,
      href: "/search",
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

  const NavItem = ({ item, level = 0 }: { item: MenuItem; level?: number }) => (
    <li key={item.title}>
      {item.href ? (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive(item.href) && "bg-accent text-accent-foreground font-medium",
            level > 0 && "ml-4",
            isCollapsed && "justify-center"
          )}
        >
          <item.icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      ) : (
        <div className={cn("px-3 py-2 text-sm font-medium", level > 0 && "ml-4")}>
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            {!isCollapsed && <span>{item.title}</span>}
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
          className={cn(
            "w-full justify-start gap-3 px-3 py-2 text-sm font-medium",
            "hover:bg-accent hover:text-accent-foreground",
            isCollapsed && "justify-center"
          )}
        >
          <Icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{title}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            </>
          )}
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
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background",
        isCollapsed ? "w-16" : "w-64",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <Link href="/" className="text-xl font-bold text-foreground">
            Veridict
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-3">
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

        {/* Testing Section (only for development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="pt-4 border-t">
            <div className={cn("px-3 py-2 text-xs font-medium text-muted-foreground", isCollapsed && "text-center")}>
              {!isCollapsed ? "Development" : "DEV"}
            </div>
            <ul className="space-y-1">
              {testingItems.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-3 space-y-3">
        {/* AI Model Indicator */}
        <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
          <ModelIndicatorCompact />
          {!isCollapsed && <ThemeToggle />}
        </div>

        {/* User Section */}
        {session ? (
          <div className={cn("space-y-2", isCollapsed && "text-center")}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2 p-2 rounded-md bg-accent/50">
                <User className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user?.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {session.user?.role || 'AUTHOR'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {session.user?.reputation || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <Link href="/api/auth/signout">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("w-full justify-start gap-2", isCollapsed && "justify-center")}
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && "Sign out"}
              </Button>
            </Link>
          </div>
        ) : (
          <Link href="/api/auth/signin">
            <Button 
              size="sm" 
              className={cn("w-full justify-start gap-2", isCollapsed && "justify-center")}
            >
              <User className="h-4 w-4" />
              {!isCollapsed && "Sign in"}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
