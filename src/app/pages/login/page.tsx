"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Activity, Shield, LayoutDashboard } from "lucide-react";
import { authController } from "@/lib/controllers/authcontroller";

// Componente para um card de feature simplificado na lateral
function FeatureHighlight({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-white/10 p-2 rounded-lg">
        <Icon className="w-6 h-6 text-yellow-300" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const account = await authController.signIn(email, password);
      
      if (account.role === 'admin') {
        router.push("/administracao");
      } else {
        router.push("/painel");
      }
    } catch (err: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown'
      // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4 overflow-hidden">
      {/* Efeito de iluminação de fundo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-white/10 shadow-2xl md:grid-cols-2 rounded-2xl">
        
        {/* Coluna da Esquerda: Propaganda da Solução */}
        <div className="hidden bg-white/5 p-8 backdrop-blur-sm md:flex md:flex-col md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Monitoramento Inteligente de
              <span className="mt-2 block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Ar Comprimido
              </span>
            </h1>
            <p className="mt-4 max-w-md text-slate-300">
              Transforme dados em economia. A plataforma{" "}
              <span className="font-semibold text-yellow-400">AIRscan</span>{" "}
              oferece a clareza que você precisa para otimizar sua operação.
            </p>
          </div>
          <div className="mt-8 space-y-6">
             <FeatureHighlight
              icon={LayoutDashboard}
              title="Estatísticas Detalhadas"
              desc="Visualize o consumo e desempenho dos seus compressores."
            />
            <FeatureHighlight
              icon={Activity}
              title="Dados em Tempo Real"
              desc="Acompanhe a performance dos seus compressores ao vivo."
            />
            <FeatureHighlight
              icon={Shield}
              title="Manutenção Preditiva"
              desc="Evite paradas inesperadas com alertas inteligentes."
            />
          </div>
        </div>

        {/* Coluna da Direita: Parte do Login */}
        <div className="bg-slate-900/80 p-8 backdrop-blur-md">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
             <h2 className="text-2xl font-bold text-white">Acesse sua Conta</h2>
             <p className="text-sm text-slate-400 mt-1">Bem-vindo! Insira seus dados.</p>
          </div>
         
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}
            {/* Campo de Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <div className="relative mt-2">
                 <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
               <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Senha
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-yellow-400 hover:text-yellow-300">
                    Esqueceu a senha?
                  </a>
                </div>
              </div>
              <div className="relative mt-2">
                 <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
                />
              </div>
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-yellow-400 px-3 py-3 text-sm font-bold leading-6 text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          {/* Link para Contratar */}
          <p className="mt-10 text-center text-sm text-slate-400">
            Não tem uma conta?{' '}
            <Link href="/startnow" className="font-semibold leading-6 text-yellow-400 hover:text-yellow-300">
              Contrate agora nossa solução
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

