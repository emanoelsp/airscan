"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Activity, ChevronDown } from "lucide-react";

const navigation = [
  { name: "Início", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  {
    name: "Rede de Monitoramento",
    href: "/network",
    submenu: [
      { name: "Criar Nova Rede", href: "/network/create" },
      { name: "Criar Novo Ativo", href: "/network/create-asset" },
      { name: "Topologia de Ativos", href: "/network/topology" },
      { name: "Procurar Ativos", href: "/network/search" },
    ],
  },
  {
    name: "Análise de Dados",
    href: "/analysis",
    submenu: [
      { name: "Relatórios de Uso", href: "/analysis/reports" },
      { name: "Análises com IA", href: "/analysis/ai" },
    ],
  },
  { name: "Alertas", href: "/alerts" },
  { name: "Sobre", href: "/about" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primeira linha: Logo + Auth */}
        <div className="flex justify-between items-center h-16 border-b border-gray-100">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">
                AIRscan Capivaras
              </span>
              <div className="text-xs text-gray-500">Blumenau, SC</div>
            </div>
          </Link>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/startnow"
              className="hover:text-blue-950 hover:bg-white hover:border-2 hover:border-blue-950 text-white bg-blue-950 rounded-2xl px-3 py-2 text-sm font-medium"
            >
              Comece Agora
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Segunda linha: Navigation - Desktop */}
        <div className="hidden md:block">
          <nav className="flex space-x-8 h-12 items-center">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                    pathname === item.href ||
                    (item.submenu &&
                      item.submenu.some((sub) => pathname === sub.href))
                      ? "text-blue-600"
                      : ""
                  }`}
                  onMouseEnter={() =>
                    item.submenu && setActiveSubmenu(item.name)
                  }
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  {item.name}
                  {item.submenu && <ChevronDown className="w-4 h-4 ml-1" />}
                </Link>

                {/* Submenu */}
                {item.submenu && activeSubmenu === item.name && (
                  <div
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border py-1 z-50"
                    onMouseEnter={() => setActiveSubmenu(item.name)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 ${
                      pathname === item.href ? "text-blue-600" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600"
                          onClick={() => setIsOpen(false)}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2 border-t">
                <button className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                  Login
                </button>
                <button className="btn-primary w-full">Comece Agora</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
