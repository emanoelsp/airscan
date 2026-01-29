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
  Shield,
  User,
  LogOut,
  UserCog,
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
  { name: "Dashboard", href: "/painel", icon: LayoutDashboard },
  {
    name: "Rede",
    href: "/painel/rede",
    icon: Network,
    submenu: [
      { name: "Topologia da Rede", href: "/painel/rede/topologia" },
      { name: "Equipamentos da Rede", href: "/painel/rede/equipamentos" },
    ],
  },
  {
    name: "Análise",
    href: "/painel/analise",
    icon: BarChart2,
    submenu: [
      { name: "Relatórios de Consumo", href: "/painel/analise/relatorios" },
      { name: "Análises com IA", href: "/painel/analise/inteligencia-artificial" },
    ],
  },
  {
    name: "Suporte",
    href: "/painel/suporte",
    icon: LifeBuoy,
    submenu: [
      { name: "Abrir Chamado", href: "/painel/suporte/abrir-chamado" },
      { name: "Consultar Chamados", href: "/painel/suporte/consultar-chamados" },
    ],
  },
  {
    name: "Alertas",
    href: "/painel/alertas",
    icon: Bell,
    submenu: [
      { name: "Configurar Contatos", href: "/painel/alertas/configurar-contatos" },
      { name: "Configurar Limites", href: "/painel/alertas/configurar-limites" },
    ],
  },
]

const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/administracao", icon: LayoutDashboard },
  {
    name: "Rede",
    href: "/administracao/rede",
    icon: Network,
    submenu: [
      { name: "Criar Nova Rede", href: "/administracao/rede/criar-rede" },
      { name: "Criar Novo Equipamento", href: "/administracao/equipamentos/criar" },
      { name: "Visualizar Rede", href: "/administracao/rede/visualizar-rede" },
      { name: "Visualizar Equipamento", href: "/administracao/equipamentos" },
    ],
  },
  {
    name: "Análises",
    href: "/administracao/analises",
    icon: BarChart2,
    submenu: [
      { name: "Relatórios de Consumo", href: "/administracao/analises/relatorios" },
      { name: "Análises com IA", href: "/administracao/analises/inteligencia-artificial" },
    ],
  },
  {
    name: "Suporte",
    href: "/administracao/suporte",
    icon: Ticket,
    submenu: [
      { name: "Chamados", href: "/administracao/suporte/chamados" },
      { name: "Orçamentos", href: "/administracao/suporte/orcamentos" },
      { name: "Mensagens", href: "/administracao/suporte/mensagens" },
    ],
  },
  { name: "Clientes", href: "/administracao/clientes", icon: Users },
]

