import React from "react";
import { Play, BookOpen, Users, Headphones, ArrowRight } from "lucide-react";

// Componente para o card de recurso com tema claro
interface LightResourceCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    action: string;
    color: "blue" | "teal" | "amber" | "red";
}

function LightResourceCard({ icon: Icon, title, description, action, color }: LightResourceCardProps) {
    const colorVariants = {
        blue: { bg: "bg-blue-100", text: "text-blue-600", shadow: "hover:shadow-blue-100" },
        teal: { bg: "bg-teal-100", text: "text-teal-600", shadow: "hover:shadow-teal-100" },
        amber: { bg: "bg-amber-100", text: "text-amber-600", shadow: "hover:shadow-amber-100" },
        red: { bg: "bg-red-100", text: "text-red-600", shadow: "hover:shadow-red-100" },
    };
    const variant = colorVariants[color] || colorVariants.blue;

    return (
        <div className={`group bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${variant.shadow}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${variant.bg}`}>
                <Icon className={`w-8 h-8 ${variant.text}`} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
            <p className="text-slate-600 mb-6 flex-grow">{description}</p>
            {/* <a href="#" className={`mt-auto font-semibold ${variant.text} inline-flex items-center justify-center group/link`}>
                {action}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </a> */}
        </div>
    );
}


export function LearningResources() {
  const resources: LightResourceCardProps[] = [
    { icon: Play, title: "Vídeos Tutoriais", description: "Aprenda através de vídeos passo a passo.", action: "Assistir Vídeos", color: "blue" },
    { icon: BookOpen, title: "Documentação", description: "Guias completos e manuais técnicos.", action: "Ler Documentação", color: "teal" },
    { icon: Users, title: "Treinamento Online", description: "Participe de sessões de treinamento ao vivo com nossos especialistas.", action: "Agendar Treinamento", color: "amber" },
    { icon: Headphones, title: "Suporte Técnico", description: "Tenha ajuda especializada sempre que precisar para qualquer dúvida.", action: "Contatar Suporte", color: "red" },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Recursos de Aprendizagem</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Tudo que você precisa para dominar o sistema e maximizar seus resultados.
          </p>
          <h3 className="mt-6"> Solicite nossos recursos de aprendizagem atrvés do botão abaixo </h3>
          <a href="/startnow" className="mt-6 inline-block bg-gradient-to-r from-blue-600 to-teal-500 text-white px-8 py-3 rounded-lg font-semibold text-lg transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/30">
            Quero Acessar os Recursos
            <ArrowRight className="ml-2 w-5 h-5 inline-block" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {resources.map((resource) => (
            <LightResourceCard key={resource.title} {...resource} />
          ))}
        </div>
      </div>
    </section>
  );
}