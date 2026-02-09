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
} from "lucide-react";
import Link from "next/link";
import { useAuth, authController } from "@/lib/controllers/authcontroller";
import accountsController, {
  Account,
  UpdateAccountData,
} from "@/lib/controllers/accountscontroller";
import * as AccountAlerts from "@/components/allerts/accountsallert";

type InputFieldProps = {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
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
  disabled = false,
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
          disabled={disabled}
          className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed sm:text-sm"
        />
      </div>
    </div>
  );
}

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

export default function AdminProfilePage() {
  const { account, refreshAccount } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData.entries());
    const newPassword = String(rawData.newPassword ?? "").trim();
    const confirmPassword = String(rawData.confirmPassword ?? "").trim();

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        AccountAlerts.showError("A nova senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        AccountAlerts.showError("A confirmação da senha não confere.");
        return;
      }
    }

    const updateData: UpdateAccountData = {
      contactName: String(rawData.contactName),
      phone: String(rawData.phone),
      companyName: String(rawData.companyName),
      address: String(rawData.address),
      compressorCount: Number(rawData.compressorCount),
      networkDescription: String(rawData.networkDescription),
      // login não é enviado: campo desabilitado (somente leitura)
    };
    setSaving(true);
    try {
      await accountsController.updateAccount(account.id, updateData);
      if (newPassword) await authController.updatePassword(newPassword);
      await refreshAccount();
      AccountAlerts.showSuccess("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      AccountAlerts.showError(
        error instanceof Error ? error.message : "Erro ao atualizar o perfil."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!account) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-300">Carregando perfil...</p>
          <Link href="/administracao" className="mt-4 inline-block text-yellow-400 hover:underline">
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="mt-1 text-slate-300">Atualize seus dados. O email não pode ser alterado.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3 mb-4">
              Contato
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                icon={User}
                id="contactName"
                name="contactName"
                label="Nome para contato"
                placeholder="Seu nome"
                defaultValue={account.contactName}
              />
              <InputField
                icon={Phone}
                id="phone"
                name="phone"
                type="tel"
                label="Telefone"
                placeholder="(00) 00000-0000"
                defaultValue={account.phone}
              />
              <InputField
                icon={Mail}
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="email@exemplo.com"
                defaultValue={account.email}
                disabled
              />
              <InputField
                icon={Building2}
                id="companyName"
                name="companyName"
                label="Nome da empresa"
                placeholder="Empresa"
                defaultValue={account.companyName}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3 mb-4">
              Dados para monitoramento
            </h2>
            <div className="space-y-4">
              <div className="sm:col-span-2">
                <TextareaField
                  icon={MapPin}
                  id="address"
                  name="address"
                  label="Endereço da planta"
                  placeholder="Endereço completo"
                  defaultValue={account.address}
                />
              </div>
              <InputField
                icon={Database}
                id="compressorCount"
                name="compressorCount"
                type="number"
                label="Quantidade de compressores"
                placeholder="0"
                defaultValue={account.compressorCount?.toString() ?? ""}
              />
              <div>
                <TextareaField
                  icon={Network}
                  id="networkDescription"
                  name="networkDescription"
                  label="Descrição da rede de ar"
                  placeholder="Breve descrição"
                  defaultValue={account.networkDescription}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-3 mb-4">
              Acesso
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Login não pode ser alterado. Para trocar a senha, preencha os campos abaixo.
            </p>
            <div className="space-y-4">
              <InputField
                icon={KeyRound}
                id="login"
                name="login"
                label="Login (somente leitura)"
                placeholder="seu.login"
                defaultValue={account.login}
                disabled
              />
              <InputField
                icon={Lock}
                id="newPassword"
                name="newPassword"
                type="password"
                label="Senha"
                placeholder="Nova senha (mín. 6 caracteres) — deixe em branco para não alterar"
                required={false}
              />
              <InputField
                icon={Lock}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirmar senha"
                placeholder="Repita a nova senha"
                required={false}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/administracao"
              className="rounded-lg px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-yellow-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
