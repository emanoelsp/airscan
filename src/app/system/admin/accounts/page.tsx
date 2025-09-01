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
  KeyRound,
  Lock,
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  X,
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
}: {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
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
  defaultValue = "",
}: {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
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
          className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
        />
      </div>
    </div>
  );
}


//  Passo 1: Definir uma interface para o objeto Cliente
interface Client {
  id: number;
  contactName: string;
  phone: string;
  email: string;
  companyName: string;
  address: string;
  compressorCount: number;
  networkDescription: string;
  login: string;
  role: "cliente" | "admin";
}

// Tipar o array de mockClients com a nova interface
const mockClients: Client[] = [
  {
    id: 1,
    contactName: "João da Silva",
    phone: "(47) 99999-9999",
    email: "joao.silva@textil.com",
    companyName: "Indústria Têxtil S.A.",
    address: "Rua Industrial, 123, Bairro, Blumenau - SC",
    compressorCount: 5,
    networkDescription: "Rede principal alimenta teares e acabamento.",
    login: "joao.silva",
    role: "cliente",
  },
  {
    id: 2,
    contactName: "Maria Oliveira",
    phone: "(11) 98888-8888",
    email: "maria.o@metalurgica.com.br",
    companyName: "Metalúrgica Forja Forte",
    address: "Avenida do Aço, 456, Distrito Industrial, São Paulo - SP",
    compressorCount: 8,
    networkDescription: "Compressores em paralelo para alimentar prensas e robôs de solda.",
    login: "maria.o",
    role: "cliente",
  },
  {
    id: 3,
    contactName: "Carlos Pereira",
    phone: "(21) 97777-7777",
    email: "carlos.p@admin.airscan",
    companyName: "AIRscan (Admin)",
    address: "N/A",
    compressorCount: 0,
    networkDescription: "N/A",
    login: "carlos.p",
    role: "admin",
  },
];


// Passo 3: Corrigir as props do ClientForm
function ClientForm({ client, onSave, onCancel }: { client: Client | null, onSave: (data: FormData) => void, onCancel: () => void }) {
  const isEditing = client !== null;
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSave(formData);
  };

  return (
     <form
      onSubmit={handleSubmit}
      className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-8"
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Editar Cliente" : "Criar Novo Cliente"}
        </h1>
        <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      {/* Seção de Contato */}
      <div className="border-b border-white/10 pb-8">
        <h2 className="text-xl font-semibold leading-7 text-white">
          Informações de Contato
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <InputField icon={User} id="contactName" name="contactName" label="Nome para contato" placeholder="João da Silva" defaultValue={client?.contactName} />
          <InputField icon={Phone} id="phone" name="phone" type="tel" label="Telefone" placeholder="(47) 99999-9999" defaultValue={client?.phone}/>
          <InputField icon={Mail} id="email" name="email" type="email" label="Email" placeholder="joao.silva@empresa.com" defaultValue={client?.email}/>
          <InputField icon={Building2} id="companyName" name="companyName" label="Nome da empresa" placeholder="Indústria Têxtil S.A." defaultValue={client?.companyName} />
        </div>
      </div>

      {/* Seção de Dados Técnicos */}
      <div className="border-b border-white/10 pb-8">
        <h2 className="text-xl font-semibold leading-7 text-white">
          Dados para Monitoramento
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextareaField icon={MapPin} id="address" name="address" label="Endereço da planta a ser monitorada" placeholder="Rua Industrial, 123, Bairro, Cidade - Estado" defaultValue={client?.address}/>
          </div>
          {/* O valor de um input numérico ainda é uma string, mas o defaultValue do tipo 'Client' é number. Convertemos para string aqui. */}
          <InputField icon={Database} id="compressorCount" name="compressorCount" type="number" label="Quantos compressores possui?" placeholder="Ex: 5" defaultValue={client?.compressorCount.toString()}/>
          <div className="sm:col-span-2">
            <TextareaField icon={Network} id="networkDescription" name="networkDescription" label="Descrição básica da sua rede de ar" placeholder="Descreva brevemente os principais pontos de uso, etc." defaultValue={client?.networkDescription}/>
          </div>
        </div>
      </div>

      {/* Seção de Credenciais de Acesso */}
      <div>
        <h2 className="text-xl font-semibold leading-7 text-white">
          Credenciais de Acesso
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
           <InputField icon={KeyRound} id="login" name="login" label="Login de Acesso" placeholder="joao.silva" defaultValue={client?.login}/>
           <InputField icon={Lock} id="password" name="password" type="password" label="Senha" placeholder="Deixe em branco para não alterar" required={!isEditing} />
           
           <div className="sm:col-span-2">
             <label className="block text-sm font-medium text-slate-300">Tipo de Usuário</label>
             <div className="mt-2 flex items-center gap-x-6">
               <div className="flex items-center gap-x-2">
                 <input id="role-cliente" name="role" type="radio" value="cliente" defaultChecked={client?.role === 'cliente' || !isEditing} className="h-4 w-4 border-slate-600 bg-slate-800 text-yellow-400 focus:ring-yellow-500" />
                 <label htmlFor="role-cliente" className="block text-sm font-medium leading-6 text-slate-300">Cliente</label>
               </div>
               <div className="flex items-center gap-x-2">
                 <input id="role-admin" name="role" type="radio" value="admin" defaultChecked={client?.role === 'admin'} className="h-4 w-4 border-slate-600 bg-slate-800 text-yellow-400 focus:ring-yellow-500" />
                 <label htmlFor="role-admin" className="block text-sm font-medium leading-6 text-slate-300">Admin</label>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Botão de Envio */}
      <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
        <button
          type="submit"
          className="flex justify-center rounded-lg bg-yellow-400 px-8 py-3 text-sm font-bold leading-6 text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
        >
          {isEditing ? "Salvar Alterações" : "Criar Cliente"}
        </button>
      </div>
    </form>
  )
}

