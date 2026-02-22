import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle, 
  Settings, 
  Shield,
  Activity,
  FileSearch,
  Scale
} from "lucide-react"
import { useUIStore } from "@/lib/store"

const navigation = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "KYC",
    href: "/kyc",
    icon: Shield,
  },
  {
    title: "AML",
    href: "/aml",
    icon: AlertTriangle,
  },
  {
    title: "Workflows",
    href: "/workflows",
    icon: Activity,
  },
  {
    title: "Règles",
    href: "/rules",
    icon: FileSearch,
  },
  {
    title: "Audit",
    href: "/audit",
    icon: Scale,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className={cn(
      "border-r bg-background transition-all duration-300",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            {sidebarOpen && (
              <span className="font-bold">RegTech</span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-2">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Activity className="h-4 w-4" />
            {sidebarOpen && (
              <span>Réduire</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
