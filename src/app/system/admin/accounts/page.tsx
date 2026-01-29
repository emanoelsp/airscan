"use client";

import { useState, useEffect, ReactElement } from "react";
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
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import accountsController, { Account, UpdateAccountData, NewAccountData } from "@/lib/controllers/accountscontroller";
import * as AccountAlerts from "@/components/allerts/accountsallert";

// --- COMPONENTES AUXILIARES ---

// Tipo para as props do InputField
type InputFieldProps = {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
};

function InputField({
  icon: Icon,
  id,
  name,
  label,
  type = "text",
  placeholder,
  required = true,
  defaultValue = "",
}: InputFieldProps): ReactElement {
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

// Tipo para as props do TextareaField
type TextareaFieldProps = {
    icon: React.ElementType;
    id: string;
    name: string;
    label: string;
    placeholder: string;
    required?: boolean;
    defaultValue?: string;
};

function TextareaField({
  icon: Icon,
  id,
  name,
  label,
  placeholder,
  required = true,
  defaultValue = "",
}: TextareaFieldProps): ReactElement {
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

function ClientForm({
  client,
  onSave,
  onCancel,
  onDeactivate,
  onActivate,
}: {
  client: Account | null;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
}) {
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
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-slate-700 transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

       {/* Seção de Contato */}
       <div className="border-b border-white/10 pb-8">
        <h2 className="text-xl font-semibold leading-7 text-white">Informações de Contato</h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <InputField icon={User} id="contactName" name="contactName" label="Nome para contato" placeholder="João da Silva" defaultValue={client?.contactName ?? ''} />
          <InputField icon={Phone} id="phone" name="phone" type="tel" label="Telefone" placeholder="(47) 99999-9999" defaultValue={client?.phone ?? ''} />
          <InputField icon={Mail} id="email" name="email" type="email" label="Email" placeholder="joao.silva@empresa.com" defaultValue={client?.email ?? ''} />
          <InputField icon={Building2} id="companyName" name="companyName" label="Nome da empresa" placeholder="Indústria Têxtil S.A." defaultValue={client?.companyName ?? ''} />
        </div>
      </div>

      {/* Seção de Dados Técnicos */}
      <div className="border-b border-white/10 pb-8">
        <h2 className="text-xl font-semibold leading-7 text-white">Dados para Monitoramento</h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextareaField icon={MapPin} id="address" name="address" label="Endereço da planta a ser monitorada" placeholder="Rua Industrial, 123, Bairro, Cidade - Estado" defaultValue={client?.address ?? ''} />
          </div>
          <InputField icon={Database} id="compressorCount" name="compressorCount" type="number" label="Quantos compressores possui?" placeholder="Ex: 5" defaultValue={client?.compressorCount?.toString() ?? ''} />
          <div className="sm:col-span-2">
            <TextareaField icon={Network} id="networkDescription" name="networkDescription" label="Descrição básica da sua rede de ar" placeholder="Descreva brevemente os principais pontos de uso, etc." defaultValue={client?.networkDescription ?? ''} />
          </div>
        </div>
      </div>

      {/* Seção de Credenciais de Acesso */}
      <div>
        <h2 className="text-xl font-semibold leading-7 text-white">Credenciais de Acesso</h2>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <InputField icon={KeyRound} id="login" name="login" label="Login de Acesso" placeholder="joao.silva" defaultValue={client?.login ?? ''} />
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
      <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
        <div>
          {isEditing && client?.status === 'active' && onDeactivate && (
            <button
              type="button"
              onClick={onDeactivate}
              className="flex items-center gap-x-2 rounded-lg bg-red-600/20 px-4 py-3 text-sm font-bold text-red-400 ring-1 ring-inset ring-red-500/30 transition-all hover:bg-red-600/30"
            >
              <ToggleLeft className="h-5 w-5" />
              Desativar Cliente
            </button>
          )}
          {isEditing && client?.status === 'inactive' && onActivate && (
            <button
              type="button"
              onClick={onActivate}
              className="flex items-center gap-x-2 rounded-lg bg-green-600/20 px-4 py-3 text-sm font-bold text-green-400 ring-1 ring-inset ring-green-500/30 transition-all hover:bg-green-600/30"
            >
              <ToggleRight className="h-5 w-5" />
              Ativar Cliente
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-x-4">
          {isEditing && (
             <button type="button" onClick={onCancel} className="rounded-lg px-8 py-3 text-sm font-bold text-slate-300 transition-all hover:bg-slate-700">
                Cancelar
             </button>
          )}
          <button
            type="submit"
            className="flex justify-center rounded-lg bg-yellow-400 px-8 py-3 text-sm font-bold leading-6 text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
          >
            {isEditing ? "Salvar Alterações" : "Criar Cliente"}
          </button>
        </div>
      </div>
    </form>
  )
}

// --- PÁGINA PRINCIPAL ---
export default function UserAccountsPage() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editingClient, setEditingClient] = useState<Account | null>(null);
  const [clients, setClients] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "inactive" | "admin">(
    "active"
  );

  const refreshClients = async () => {
    try {
      const fetchedClients = await accountsController.getAccounts();
      setClients(fetchedClients);
    } catch (error) {
      console.error("Falha ao recarregar os clientes.", error);
      AccountAlerts.showError("Falha ao carregar os clientes.");
    }
  };

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      await refreshClients();
      setIsLoading(false);
    };
    loadAccounts();
  }, []);

  const handleCreateClick = () => {
    setEditingClient(null);
    setView("form");
  };

  const handleEditClick = (client: Account) => {
    setEditingClient(client);
    setView("form");
  };

  const handleCancelForm = () => {
    setView("list");
    setEditingClient(null);
  };

  const handleSaveForm = async (formData: FormData) => {
    const rawData = Object.fromEntries(formData.entries());
    if ('password' in rawData && !rawData.password) {
      delete rawData.password;
    }

    // CORREÇÃO: Ajustado o tipo para incluir a propriedade opcional 'password' que vem do formulário.
    const savedData = { ...rawData, compressorCount: Number(rawData.compressorCount) } as UpdateAccountData & { password?: string };

    try {
      if (editingClient) {
        await accountsController.updateAccount(editingClient.id, savedData);
        AccountAlerts.showSuccess("Cliente atualizado com sucesso!");
      } else {
        if (!savedData.password) {
          AccountAlerts.showError("O campo de senha é obrigatório para novos clientes.");
          return;
        }
        await accountsController.createAccount(savedData as NewAccountData);
        AccountAlerts.showSuccess("Cliente criado com sucesso!");
      }
      await refreshClients();
      setView("list");
    } catch (error) {
      console.error(error);
      AccountAlerts.showError("Ocorreu um erro ao salvar o cliente.");
    }
  };

  const handleDeactivate = async () => {
    if (!editingClient) return;
    
    const confirmed = await AccountAlerts.confirmAction({
        title: "Desativar Cliente?",
        text: `Tem certeza que deseja desativar ${editingClient.companyName}? O acesso dele será bloqueado.`,
        confirmButtonText: "Sim, desativar"
    });

    if (confirmed) {
      try {
        await accountsController.updateAccount(editingClient.id, { status: 'inactive' });
        AccountAlerts.showSuccess("Cliente desativado com sucesso.");
        await refreshClients();
        setView("list");
      } catch {
        AccountAlerts.showError("Erro ao desativar cliente.");
      }
    }
  };

  const handleActivate = async () => {
    if (!editingClient) return;

    const confirmed = await AccountAlerts.confirmAction({
        title: "Reativar Cliente?",
        text: `Tem certeza que deseja reativar ${editingClient.companyName}?`,
        confirmButtonText: "Sim, reativar",
        icon: 'info'
    });

    if (confirmed) {
      try {
        await accountsController.updateAccount(editingClient.id, { status: 'active' });
        AccountAlerts.showSuccess("Cliente ativado com sucesso.");
        await refreshClients();
        setView("list");
      } catch {
        AccountAlerts.showError("Erro ao ativar cliente.");
      }
    }
  };

  const handleDeleteClick = async (client: Account) => {
    const confirmed = await AccountAlerts.confirmDelete(client.companyName);

    if (confirmed) {
      try {
        await accountsController.deleteAccount(client.id);
        AccountAlerts.showSuccess("Cliente excluído com sucesso!");
        setClients(clients.filter(c => c.id !== client.id));
      } catch (error) {
        console.error(error);
        AccountAlerts.showError("Erro ao excluir o cliente.");
      }
    }
  };
  
  if (isLoading) {
    return (
        <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </main>
    );
  }

  const activeClients = clients.filter(
    (account) => account.role === "cliente" && account.status === "active"
  );
  const inactiveClients = clients.filter(
    (account) => account.role === "cliente" && account.status === "inactive"
  );
  const adminUsers = clients.filter((account) => account.role === "admin");

  const StatusBadge = ({ account }: { account: Account }) => (
    <p
      className={`rounded-md whitespace-nowrap mt-0.5 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        account.status === "active"
          ? "text-green-400 bg-green-400/10 ring-green-400/30"
          : "text-slate-400 bg-slate-400/10 ring-slate-400/30"
      }`}
    >
      {account.status === "active" ? "Ativo" : "Inativo"}
    </p>
  );

  const RoleBadge = ({ account }: { account: Account }) => (
    <p
      className={`rounded-md whitespace-nowrap mt-0.5 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        account.role === "admin"
          ? "text-yellow-400 bg-yellow-400/10 ring-yellow-400/30"
          : "text-blue-300 bg-blue-400/10 ring-blue-300/30"
      }`}
    >
      {account.role === "admin" ? "Admin" : "Cliente"}
    </p>
  );

  const AccountsList = ({
    accounts,
    showRole,
  }: {
    accounts: Account[];
    showRole?: boolean;
  }) => (
    <ul role="list" className="divide-y divide-white/10">
      {accounts.map((account) => (
        <li
          key={account.id}
          className="flex items-center justify-between gap-x-6 p-6 hover:bg-slate-800/50 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-x-3">
              <p className="text-base font-semibold leading-6 text-white">
                {account.companyName}
              </p>
              {showRole ? <RoleBadge account={account} /> : null}
              <StatusBadge account={account} />
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-sm leading-5 text-slate-400">
              <User className="h-4 w-4 flex-shrink-0" />
              <p className="truncate">{account.contactName}</p>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-sm leading-5 text-slate-400">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <p className="truncate">{account.email}</p>
            </div>
          </div>
          <div className="flex flex-none items-center gap-x-4">
            <button
              onClick={() => handleEditClick(account)}
              className="rounded-full p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Pencil className="h-5 w-5" />
              <span className="sr-only">Editar</span>
            </button>
            <button
              onClick={() => handleDeleteClick(account)}
              className="rounded-full p-2.5 text-red-400 hover:text-white hover:bg-red-500/50 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Excluir</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );

  const AccountsSection = ({
    title,
    subtitle,
    accounts,
    emptyText,
    showRole,
  }: {
    title: string;
    subtitle?: string;
    accounts: Account[];
    emptyText: string;
    showRole?: boolean;
  }) => (
    <section className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
            ) : null}
          </div>
          <p className="text-sm text-slate-300 whitespace-nowrap">
            {accounts.length}
          </p>
        </div>
      </div>
      {accounts.length === 0 ? (
        <div className="p-6 text-sm text-slate-400">{emptyText}</div>
      ) : (
        <AccountsList accounts={accounts} showRole={showRole} />
      )}
    </section>
  );

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
                <p className="mt-2 text-sm text-slate-400">
                  {activeClients.length} ativos • {inactiveClients.length} inativos •{" "}
                  {adminUsers.length} admins
                </p>
                <div className="mt-4">
                  <div
                    role="tablist"
                    aria-label="Filtrar clientes"
                    className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-slate-800/40 p-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "active"}
                      onClick={() => setActiveTab("active")}
                      className={`inline-flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${
                        activeTab === "active"
                          ? "bg-slate-700/60 text-white"
                          : "text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      Ativos
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                          activeTab === "active"
                            ? "text-green-300 bg-green-400/10 ring-green-400/30"
                            : "text-slate-300 bg-slate-700/40 ring-white/10"
                        }`}
                      >
                        {activeClients.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "inactive"}
                      onClick={() => setActiveTab("inactive")}
                      className={`inline-flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${
                        activeTab === "inactive"
                          ? "bg-slate-700/60 text-white"
                          : "text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      Inativos
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                          activeTab === "inactive"
                            ? "text-slate-200 bg-slate-400/10 ring-slate-400/30"
                            : "text-slate-300 bg-slate-700/40 ring-white/10"
                        }`}
                      >
                        {inactiveClients.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "admin"}
                      onClick={() => setActiveTab("admin")}
                      className={`inline-flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${
                        activeTab === "admin"
                          ? "bg-slate-700/60 text-white"
                          : "text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      Admins
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                          activeTab === "admin"
                            ? "text-yellow-300 bg-yellow-400/10 ring-yellow-400/30"
                            : "text-slate-300 bg-slate-700/40 ring-white/10"
                        }`}
                      >
                        {adminUsers.length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex space-x-3 md:mt-0 md-ml-4">
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

            <div>
              {activeTab === "active" ? (
                <AccountsSection
                  title="Clientes ativos"
                  subtitle="Clientes com acesso liberado ao sistema."
                  accounts={activeClients}
                  emptyText="Nenhum cliente ativo encontrado."
                />
              ) : activeTab === "inactive" ? (
                <AccountsSection
                  title="Clientes inativos"
                  subtitle="Clientes desativados (acesso bloqueado)."
                  accounts={inactiveClients}
                  emptyText="Nenhum cliente inativo encontrado."
                />
              ) : (
                <AccountsSection
                  title="Usuários admin"
                  subtitle="Usuários com permissão de administração."
                  accounts={adminUsers}
                  emptyText="Nenhum usuário admin encontrado."
                />
              )}
            </div>
          </>
        ) : (
          <ClientForm 
            client={editingClient} 
            onSave={handleSaveForm} 
            onCancel={handleCancelForm} 
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
          />
        )}
      </div>
    </main>
  );
}