// --- NavLink Component (for logged-out horizontal nav) ---
const NavLink = ({ item }: { item: NavItem }) => {
  const pathname = usePathname()
  const hasSubmenu = !!item.submenu && item.submenu.length > 0

  const theme = {
    baseColor: "text-gray-600",
    hoverColor: "hover:text-blue-600",
    activeColor: "text-blue-600",
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
const SideBarLink = ({ item }: { item: NavItem }) => {
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
                className={`block p-2 pl-4 rounded-md text-sm transition-colors mb-1 ${
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

// --- User Menu Component for Sidebar ---
const SidebarUserMenu = ({ account, onLogout }: { account: Account | null; onLogout: () => void }) => {
  if (!account) return null

  const isAdmin = account.role === "admin"

  return (
    <div className="relative group mt-auto pt-4 border-t border-gray-800">
      <Link
        href={isAdmin ? "/administracao/perfil" : "/painel/perfil"}
        className="flex items-center gap-2 text-sm font-semibold p-2 rounded-md cursor-pointer text-gray-300 hover:text-cyan-300 transition-colors"
      >
        {isAdmin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
        <span className="flex-1">Olá, {account.contactName.split(" ")[0]}</span>
        <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
      </Link>
      <div
        className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2"
      >
        <Link
          href={isAdmin ? "/administracao/perfil" : "/painel/perfil"}
          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
        >
          <UserCog className="w-4 h-4" />
          <span>Meu Perfil</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

// --- Vertical Sidebar Component ---
const SideBar = ({ navItems, account, onLogout }: { navItems: NavItem[]; account: Account | null; onLogout: () => void }) => {
  return (
    // AJUSTE: Fundo do sidebar e borda
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-950 border-r border-gray-800 hidden md:block">
      <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
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
        <ul className="mt-10 space-y-1 font-medium flex-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <SideBarLink item={item} />
            </li>
          ))}
        </ul>
        <SidebarUserMenu account={account} onLogout={onLogout} />
      </div>
    </aside>
  )
}

// --- User Menu Component for Bottom Nav ---
const BottomUserMenu = ({ account }: { account: Account | null }) => {
  const pathname = usePathname()

  if (!account) return null

  const isAdmin = account.role === "admin"
  const isProfileActive = pathname === (isAdmin ? "/administracao/perfil" : "/painel/perfil")

  return (
    <div className="relative flex-1">
      <Link
        href={isAdmin ? "/administracao/perfil" : "/painel/perfil"}
        className={`flex flex-col items-center justify-center text-center p-2 w-full transition-colors duration-200 ${
          isProfileActive ? "text-cyan-400" : "text-gray-400"
        }`}
      >
        {isAdmin ? <Shield className="w-6 h-6 mb-1" strokeWidth={isProfileActive ? 2.5 : 2} /> : <User className="w-6 h-6 mb-1" strokeWidth={isProfileActive ? 2.5 : 2} />}
        <span className="text-xs font-medium">Perfil</span>
      </Link>
    </div>
  )
}

// --- Bottom Navigation Bar Component ---
const BottomNavBar = ({ navItems, account }: { navItems: NavItem[]; account: Account | null }) => {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  return (
    // AJUSTE: Fundo e borda da barra de navegação inferior
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-40 pb-4">
      <div className="flex justify-around max-w-7xl mx-auto relative">
        {navItems.map((item) => {
          if (!item.icon) return null

          const hasSubmenu = !!item.submenu && item.submenu.length > 0
          const isActive =
            (item.href !== "#" && pathname.startsWith(item.href)) ||
            (item.submenu && item.submenu.some((sub) => pathname.startsWith(sub.href)))
          const isSubmenuOpen = openSubmenu === item.name

          return (
            <div key={item.name} className="relative flex-1">
              {/* Item Principal */}
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center text-center p-2 w-full transition-colors duration-200 ${
                  isActive ? "text-cyan-400" : "text-gray-400"
                }`}
                onMouseEnter={() => hasSubmenu && setOpenSubmenu(item.name)}
                onMouseLeave={() => hasSubmenu && setOpenSubmenu(null)}
                onClick={() => {
                  if (!hasSubmenu) {
                    setOpenSubmenu(null)
                  } else {
                    setOpenSubmenu(isSubmenuOpen ? null : item.name)
                  }
                }}
              >
                <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>

              {/* Submenu em Meia Lua */}
              {hasSubmenu && item.submenu && (
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 transition-all duration-300 ${
                    isSubmenuOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible translate-y-2 pointer-events-none"
                  }`}
                  onMouseEnter={() => setOpenSubmenu(item.name)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  {/* Meia Lua - Forma arredondada */}
                  <div className="bg-gray-800 border border-gray-700 rounded-t-3xl rounded-b-lg shadow-2xl py-3 px-2 min-w-[180px] max-w-[220px]">
                    <div className="space-y-1">
                      {item.submenu.map((subitem) => {
                        const isSubActive = pathname.startsWith(subitem.href)
                        return (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            onClick={() => setOpenSubmenu(null)}
                            className={`block px-4 py-2.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                              isSubActive
                                ? "text-cyan-300 bg-cyan-500/10 font-medium"
                                : "text-gray-300 hover:bg-gray-700 hover:text-cyan-300"
                            }`}
                          >
                            {subitem.name}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        <BottomUserMenu account={account} />
      </div>
    </nav>
  )
}

// --- Main Navigation Component ---
interface MainNavProps {
  account: Account | null
  currentUser: CurrentUser
  showBottomNav?: boolean
  onLogout?: () => void
}

export function MainNav({ account, currentUser, showBottomNav = false, onLogout }: MainNavProps) {
  const userIsLoggedIn = !!currentUser && !!account
  const navToRender =
    account?.role === "admin" ? adminNav : account?.role === "cliente" ? clientNav : mainNav

  if (showBottomNav) {
    return <BottomNavBar navItems={navToRender} account={account} />
  }

  if (userIsLoggedIn && account) {
    return <SideBar navItems={navToRender} account={account} onLogout={onLogout || (() => {})} />
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

