"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideProps } from "lucide-react"

import {
  ChevronDown,
  LayoutDashboard,
  Network,
  BarChart2,
  LifeBuoy,
  Bell,
  Users,
  Ticket,
  Activity,
} from "lucide-react"

// --- Type Definitions ---
interface Account {
  role: "admin" | "cliente"
  contactName: string
}

type CurrentUser = object | null

interface SubMenuItem {
  name: string
  href: string
}

interface NavItem {
  name: string
  href: string
  submenu?: SubMenuItem[]
  icon?: React.ComponentType<LucideProps>
}

// --- Navigation Data Structures ---
const mainNav: NavItem[] = [
  { name: "Início", href: "/" },
  {
    name: "Produto",
    href: "/produto",
    submenu: [
      { name: "Dashboard", href: "/produto#dashboard" },
      { name: "Recursos", href: "/produto#recursos" },
      { name: "Planos", href: "/produto#planos" },
      { name: "Segurança", href: "/produto#seguranca" },
    ],
  },
  {
    name: "Recursos",
    href: "/recursos",
    submenu: [
      { name: "Central de Ajuda", href: "/recursos#ajuda" },
      { name: "Documentação", href: "/recursos#aprendizagem" },
      { name: "Suporte", href: "/recursos#suporte" },
    ],
  },
  {
    name: "Empresa",
    href: "/empresa",
    submenu: [
      { name: "Sobre Nós", href: "/empresa#sobrenos" },
      { name: "Perguntas Frequentes", href: "/empresa#perguntas" },
      { name: "Contato", href: "/empresa#contato" },
    ],
  },
]

const clientNav: NavItem[] = [
  { name: "Dashboard", href: "/system/client/dashboard", icon: LayoutDashboard },
  {
    name: "Rede",
    href: "/system/client/network",
    icon: Network,
    submenu: [
      { name: "Topologia da Rede", href: "/system/client/network/view-network" },
      { name: "Equipamentos da Rede", href: "/system/client/assets" },
    ],
  },
  {
    name: "Análise",
    href: "/system/client/analysis",
    icon: BarChart2,
    submenu: [
      { name: "Relatórios de Consumo", href: "/system/client/analysis/reports" },
      { name: "Análises com IA", href: "/system/client/analysis/ai" },
    ],
  },
  {
    name: "Suporte",
    href: "/system/client/tickets",
    icon: LifeBuoy,
    submenu: [
      { name: "Abrir chamados", href: "/system/client/tickets/create-ticket" },
      { name: "Consultar chamados", href: "/system/client/tickets/search-ticket" },
    ],
  },
  {
    name: "Alertas",
    href: "/system/client/alerts",
    icon: Bell,
    submenu: [
      { name: "Configurar Limites para os Ativos", href: "/system/client/alerts/thresholds" },
      { name: "Configurar Dispositivos de Recebimento", href: "/system/client/alerts/dispositives" },
    ],
  },
]

const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/system/admin/dashboard", icon: LayoutDashboard },
  {
    name: "Rede",
    href: "/system/admin/network",
    icon: Network,
    submenu: [
      { name: "Criar Nova Rede", href: "/system/admin/network/create-network" },
      { name: "Criar Novo Equipamento", href: "/system/admin/assets/create-asset" },
      { name: "Visualizar Rede", href: "/system/admin/network/search-network" },
      { name: "Visualizar Equipamento", href: "/system/admin/assets" },
    ],
  },
  {
    name: "Análises",
    href: "/system/admin/analysis",
    icon: BarChart2,
    submenu: [
      { name: "Relatórios de Consumo", href: "/system/admin/analysis/reports" },
      { name: "Análises com IA", href: "/system/admin/analysis/ai" },
    ],
  },
  {
    name: "Suporte",
    href: "/system/admin/messages",
    icon: Ticket,
    submenu: [
      { name: "Chamados", href: "/system/admin/messages/tickets" },
      { name: "Orçamentos", href: "/system/admin/messages/solicitations" },
      { name: "Mensagens", href: "/system/admin/messages/contacts" },
    ],
  },
  { name: "Clientes", href: "/system/admin/accounts", icon: Users },
]

