import Link from "next/link";
import { Activity, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  const footerSections = {
    produto: [
      { name: "Dashboard", href: "/product#dashboard" },
      { name: "Recursos", href: "/product#recursos" },
      { name: "Planos", href: "/product#planos" },
      { name: "Segurança", href: "/product#seguranca" },
    ],
    recursos: [
      { name: "Central de Ajuda", href: "/resources#help" },
      { name: "Documentação", href: "/resources#learning" },
      { name: "Suporte", href: "/resources#support" },
    ],
    empresa: [
      { name: "Sobre Nós", href: "/about#about" },
      { name: "Perguntas Frequentes", href: "/about#faq" },
      { name: "Contato", href: "/about#contact" },
    ],

  };

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
          <div>
            <Link href="/product" className="text-lg font-semibold text-white">Produto</Link>
            <ul className="space-y-3 mt-4 text-sm">
              {footerSections.produto.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link href="/resources" className="text-lg font-semibold text-white">Recursos</Link>
            <ul className="space-y-3 mt-4 text-sm">
              {footerSections.recursos.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link href="/about" className="text-lg font-semibold text-white">Empresa</Link>
            <ul className="space-y-3 mt-4 text-sm">
              {footerSections.empresa.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


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