"use client"
import Link from "next/link"
import { Shield, User, LogOut } from "lucide-react"

// --- Type Definitions ---
interface Account {
  role: "admin" | "cliente"
  contactName: string
}

type CurrentUser = object | null

// --- Mobile Navigation Component ---
interface MobileNavProps {
  closeMenu: () => void
  account: Account | null
  currentUser: CurrentUser
  onLogout: () => void
}

export function MobileNav({ closeMenu, account, currentUser, onLogout }: MobileNavProps) {
  return (
    <div className="md:hidden fixed inset-0 top-16 bg-white z-50">
      <div className="space-y-4 bg-white p-4 rounded-lg shadow-lg border">
        {currentUser && account ? (
          <div className="border-b pb-4 space-y-3">
            <div
              className={`flex items-center gap-3 font-semibold ${account.role === "admin" ? "text-red-700" : "text-blue-700"}`}
            >
              {account.role === "admin" ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
              <span className="text-base text-gray-800">Olá, {account.contactName}</span>
            </div>
            <button
              onClick={() => {
                onLogout()
                closeMenu()
              }}
              className="w-full flex items-center justify-center gap-2 text-gray-600 bg-gray-100 hover:bg-gray-200 p-3 text-sm font-medium rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
