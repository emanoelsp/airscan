"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Activity, ChevronDown, User, Shield, LogOut } from "lucide-react"
import { useAuth, authController } from "@/lib/controllers/authcontroller" // 1. Importar o hook de autenticação

// --- Tipos de Navegação (Sem alterações) ---
interface SubMenuItem {
  name: string
  href: string
}
interface NavItem {
  name: string
  href: string
  submenu?: SubMenuItem[]
}

// --- Estruturas de Navegação (Agora com tipos) ---

// 1. Navegação Principal (Pública)
const mainNav: NavItem[] = [
  { name: "Início", href: "/" },
  { name: "Produto", href: "/product" },
  { name: "Recursos", href: "/resources" },
  { name: "Empresa", href: "/about" },
]

// 2. Navegação do Cliente
const clientNav: NavItem[] = [
  { name: "Dashboard", href: "/client/dashboard" },
  {
    name: "Rede de Monitoramento",
    href: "#",
    submenu: [
      { name: "Topologia da Rede", href: "/client/network/topology" },
      { name: "Equipamentos da Rede", href: "/client/network/devices" },
    ],
  },
  {
    name: "Análise de Dados",
    href: "#",
    submenu: [
      { name: "Relatórios de Consumo", href: "/client/analysis/reports" },
      { name: "Análises com IA", href: "/client/analysis/ai" },
    ],
  },
  {
    name: "Alertas",
    href: "#",
    submenu: [
      { name: "Painel de Alertas", href: "/client/alerts/panel" },
      { name: "Configurar Dispositivo", href: "/client/alerts/configure" },
    ],
  },
]

// 3. Navegação do Administrador
const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/system/admin/dashboard" },
  {
    name: "Rede de Monitoramento",
    href: "/system/admin/network",
    submenu: [
      { name: "Criar Nova Rede", href: "/system/admin/network/create-network" },
      { name: "Criar Novo Equipamento", href: "/system/admin/assets/create-asset" },
      { name: "Visualizar Rede", href: "/system/admin/network/search-network" },
      { name: "Visualizar Equipamento", href: "/system/admin/assets/view-asset" },
    ],
  },
  {
    name: "Análises de Dados",
    href: "#",
    submenu: [
      { name: "Relatórios de Consumo", href: "/system/admin/analysis/reports" },
      { name: "Análises com IA", href: "/system/admin/analysis/ai" },
    ],
  },
  {
    name: "Suporte",
    href: "#",
    submenu: [
      { name: "Chamados", href: "/system/admin/tickets" },
      { name: "Orçamentos", href: "/system/admin/requests" },
      { name: "Mensagens", href: "/system/admin/messages" },
    ],
  },
  { name: "Clientes", href: "/system/admin/accounts" },
]