// --- NavLink Component (for logged-out horizontal nav) ---
const NavLink = ({ item, isAdmin = false }: { item: NavItem; isAdmin?: boolean }) => {
  const pathname = usePathname()
  const hasSubmenu = !!item.submenu && item.submenu.length > 0

  const theme = {
    baseColor: "text-gray-600",
    hoverColor: isAdmin ? "hover:text-red-600" : "hover:text-blue-600",
    activeColor: isAdmin ? "text-red-600" : "text-blue-600",
  }

  const isActive =
    (item.href !== "#" && pathname.startsWith(item.href)) ||
    (hasSubmenu && item.submenu?.some((sub) => pathname.startsWith(sub.href)))

  return (
    <div className="relative group h-full flex items-center">
      <Link
        href={item.href}
        className={`flex items-center text-sm font-medium transition-colors duration-300 ${
          isActive ? theme.activeColor : `${theme.baseColor} ${theme.hoverColor}`
        }`}
      >
        {item.name}
        {hasSubmenu && (
          <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" />
        )}
      </Link>
      {hasSubmenu && (
        <div
          className="absolute top-full left-0 mt-0 w-56 bg-white rounded-md shadow-lg border py-2 z-50
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2"
        >
          {item.submenu?.map((subitem) => (
            <Link
              key={subitem.name}
              href={subitem.href}
              className={`block px-4 py-2 text-sm ${
                pathname.startsWith(subitem.href) ? theme.activeColor : "text-gray-700"
              } ${theme.hoverColor} hover:bg-gray-50`}
            >
              {subitem.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Vertical Sidebar Link Component ---
const SideBarLink = ({ item, isAdmin = false }: { item: NavItem; isAdmin?: boolean }) => {
  const pathname = usePathname()
  const hasSubmenu = !!item.submenu && item.submenu.length > 0
  const isParentActive =
    (item.href !== "#" && pathname.startsWith(item.href)) ||
    (hasSubmenu && item.submenu?.some((sub) => pathname.startsWith(sub.href)))

  const [isOpen, setIsOpen] = useState(isParentActive)

  useEffect(() => {
    setIsOpen(isParentActive)
  }, [isParentActive])

  // AJUSTE: Cores para o tema "Preto Total com Opal"
  const theme = {
    baseBg: "hover:bg-gray-800", // Fundo ao passar o mouse
    activeBg: "bg-white/5", // Fundo do item ativo (sutilmente branco/translúcido)
    baseText: "text-gray-400", // Texto padrão
    activeText: "text-cyan-300 font-semibold", // Texto do item ativo (cor de opala)
    iconColor: "text-cyan-300", // Cor do ícone do item ativo (cor de opala)
    baseIconColor: "text-gray-500", // Cor do ícone padrão
    submenuActiveText: "text-cyan-400 font-medium", // Texto do subitem ativo (cor de opala mais intensa)
    submenuHoverBg: "hover:bg-gray-800", // Fundo do subitem ao passar o mouse
  }

  if (!hasSubmenu) {
    return (
      <Link
        href={item.href}
        className={`w-full flex items-center p-3 rounded-lg transition-colors text-sm ${
          isParentActive ? `${theme.activeBg} ${theme.activeText}` : `${theme.baseText} ${theme.baseBg}`
        }`}
      >
        {item.icon && (
          <item.icon
            className={`w-5 h-5 mr-3 flex-shrink-0 ${isParentActive ? theme.iconColor : theme.baseIconColor}`}
          />
        )}
        <span className="flex-1 text-left">{item.name}</span>
      </Link>
    )
  }

  return (
    <div>
      <div
        className={`w-full flex items-center rounded-lg transition-colors text-sm ${
          isParentActive ? `${theme.activeBg} ${theme.activeText}` : `${theme.baseText} ${theme.baseBg}`
        }`}
      >
        <Link href={item.href} className="flex-grow flex items-center p-3 rounded-l-lg">
          {item.icon && (
            <item.icon
              className={`w-5 h-5 mr-3 flex-shrink-0 ${isParentActive ? theme.iconColor : theme.baseIconColor}`}
            />
          )}
          <span className="flex-1 text-left">{item.name}</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 rounded-r-lg hover:bg-gray-800`} // AJUSTE: Hover para o botão do submenu
          aria-label={`Expandir ${item.name}`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${
              isParentActive ? theme.iconColor : theme.baseIconColor
            }`}
          />{" "}
          {/* AJUSTE: Cor do ícone chevron */}
        </button>
      </div>

      <div
        className={`pl-6 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="pt-2 pb-1 space-y-1 border-l border-gray-700 ml-[1.375rem]">
          {" "}
          {/* AJUSTE: Cor da borda do submenu */}
          {item.submenu?.map((subitem) => {
            const isSubActive = pathname.startsWith(subitem.href)
            return (
              <Link
                key={subitem.name}
                href={subitem.href}
                className={`block p-2 pl-4 rounded-md text-sm transition-colors ${
                  isSubActive ? theme.submenuActiveText : `text-gray-400 ${theme.submenuHoverBg}`
                }`}
              >
                {subitem.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- Vertical Sidebar Component ---
const SideBar = ({ navItems, isAdmin = false }: { navItems: NavItem[]; isAdmin?: boolean }) => {
  return (
    // AJUSTE: Fundo do sidebar e borda
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-950 border-r border-gray-800 hidden md:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <Link href="/" className="flex items-center space-x-3">
          {/* AJUSTE: Cor do ícone no logo */}
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            {/* AJUSTE: Cor do texto do logo */}
            <span className="text-xl font-bold text-gray-100">AIRscan</span>
          </div>
        </Link>
        <ul className="mt-10 space-y-1 font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <SideBarLink item={item} isAdmin={isAdmin} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

// --- Bottom Navigation Bar Component ---
const BottomNavBar = ({ navItems }: { navItems: NavItem[] }) => {
  const pathname = usePathname()

  return (
    // AJUSTE: Fundo e borda da barra de navegação inferior
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around max-w-7xl mx-auto">
        {navItems.map((item) => {
          if (!item.icon) return null

          const isActive =
            (item.href !== "#" && pathname.startsWith(item.href)) ||
            (item.submenu && item.submenu.some((sub) => pathname.startsWith(sub.href)))

          return (
            <Link
              key={item.name}
              href={item.submenu ? item.submenu[0].href : item.href}
              className={`flex flex-col items-center justify-center text-center p-2 w-full transition-colors duration-200 ${
                isActive ? "text-cyan-400" : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// --- Main Navigation Component ---
interface MainNavProps {
  account: Account | null
  currentUser: CurrentUser
  showBottomNav?: boolean
}

export function MainNav({ account, currentUser, showBottomNav = false }: MainNavProps) {
  const userIsLoggedIn = !!currentUser && !!account
  const navToRender =
    account?.role === "admin" ? adminNav : account?.role === "cliente" ? clientNav : mainNav

  if (showBottomNav) {
    return <BottomNavBar navItems={navToRender} />
  }

  if (userIsLoggedIn && account) {
    return <SideBar navItems={navToRender} isAdmin={account.role === "admin"} />
  } else {
    return (
      <div className="hidden md:block">
        {/* AJUSTE: Cor da borda superior da nav principal (para usuários não logados) */}
        <div className="border-t border-gray-700">
          <nav className="flex items-center h-12 space-x-8">
            {mainNav.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    )
  }
}