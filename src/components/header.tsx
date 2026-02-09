"use client"

import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Activity, User, LogOut } from "lucide-react"
import { useAuth, authController } from "@/lib/controllers/authcontroller"
import { MainNav } from "./mainnav"
import { MobileNav } from "./mobilenav"

// --- Barra superior móvel (logo + menu usuário) ---
function MobileTopBar({
  account,
  onLogout,
}: {
  account: { role: "admin" | "cliente" }
  onLogout: () => void
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileHref = account.role === "admin" ? "/administracao/perfil" : "/painel/perfil"
  const homeHref = account.role === "admin" ? "/administracao" : "/painel"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4">
      <Link href={homeHref} className="flex items-center gap-2">
        <div className="w-9 h-9 bg-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-100">AIRscan</span>
      </Link>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setUserMenuOpen((v) => !v)}
          onMouseEnter={() => setUserMenuOpen(true)}
          className="p-2 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-gray-800 transition-colors"
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          <User className="w-6 h-6" />
          <span className="sr-only">Menu do usuário</span>
        </button>
        {userMenuOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-48 py-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
            onMouseLeave={() => setUserMenuOpen(false)}
          >
            <Link
              href={profileHref}
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
            >
              <User className="w-4 h-4" />
              Perfil
            </Link>
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false)
                onLogout()
              }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// --- Main Header Component ---
export function Header({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const { account, currentUser } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authController.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const userIsLoggedIn = !!currentUser && !!account

  if (userIsLoggedIn) {
    // --- LAYOUT LOGADO ---
    return (
      <>
        {/* Barra lateral (desktop) */}
        <MainNav account={account} currentUser={currentUser} onLogout={handleLogout} />

        {/* Barra superior móvel: logo à esquerda, ícone usuário à direita (só em mobile) */}
        <MobileTopBar account={account} onLogout={handleLogout} />

        {/* Conteúdo: padding-top no mobile para a barra superior; padding-bottom no mobile para o menu inferior; padding-left no desktop para a sidebar */}
        <main className="pt-14 pb-24 md:pt-0 md:pb-0 md:pl-64 min-h-screen bg-slate-900">
          {children}
        </main>

        {/* Navegação mobile inferior */}
        <MainNav account={account} currentUser={currentUser} showBottomNav onLogout={handleLogout} />
      </>
    )
  }

  // --- LAYOUT NÃO LOGADO ---
  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">AIRscan</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium">
                Login
              </Link>
              <Link href="/comecar" className="bg-blue-600 text-white px-5 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-all">
                Comece Agora
              </Link>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 rounded-md">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          <MainNav account={account} currentUser={currentUser} />
        </div>
        {isOpen && (
          <MobileNav
            closeMenu={() => setIsOpen(false)}
            account={account}
            currentUser={currentUser}
          />
        )}
      </header>
      <main>
        {children}
      </main>
    </>
  )
}