// --- Componente do Cabeçalho ---
export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { account, currentUser } = useAuth() // 2. Acessar os dados do usuário logado
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authController.signOut()
      // Redireciona para a página de login após o logout
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Opcional: mostrar um alerta de erro
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Container Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Linha Superior: Logo e Autenticação */}
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">AIRscan</span>
              <div className="text-xs text-gray-500">Blumenau, SC</div>
            </div>
          </Link>

          {/* 3. Renderização Condicional: Logado vs Deslogado */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && account ? (
              // -- Exibição quando ESTÁ LOGADO --
              <>
                <div className={`flex items-center gap-2 text-sm font-semibold ${account.role === 'admin' ? 'text-red-700' : 'text-blue-700'
                  }`}
                >
                  {account.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  <span>Olá, {account.contactName.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium rounded-md transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden lg:inline">Sair</span>
                </button>
              </>
            ) : (
              // -- Exibição quando NÃO ESTÁ LOGADO --
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium rounded-md transition-colors">
                  Login
                </Link>
                <Link href="/startnow" className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  Comece Agora
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navegação Principal - Desktop */}
        {!currentUser && (
          <div className="hidden md:block border-t border-gray-100">
            <nav className="flex items-center h-12 space-x-6">
              {mainNav.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* 4. Barras de Navegação Condicionais (Baseado no 'role') */}

      {/* Barra do Cliente */}
      {currentUser && account?.role === 'cliente' && (
        <div className="hidden md:block bg-slate-50 border-t border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-12 space-x-6">
              {clientNav.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Barra do Admin */}
      {currentUser && account?.role === 'admin' && (
        <div className="hidden md:block bg-red-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center h-12 space-x-6">
              {adminNav.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Menu Mobile */}
      {isOpen && <MobileMenu closeMenu={() => setIsOpen(false)} />}
    </header>
  )
}

// --- Sub-componentes ---

const NavLink = ({ item }: { item: NavItem }) => {
  const pathname = usePathname()
  const [isActive, setIsActive] = useState(false)
  const hasSubmenu = !!item.submenu

  return (
    <div className="relative" onMouseEnter={() => setIsActive(true)} onMouseLeave={() => setIsActive(false)}>
      <Link href={item.href} className={`flex items-center text-sm font-medium transition-colors ${pathname === item.href ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}>
        {item.name}
        {hasSubmenu && <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isActive ? "rotate-180" : ""}`} />}
      </Link>
      {hasSubmenu && isActive && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg border py-1 z-50">
          {item.submenu?.map((subitem) => (
            <Link key={subitem.name} href={subitem.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
              {subitem.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// 5. Componente do Menu Mobile ATUALIZADO
const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
  const { account, currentUser } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authController.signOut()
      closeMenu()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t py-4 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">

        {/* Seção do Usuário Logado ou Botões de Login */}
        {currentUser && account ? (
          <div className="border-b pb-4 space-y-3">
            <div className={`flex items-center gap-3 font-semibold ${account.role === 'admin' ? 'text-red-700' : 'text-blue-700'
              }`}
            >
              {account.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
              <span className="text-base text-gray-800">Olá, {account.contactName}</span>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 text-sm font-medium rounded-md transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        ) : (
          <div className="border-b pb-4 space-y-2">
            <Link href="/login" onClick={closeMenu} className="block text-base text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link href="/startnow" onClick={closeMenu} className="block w-full text-center bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
              Comece Agora
            </Link>
          </div>
        )}

        {/* Navegação Condicional no Mobile */}
        {!currentUser && (
          <>
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Menu</h3>
            {mainNav.map((item) => (
              <MobileNavLink key={item.name} item={item} closeMenu={closeMenu} />
            ))}
          </>
        )}
        {account?.role === 'cliente' && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Cliente</h3>
            {clientNav.map((item) => (
              <MobileNavLink key={item.name} item={item} closeMenu={closeMenu} />
            ))}
          </div>
        )}
        {account?.role === 'admin' && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Admin</h3>
            {adminNav.map((item) => (
              <MobileNavLink key={item.name} item={item} closeMenu={closeMenu} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const MobileNavLink = ({ item, closeMenu }: { item: NavItem; closeMenu: () => void }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const hasSubmenu = !!item.submenu

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault()
      setSubmenuOpen(!submenuOpen)
    } else {
      closeMenu()
    }
  }

  return (
    <div>
      <Link href={item.href} onClick={handleClick} className="flex justify-between items-center py-2 text-base font-medium text-gray-700 hover:text-blue-600">
        <span>{item.name}</span>
        {hasSubmenu && <ChevronDown className={`w-5 h-5 transition-transform ${submenuOpen ? "rotate-180" : ""}`} />}
      </Link>
      {hasSubmenu && submenuOpen && (
        <div className="pl-4 border-l-2 ml-2">
          {item.submenu?.map((subitem) => (
            <Link key={subitem.name} href={subitem.href} onClick={closeMenu} className="block py-2 text-sm text-gray-600 hover:text-blue-600">
              {subitem.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

