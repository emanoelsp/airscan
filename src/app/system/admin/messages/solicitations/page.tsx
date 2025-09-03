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
  Search,
  FileCheck, // Ícone para Revisar
  Trash2,    // Ícone para Excluir
  ArrowLeft, // Ícone para Voltar
  MessageSquare, // Ícone para Parecer/Feedback
  FileDown,  // Ícone para Baixar PDF
  CheckCircle, // Ícone para Finalizar
  Package, // Ícone do cabeçalho da página
} from "lucide-react";

// --- COMPONENTES AUXILIARES (Sem alterações) ---

function InputField({
  icon: Icon,
  id,
  name,
  label,
  type = "text",
  placeholder,
  required = true,
  defaultValue = "",
  readOnly = false,
}: {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
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
          defaultValue={defaultValue}
          readOnly={readOnly}
          className={`block w-full rounded-md border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 sm:text-sm ${
            readOnly
              ? "bg-slate-900/50 cursor-default focus:ring-slate-700"
              : "bg-slate-800/50 focus:ring-2 focus:ring-inset focus:ring-yellow-400"
          }`}
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
  defaultValue = "",
  readOnly = false,
}: {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
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
          defaultValue={defaultValue}
          readOnly={readOnly}
          className={`block w-full rounded-md border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 sm:text-sm ${
            readOnly
              ? "bg-slate-900/50 cursor-default focus:ring-slate-700"
              : "bg-slate-800/50 focus:ring-2 focus:ring-inset focus:ring-yellow-400"
          }`}
        />
      </div>
    </div>
  );
}

// --- CORREÇÃO 1: Definir uma interface para a estrutura de dados ---
interface ContractRequest {
  id: string;
  status: "pending" | "completed";
  timestamp: Date;
  contactName: string;
  phone: string;
  email: string;
  companyName: string;
  address: string;
  compressorCount: number;
  networkDescription: string;
  leakImpact: string;
  shutdownImpact: string;
  feedback?: string; // Propriedade opcional
}

// --- DADOS MOCKADOS (Agora com o tipo definido) ---

const mockRequests: ContractRequest[] = [
  {
    id: "req01",
    status: "pending",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    contactName: "Mariana Almeida",
    phone: "(11) 98765-4321",
    email: "mariana.a@metalurgica-sp.com.br",
    companyName: "Metalúrgica SP Forte",
    address: "Avenida Industrial, 789, São Paulo - SP",
    compressorCount: 15,
    networkDescription: "Rede de ar para máquinas de corte a laser e prensas hidráulicas.",
    leakImpact: "Aumento significativo no consumo de energia e perda de pressão, afetando a qualidade do corte.",
    shutdownImpact: "Parada de 50% da linha de produção, com prejuízo estimado em R$ 50.000 por hora.",
  },
  {
    id: "req02",
    status: "pending",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    contactName: "Ricardo Borges",
    phone: "(47) 99887-6655",
    email: "ricardo@plasticosul.ind.br",
    companyName: "Plásticos do Sul Ltda.",
    address: "Rua das Injetoras, 321, Joinville - SC",
    compressorCount: 8,
    networkDescription: "Alimentação de injetoras plásticas e moldes.",
    leakImpact: "Perda de eficiência no ciclo das máquinas, gerando rebarbas nas peças.",
    shutdownImpact: "Atraso na entrega de um lote grande para a indústria automobilística.",
  },
   {
    id: "req03",
    status: "completed",
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    contactName: "Juliana Paiva",
    phone: "(21) 97766-5544",
    email: "juliana.paiva@farma-rio.com",
    companyName: "Farma Rio Químicos",
    address: "Estrada do Polo, 99, Rio de Janeiro - RJ",
    compressorCount: 4,
    networkDescription: "Ar comprimido isento de óleo para embaladoras e laboratório.",
    leakImpact: "Risco de contaminação do produto final e desperdício de energia.",
    shutdownImpact: "Parada da linha de embalagem, violando prazos com distribuidores.",
    feedback: "Cliente contatado. Demonstração realizada com sucesso. Contrato gerado e enviado para assinatura."
  },
];


// --- PÁGINA PRINCIPAL DE SOLICITAÇÕES DE CONTRATO ---

