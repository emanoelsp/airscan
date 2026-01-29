"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Menu, X, Activity } from "lucide-react"
import { useAuth, authController } from "@/lib/controllers/authcontroller"
import { MainNav } from "./mainnav"
import { MobileNav } from "./mobilenav"

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
        <MainNav account={account} currentUser={currentUser} onLogout={handleLogout} />

        {/* Conteúdo da Página */}
        <main className="md:pl-64 min-h-screen bg-slate-900">
          {children}
        </main>

        {/* Navegação Mobile Inferior */}
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