// --- PÁGINA PRINCIPAL ---
export default function UserAccountsPage() {
  const [view, setView] = useState<"list" | "form">("list");
  // Passo 2: Corrigir o tipo do estado
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>(mockClients);

  const handleCreateClick = () => {
    setEditingClient(null);
    setView("form");
  };

  // Passo 3: Corrigir o tipo do parâmetro da função
  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setView("form");
  };

  const handleCancelForm = () => {
    setView("list");
    setEditingClient(null);
  };
  
  // Passo 4: Corrigir a função de salvar, tratando os tipos de dados do formulário
  const handleSaveForm = (formData: FormData) => {
    // Extrai e converte os dados do formulário
    const rawData = Object.fromEntries(formData.entries());
    const savedData = {
      contactName: rawData.contactName as string,
      phone: rawData.phone as string,
      email: rawData.email as string,
      companyName: rawData.companyName as string,
      address: rawData.address as string,
      compressorCount: Number(rawData.compressorCount), // Converte para número
      networkDescription: rawData.networkDescription as string,
      login: rawData.login as string,
      role: rawData.role as "cliente" | "admin",
    };

    if (editingClient) {
       // Lógica de Edição
       setClients(clients.map(c => 
         c.id === editingClient.id ? { ...c, ...savedData } : c
       ));
    } else {
       // Lógica de Criação
       const newClient: Client = { 
         id: Date.now(), 
         ...savedData 
       };
       setClients([newClient, ...clients]);
    }
    setView("list");
  };

  const handleDeleteClick = (clientId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      setClients(clients.filter(c => c.id !== clientId));
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {view === "list" ? (
          <>
            <div className="md:flex md:items-center md:justify-between mb-12">
              <div className="flex-1 min-w-0">
                 <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Gerenciamento de Clientes
                </h1>
                <p className="mt-2 text-lg text-slate-300">
                  Adicione, edite ou pesquise por clientes no sistema.
                </p>
              </div>
              <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                 <button
                  type="button"
                  className="inline-flex items-center gap-x-2 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-600"
                >
                  <Search className="h-5 w-5" />
                  Pesquisar Cliente
                </button>
                <button
                  onClick={handleCreateClick}
                  type="button"
                  className="inline-flex items-center gap-x-2 rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-yellow-500"
                >
                  <PlusCircle className="h-5 w-5" />
                  Criar Cliente
                </button>
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <ul role="list" className="divide-y divide-white/10">
                {clients.map((client) => (
                  <li key={client.id} className="flex items-center justify-between gap-x-6 p-6 hover:bg-slate-800/50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-start gap-x-3">
                        <p className="text-base font-semibold leading-6 text-white">{client.companyName}</p>
                        <p className={`rounded-md whitespace-nowrap mt-0.5 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            client.role === 'admin' 
                            ? 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/30' 
                            : 'text-blue-400 bg-blue-400/10 ring-blue-400/30'
                          }`}>
                          {client.role}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-x-2 text-sm leading-5 text-slate-400">
                        <User className="h-4 w-4" />
                        <p className="truncate">{client.contactName}</p>
                      </div>
                       <div className="mt-1 flex items-center gap-x-2 text-sm leading-5 text-slate-400">
                        <Mail className="h-4 w-4" />
                        <p className="truncate">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-x-4">
                       <button onClick={() => handleEditClick(client)} className="rounded-full p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                         <Pencil className="h-5 w-5" />
                         <span className="sr-only">Editar</span>
                       </button>
                       <button onClick={() => handleDeleteClick(client.id)} className="rounded-full p-2.5 text-red-400 hover:text-white hover:bg-red-500/50 transition-colors">
                         <Trash2 className="h-5 w-5" />
                         <span className="sr-only">Excluir</span>
                       </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <ClientForm client={editingClient} onSave={handleSaveForm} onCancel={handleCancelForm} />
        )}
      </div>
    </main>
  );
}