export default function ContractRequestsPage() {
  const [view, setView] = useState<"list" | "review">("list");
  const [requests, setRequests] = useState<ContractRequest[]>(mockRequests);
  // --- CORREÇÃO 2: Aplicar a interface ao estado, substituindo 'any' ---
  const [selectedRequest, setSelectedRequest] = useState<ContractRequest | null>(null);

  // --- CORREÇÃO 3: Aplicar a interface ao parâmetro da função ---
  const handleReviewClick = (request: ContractRequest) => {
    setSelectedRequest(request);
    setView("review");
  };

  const handleDeleteClick = (requestId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta solicitação? A ação não pode ser desfeita.")) {
      setRequests(requests.filter((r) => r.id !== requestId));
    }
  };
  
  const handleBackToList = () => {
    setSelectedRequest(null);
    setView("list");
  };
  
  const handleFinalizeRequest = (requestId: string) => {
    alert("Solicitação finalizada! O status foi atualizado.");
    setRequests(
      requests.map((r) =>
        r.id === requestId ? { ...r, status: "completed" } : r
      )
    );
    handleBackToList();
  };

  const handleDownloadContract = () => {
    alert("Gerando e baixando o contrato em PDF...");
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-yellow-600/10 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {view === "list" && (
          <>
            <div className="md:flex md:items-center md:justify-between mb-12">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight inline-flex items-center gap-3">
                  <Package className="h-8 w-8 text-yellow-400" />
                  Solicitações de Contrato
                </h1>
                <p className="mt-2 text-lg text-slate-300">
                  Revise as solicitações de novos clientes e gerencie os contratos.
                </p>
              </div>
              <div className="mt-6 flex md:mt-0 md:ml-4">
                <div className="relative w-full max-w-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full rounded-md border-0 bg-slate-800/50 py-2.5 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
                    placeholder="Pesquisar por empresa..."
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <ul role="list" className="divide-y divide-white/10">
                {requests.map((req) => (
                  <li key={req.id} className="p-6 transition-colors hover:bg-slate-800/50 flex items-center justify-between gap-6">
                     <div className="flex-grow min-w-0">
                       <div className="flex items-center gap-x-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${req.status === 'pending' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                        <p className="text-base font-semibold leading-6 text-white">{req.companyName}</p>
                       </div>
                       <div className="mt-1 flex items-center gap-x-2 text-sm leading-5 text-slate-400">
                         <User className="h-4 w-4" />
                         <p className="truncate">{req.contactName}</p>
                       </div>
                     </div>
                     <div className="flex flex-none items-center gap-x-4">
                       <button onClick={() => handleReviewClick(req)} className="inline-flex items-center gap-x-2 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 transition-colors">
                         <FileCheck className="h-4 w-4" />
                         Revisar
                       </button>
                       <button onClick={() => handleDeleteClick(req.id)} className="rounded-full p-2.5 text-red-400 hover:text-white hover:bg-red-500/50 transition-colors">
                         <Trash2 className="h-5 w-5" />
                         <span className="sr-only">Excluir</span>
                       </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {view === "review" && selectedRequest && (
          <>
            <div className="mb-8">
               <button onClick={handleBackToList} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                 <ArrowLeft className="h-4 w-4" />
                 Voltar para a lista
               </button>
            </div>
            
             <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
                <div className="border-b border-white/10 pb-4">
                  <h1 className="text-2xl font-bold leading-7 text-white">Revisão de Solicitação</h1>
                  <p className="mt-1 text-slate-400">Cliente: {selectedRequest.companyName}</p>
                </div>

                <div className="border-b border-white/10 pb-8">
                  <h2 className="text-xl font-semibold leading-7 text-white">Informações de Contato</h2>
                  <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                    <InputField icon={User} id="contactName" name="contactName" label="Nome para contato" placeholder="" defaultValue={selectedRequest.contactName} readOnly />
                    <InputField icon={Phone} id="phone" name="phone" type="tel" label="Telefone" placeholder="" defaultValue={selectedRequest.phone} readOnly />
                    <InputField icon={Mail} id="email" name="email" type="email" label="Email" placeholder="" defaultValue={selectedRequest.email} readOnly />
                    <InputField icon={Building2} id="companyName" name="companyName" label="Nome da empresa" placeholder="" defaultValue={selectedRequest.companyName} readOnly />
                  </div>
                </div>

                <div className="border-b border-white/10 pb-8">
                  <h2 className="text-xl font-semibold leading-7 text-white">Dados para Monitoramento</h2>
                  <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2"><TextareaField icon={MapPin} id="address" name="address" label="Endereço da planta" placeholder="" defaultValue={selectedRequest.address} readOnly /></div>
                    {/* Convertendo número para string para o defaultValue do input */}
                    <InputField icon={Database} id="compressorCount" name="compressorCount" type="number" label="Quantidade de compressores" placeholder="" defaultValue={String(selectedRequest.compressorCount)} readOnly />
                    {/* CORREÇÃO BÔNUS: Corrigido 'name' e 'label' que estavam trocados e a label vazia */}
                    <div className="sm:col-span-2"><TextareaField icon={Network} id="networkDescription" name="networkDescription" label="Descrição da rede de ar" placeholder="" defaultValue={selectedRequest.networkDescription} readOnly /></div>
                  </div>
                </div>
                
                <div className="border-b border-white/10 pb-8">
                  <h2 className="text-xl font-semibold leading-7 text-white">Análise de Impacto (Relatado pelo Cliente)</h2>
                  <div className="mt-6 space-y-6">
                    <TextareaField icon={AlertTriangle} id="leakImpact" name="leakImpact" label="Impacto de vazamento de ar" placeholder="" defaultValue={selectedRequest.leakImpact} readOnly />
                    <TextareaField icon={ZapOff} id="shutdownImpact" name="shutdownImpact" label="Impacto de parada de compressor" placeholder="" defaultValue={selectedRequest.shutdownImpact} readOnly />
                  </div>
                </div>
                
                <div>
                   <h2 className="text-xl font-semibold leading-7 text-white">Parecer do Contato Realizado</h2>
                   <div className="mt-6">
                      <TextareaField icon={MessageSquare} id="feedback" name="feedback" label="Anotações e Próximos Passos" placeholder="Descreva o contato realizado, acordos, valores, e qualquer outra informação relevante..." defaultValue={selectedRequest.feedback || ''} />
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-4">
                  <button onClick={handleDownloadContract} type="button" className="flex justify-center items-center gap-2 rounded-lg bg-slate-600 px-6 py-3 text-sm font-bold leading-6 text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-500">
                    <FileDown className="h-5 w-5"/>
                    Baixar Contrato (PDF)
                  </button>
                  <button onClick={() => handleFinalizeRequest(selectedRequest.id)} type="button" className="flex justify-center items-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 text-sm font-bold leading-6 text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500">
                    <CheckCircle className="h-5 w-5"/>
                    Finalizar Solicitação
                  </button>
                </div>
             </div>
          </>
        )}

      </div>
    </main>
  );
}