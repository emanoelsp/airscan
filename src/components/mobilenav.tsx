"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import type { LucideProps } from "lucide-react"

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

// Navigation data
const clientNav: NavItem[] = [
  { name: "Dashboard", href: "/painel" },
  {
    name: "Rede",
    href: "/painel/rede",
    submenu: [
      { name: "Topologia da Rede", href: "/painel/rede/topologia" },
      { name: "Equipamentos da Rede", href: "/painel/rede/equipamentos" },
    ],
  },
  {
    name: "Análise",
    href: "/painel/analise",
    submenu: [
      { name: "Relatórios de Consumo", href: "/painel/analise/relatorios" },
      { name: "Análises com IA", href: "/painel/analise/inteligencia-artificial" },
    ],
  },
  {
    name: "Suporte",
    href: "/painel/suporte",
    submenu: [
      { name: "Abrir Chamado", href: "/painel/suporte/abrir-chamado" },
      { name: "Consultar Chamados", href: "/painel/suporte/consultar-chamados" },
    ],
  },
  {
    name: "Alertas",
    href: "/painel/alertas",
    submenu: [
      { name: "Configurar Contatos", href: "/painel/alertas/configurar-contatos" },
      { name: "Configurar Limites", href: "/painel/alertas/configurar-limites" },
    ],
  },
]

const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/administracao" },
  {
    name: "Rede",
    href: "/administracao/rede",
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
    submenu: [
      { name: "Relatórios de Consumo", href: "/administracao/analises/relatorios" },
      { name: "Análises com IA", href: "/administracao/analises/inteligencia-artificial" },
    ],
  },
  {
    name: "Suporte",
    href: "/administracao/suporte",
    submenu: [
      { name: "Chamados", href: "/administracao/suporte/chamados" },
      { name: "Orçamentos", href: "/administracao/suporte/orcamentos" },
      { name: "Mensagens", href: "/administracao/suporte/mensagens" },
    ],
  },
  { name: "Clientes", href: "/administracao/clientes" },
]

// --- Mobile Navigation Component ---
interface MobileNavProps {
  closeMenu: () => void
  account: Account | null
  currentUser: CurrentUser
}

export function MobileNav({ closeMenu, account, currentUser }: MobileNavProps) {
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const navItems = account?.role === "admin" ? adminNav : account?.role === "cliente" ? clientNav : []

  if (!currentUser || !account) {
    // Menu para usuários não logados
    return (
      <div className="md:hidden fixed inset-0 top-16 bg-white z-50">
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-lg border">
          <div className="pb-4 space-y-3">
            <Link
              href="/"
              onClick={closeMenu}
              className="block w-full text-center text-gray-700 hover:bg-gray-200 px-4 py-1 text-sm font-medium rounded-md transition-colors"
            >
              Início
            </Link>
            <Link
              href="/produto"
              onClick={closeMenu}
              className="block w-full text-center text-gray-700 hover:bg-gray-200 px-4 py-1 text-sm font-medium rounded-md transition-colors"
            >
              Produto
            </Link>
            <Link
              href="/recursos"
              onClick={closeMenu}
              className="block w-full text-center text-gray-700 hover:bg-gray-200 px-4 py-1 text-sm font-medium rounded-md transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="/empresa"
              onClick={closeMenu}
              className="block w-full text-center text-gray-700 hover:bg-gray-200 px-4 py-1 text-sm font-medium rounded-md transition-colors"
            >
              Empresa
            </Link>
            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full text-center text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              href="/comecar"
              onClick={closeMenu}
              className="block w-full text-center bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Comece Agora
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="md:hidden fixed inset-0 top-16 bg-slate-900 z-50 overflow-y-auto">
      <div className="p-4 space-y-2">
        {navItems.map((item) => {
          const hasSubmenu = !!item.submenu && item.submenu.length > 0
          const isActive = pathname.startsWith(item.href)
          const isSubmenuOpen = openSubmenu === item.name

          return (
            <div key={item.name} className="border-b border-gray-800 pb-2">
              {/* Item Principal - Link clicável */}
              <Link
                href={item.href}
                onClick={() => {
                  if (!hasSubmenu) {
                    closeMenu()
                  } else {
                    setOpenSubmenu(isSubmenuOpen ? null : item.name)
                  }
                }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-300 font-semibold"
                    : "text-gray-300 hover:bg-gray-800 hover:text-cyan-300"
                }`}
              >
                <span>{item.name}</span>
                {hasSubmenu && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isSubmenuOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Link>

              {/* Submenu */}
              {hasSubmenu && item.submenu && (
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isSubmenuOpen ? "max-h-[500px]" : "max-h-0"
                  }`}
                >
                  <div className="pl-4 pt-2 space-y-1">
                    {item.submenu.map((subitem) => {
                      const isSubActive = pathname.startsWith(subitem.href)
                      return (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          onClick={closeMenu}
                          className={`block px-4 py-2 rounded-md text-sm transition-colors ${
                            isSubActive
                              ? "text-cyan-300 bg-cyan-500/10 font-medium"
                              : "text-gray-400 hover:bg-gray-800 hover:text-cyan-300"
                          }`}
                        >
                          {subitem.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
