"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  Activity, 
  ChevronDown, 
  User, 
  Shield, 
  LogOut, 
  LayoutDashboard,
  Network,
  BarChart2,
  LifeBuoy,
  Bell,
  Users,
  Ticket,
  UserCog
} from "lucide-react";
import { useAuth, authController } from "@/lib/controllers/authcontroller";

// --- Tipos de Navegação ---
interface SubMenuItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  submenu?: SubMenuItem[];
  icon?: React.ElementType;
}

// --- Estruturas de Navegação (Com Ícones) ---
const mainNav: NavItem[] = [
  { name: "Início", href: "/" },
  { name: "Produto", href: "/product" },
  { name: "Recursos", href: "/resources" },
  { name: "Empresa", href: "/about" },
];

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
    href: "#",
    icon: BarChart2,
    submenu: [
      { name: "Relatórios de Consumo", href: "/client/analysis/reports" },
      { name: "Análises com IA", href: "/client/analysis/ai" },
    ],
  },
  {
    name: "Suporte",
    href: "#",
    icon: LifeBuoy,
    submenu: [
      { name: "Abrir chamados", href: "/system/client/tickets/create-ticket" },
      { name: "Consultar chamados", href: "/system/client/tickets/search-ticket" },
    ],
  },
  {
    name: "Alertas",
    href: "#",
    icon: Bell,
    submenu: [
      { name: "Painel de Alertas", href: "/client/alerts/panel" },
      { name: "Configurar Dispositivo", href: "/client/alerts/configure" },
    ],
  },
];

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
    href: "#",
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
];

// --- Componente do Cabeçalho ---
export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { account, currentUser } = useAuth(); // Usando o hook de autenticação real
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authController.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const navToRender = account?.role === 'admin' ? adminNav : (account?.role === 'cliente' ? clientNav : mainNav);
  const userIsLoggedIn = !!currentUser && !!account;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">AIRscan</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {userIsLoggedIn ? (
                <UserMenu account={account} onLogout={handleLogout} />
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300">
                    Login
                  </Link>
                  <Link href="/startnow" className="bg-blue-600 text-white px-5 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-all duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5">
                    Comece Agora
                  </Link>
                </>
              )}
            </div>
            
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Abrir menu</span>
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          <div className="hidden md:block">
            {userIsLoggedIn ? (
              <div className={`border-t ${account.role === 'admin' ? 'border-red-100' : 'border-gray-100'}`}>
                <nav className="flex items-center h-12 space-x-8">
                  {navToRender.map((item) => (
                    <NavLink key={item.name} item={item} isAdmin={account.role === 'admin'} />
                  ))}
                </nav>
              </div>
            ) : (
              <div className="border-t border-gray-100">
                <nav className="flex items-center h-12 space-x-8">
                  {mainNav.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
        
        {isOpen && <MobileMenu closeMenu={() => setIsOpen(false)} account={account} currentUser={currentUser} onLogout={handleLogout} />}
      </header>
      
      {userIsLoggedIn && <BottomNavBar navItems={navToRender} />}
    </>
  );
}

const UserMenu = ({ account, onLogout }: { account: any, onLogout: () => void }) => {
  if (!account) return null;
  const isAdmin = account.role === 'admin';
  const themeColor = isAdmin ? 'text-red-600' : 'text-blue-600';
  const themeHoverBg = isAdmin ? 'hover:bg-red-50' : 'hover:bg-blue-50';

  return (
    <div className="relative group">
      <div className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-md cursor-pointer  ${themeColor}`}>
        {isAdmin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
        <span>Olá, {account.contactName.split(' ')[0]}</span>
        <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
      </div>
      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-lg border py-1 z-50
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
        <Link href={isAdmin ? "/system/admin/profile" : "/client/profile"} className={`flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 ${themeHoverBg} hover:${themeColor}`}>
          <UserCog className="w-4 h-4" />
          <span>Meu Perfil</span>
        </Link>
        <button onClick={onLogout} className={`flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 ${themeHoverBg} hover:${themeColor}`}>
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

const NavLink = ({ item, isAdmin = false }: { item: NavItem, isAdmin?: boolean }) => {
  const pathname = usePathname();
  const hasSubmenu = !!item.submenu && item.submenu.length > 0;
  const baseColor = "text-gray-600";
  const hoverColor = isAdmin ? "hover:text-red-600" : "hover:text-blue-600";
  const activeColor = isAdmin ? "text-red-600" : "text-blue-600";
  const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname === sub.href));

  return (
    <div className="relative group h-full flex items-center">
      <Link href={item.href} className={`flex items-center text-sm font-medium transition-colors duration-300 ${isActive ? activeColor : `${baseColor} ${hoverColor}`}`}>
        {item.name}
        {hasSubmenu && <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" />}
      </Link>
      {hasSubmenu && (
        <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-md shadow-lg border py-2 z-50
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
          {item.submenu?.map((subitem) => (
            <Link key={subitem.name} href={subitem.href}
              className={`block px-4 py-2 text-sm ${pathname === subitem.href ? activeColor : 'text-gray-700'} ${hoverColor} hover:bg-gray-50`}>
              {subitem.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const MobileMenu = ({ closeMenu, account, currentUser, onLogout }: { closeMenu: () => void, account: any, currentUser: any, onLogout: () => void }) => {
  return (
    <div className="md:hidden fixed inset-0 top-16 bg-white z-50">
      <div className="space-y-4 bg-white p-4 rounded-lg shadow-lg border">
        {currentUser && account ? (
          <div className="border-b pb-4 space-y-3">
            <div className={`flex items-center gap-3 font-semibold ${account.role === 'admin' ? 'text-red-700' : 'text-blue-700'}`}>
              {account.role === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
              <span className="text-base text-gray-800">Olá, {account.contactName}</span>
            </div>
            <button onClick={() => { onLogout(); closeMenu(); }} className="w-full flex items-center justify-center gap-2 text-gray-600 bg-gray-100 hover:bg-gray-200 p-3 text-sm font-medium rounded-md transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        ) : (
          <div className="border-b pb-4 space-y-3">
            <Link href="/login" onClick={closeMenu} className="block w-full text-center text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-3 text-sm font-medium rounded-md transition-colors">
              Login
            </Link>
            <Link href="/startnow" onClick={closeMenu} className="block w-full text-center bg-blue-600 text-white px-4 py-3 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
              Comece Agora
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const BottomNavBar = ({ navItems }: { navItems: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around max-w-7xl mx-auto">
        {navItems.map((item) => {
          if (!item.icon) return null;
          
          const isActive = pathname === item.href || (item.submenu && item.submenu.some(sub => pathname.startsWith(sub.href)));
          
          return (
            <Link
              key={item.name}
              href={item.submenu ? item.submenu[0].href : item.href}
              className={`flex flex-col items-center justify-center text-center p-2 w-full transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

