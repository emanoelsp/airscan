"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Database,
  Network,
  AlertTriangle,
  ZapOff,
} from "lucide-react";

// Importa o novo controller e os alertas
import solicitationsController, { SolicitationData } from "@/lib/controllers/solicitationscontroller";
import * as AccountAlerts from "@/components/allerts/accountsallert";

// --- Componentes Auxiliares (InputField e TextareaField) ---
// (Sem alterações, continuam os mesmos)

function InputField({
  icon: Icon,
  id,
  name,
  label,
  type = "text",
  placeholder,
  required = true,
}: {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
        />
      </div>
    </div>
  );
}

function TextareaField({
  icon: Icon,
  id,
  name,
  label,
  placeholder,
  required = true,
}: {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-4 w-5 h-5 text-slate-400" />
        <textarea
          id={id}
          name={name}
          required={required}
          rows={4}
          placeholder={placeholder}
          className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
        />
      </div>
    </div>
  );
}


export default function GetStartedPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    // CORREÇÃO: Pega a referência do formulário antes do 'await'
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const data: SolicitationData = {
      contactName: formData.get("contactName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      companyName: formData.get("companyName") as string,
      address: formData.get("address") as string,
      compressorCount: Number(formData.get("compressorCount")),
      networkDescription: formData.get("networkDescription") as string,
      leakImpact: formData.get("leakImpact") as string,
      shutdownImpact: formData.get("shutdownImpact") as string,
    };

    try {
      await solicitationsController.createSolicitation(data);
      await AccountAlerts.confirmAction({
        title: "Solicitação Enviada!",
        text: "Obrigado pelo seu interesse. Nossa equipe entrará em contato em breve.",
        icon: "info",
        confirmButtonText: "Entendido",
      });
      // Limpa o formulário usando a referência salva
      form.reset();
    } catch (error: unknown) {
      console.error("Erro no formulário:", error);
      if (error instanceof Error) {
        AccountAlerts.showError(error.message);
      } else {
        AccountAlerts.showError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      {/* Efeito de iluminação de fundo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Cabeçalho da Página */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Comece a Transformar sua Operação
            <span className="mt-2 block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              com AIRscan
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
            Preencha o formulário e nossa equipe entrará em contato para agendar
            uma demonstração e entender suas necessidades.
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleRequest}
          className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-8"
        >
          {/* Seção de Contato */}
          <div className="border-b border-white/10 pb-8">
            <h2 className="text-xl font-semibold leading-7 text-white">
              Informações de Contato
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <InputField icon={User} id="contactName" name="contactName" label="Nome para contato" placeholder="João da Silva" />
              <InputField icon={Phone} id="phone" name="phone" type="tel" label="Telefone" placeholder="(47) 99999-9999" />
              <InputField icon={Mail} id="email" name="email" type="email" label="Email" placeholder="joao.silva@empresa.com" />
              <InputField icon={Building2} id="companyName" name="companyName" label="Nome da empresa" placeholder="Indústria Têxtil S.A." />
            </div>
          </div>

          {/* Seção de Dados Técnicos */}
          <div className="border-b border-white/10 pb-8">
            <h2 className="text-xl font-semibold leading-7 text-white">
              Dados para Monitoramento
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextareaField icon={MapPin} id="address" name="address" label="Endereço da planta a ser monitorada" placeholder="Rua Industrial, 123, Bairro, Cidade - Estado" />
              </div>
              <InputField icon={Database} id="compressorCount" name="compressorCount" type="number" label="Quantos compressores possui?" placeholder="Ex: 5" />
              <div className="sm:col-span-2">
                <TextareaField icon={Network} id="networkDescription" name="networkDescription" label="Descrição básica da sua rede de ar" placeholder="Descreva brevemente os principais pontos de uso, tipos de máquinas, etc." />
              </div>
            </div>
          </div>
          
          {/* Seção Qualitativa */}
          <div>
            <h2 className="text-xl font-semibold leading-7 text-white">
              Análise de Impacto
            </h2>
            <div className="mt-6 space-y-6">
               <TextareaField icon={AlertTriangle} id="leakImpact" name="leakImpact" label="Qual o impacto de um vazamento de ar em sua produção?" placeholder="Ex: Perda de pressão nas máquinas, aumento na conta de energia..." />
               <TextareaField icon={ZapOff} id="shutdownImpact" name="shutdownImpact" label="Qual o impacto de uma parada inesperada de um compressor?" placeholder="Ex: Parada total da linha de produção, atrasos na entrega..." />
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex justify-center rounded-lg bg-yellow-400 px-8 py-3 text-sm font-bold leading-6 text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

