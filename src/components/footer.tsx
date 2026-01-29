"use client";

import Link from "next/link";
import { Activity, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useAuth } from "@/lib/controllers/authcontroller";

interface SubMenuItem {
  name: string;
  href: string;
}

interface FooterSection {
  name: string;
  href: string;
  submenu?: SubMenuItem[];
}

export function Footer() {
  const { account, currentUser } = useAuth();
  const userIsLoggedIn = !!currentUser && !!account;

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  // Links para usuários não logados
  const publicFooterSections: FooterSection[] = [
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
        { name: "Contato", href: "/empresa#contatos" },
      ],
    },
  ];

  // Links para usuários logados (cliente)
  const clientFooterSections: FooterSection[] = [
    {
      name: "Dashboard",
      href: "/painel",
    },
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
  ];

  // Links para usuários logados (admin)
  const adminFooterSections: FooterSection[] = [
    {
      name: "Dashboard",
      href: "/administracao",
    },
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
    {
      name: "Clientes",
      href: "/administracao/clientes",
    },
  ];

  const footerSections = userIsLoggedIn
    ? account?.role === "admin"
      ? adminFooterSections
      : clientFooterSections
    : publicFooterSections;

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Coluna da Marca (ocupa 2 colunas em telas médias) */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AIRscan</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs">
              Monitoramento inteligente de ar comprimido para a Indústria 4.0.
            </p>
            <div className="flex space-x-2 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Colunas de Links */}
          {footerSections.map((section) => (
            <div key={section.name}>
              <Link href={section.href} className="text-lg font-semibold text-white hover:text-cyan-300 transition-colors">
                {section.name}
              </Link>
              {section.submenu && section.submenu.length > 0 && (
                <ul className="space-y-3 mt-4 text-sm">
                  {section.submenu.map((subitem) => (
                    <li key={subitem.name}>
                      <Link href={subitem.href} className="text-slate-400 hover:text-white transition-colors">
                        {subitem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}


        </div>

        {/* Seção da Newsletter */}
        <div className="mt-16 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Fique por dentro das novidades</h3>
            <p className="text-slate-400 text-sm mt-1">Receba atualizações sobre novos recursos e dicas de otimização.</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors">
              Inscrever
            </button>
          </form>
        </div>
      </div>

      {/* Barra de Copyright */}
      <div className="bg-slate-950/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-slate-400">© {new Date().getFullYear()} AIRscan. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}