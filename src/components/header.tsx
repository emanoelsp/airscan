"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Menu, X, Shield, User, LogOut, UserCog, ChevronDown, Activity } from "lucide-react"
import { useAuth, authController } from "@/lib/controllers/authcontroller"
import { MainNav } from "./mainnav"
import { MobileNav } from "./mobilenav"

// --- Type Definitions ---
interface Account {
  role: "admin" | "cliente"
  contactName: string
}

// --- User Menu Component ---
const UserMenu = ({ account, onLogout }: { account: Account | null; onLogout: () => void }) => {
  if (!account) return null

  const isAdmin = account.role === "admin"
  const theme = {
    color: isAdmin ? "text-red-600" : "text-blue-600",
    hoverBg: isAdmin ? "hover:bg-red-50" : "hover:bg-blue-50",
  }

  return (
    <div className="relative group">
      <div className={`flex items-center gap-2 text-sm font-semibold p-2 rounded-md cursor-pointer ${theme.color}`}>
        {isAdmin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
        <span>Olá, {account.contactName.split(" ")[0]}</span>
        <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
      </div>
      <div
        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-lg border py-1 z-50
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2"
      >
        <Link
          href={isAdmin ? "/system/admin/profile" : "/client/profile"}
          className={`flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 ${theme.hoverBg} hover:${theme.color}`}
        >
          <UserCog className="w-4 h-4" />
          <span>Meu Perfil</span>
        </Link>
        <button
          onClick={onLogout}
          className={`flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 ${theme.hoverBg} hover:${theme.color}`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
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
        {/* Barra Lateral (renderizada pelo MainNav) */}
        <MainNav account={account} currentUser={currentUser} />

        {/* Header Superior */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-30 md:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between md:justify-end items-center h-16">
              {/* Logo e Botão de Menu para Mobile */}
             
              <div className="md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 rounded-md">
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Menu do Usuário para Desktop */}
              <div className="hidden md:flex items-center">
                <UserMenu account={account} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="md:pl-64">
          {children}
        </main>

        {/* Navegação Mobile Inferior */}
        <MainNav account={account} currentUser={currentUser} showBottomNav />

        {/* Menu Mobile que abre ao clicar no botão */}
        {isOpen && (
          <MobileNav
            closeMenu={() => setIsOpen(false)}
            account={account}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}
      </>
    )
  }

  // --- LAYOUT NÃO LOGADO ---
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
            onLogout={handleLogout}
          />
        )}
      </header>
      <main>
        {children}
      </main>
    </>
  )
}


