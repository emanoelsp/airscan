"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import { useAuth } from "@/lib/controllers/authcontroller";
import assetsController, { Asset, Network } from "@/lib/controllers/assetscontroller";
import { confirmContactDelete } from "@/components/allerts/receiptallert";
import {
  Users,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  Trash2,
  Save,
  Edit,
  Pencil,
  CheckCircle,
  XCircle,
} from "lucide-react";
import * as AccountAlerts from "@/components/allerts/accountsallert";

export default function ConfigurarContatosPage() {
  const { account, loading: authLoading } = useAuth();

  const [networks, setNetworks] = useState<Network[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [contactName, setContactName] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [currentPhone, setCurrentPhone] = useState("");

  const isValidEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    // Validação simples de e-mail (suficiente para alertas)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const formatPhoneBR = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    // Ex.: (47) 99999-9999
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    // 11+ dígitos (celular com 9 na frente)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  useEffect(() => {
    if (authLoading || !account?.id) return;
    const fetchData = async () => {
      setIsLoading(true);
      setFeedback(null);
      try {
        const [nets, assets] = await Promise.all([
          assetsController.getNetworksByAccountId(account.id),
          assetsController.getAssetsByAccountId(account.id),
        ]);
        setNetworks(nets);
        setAllAssets(assets);
      } catch (e) {
        console.error(e);
        setFeedback({ type: "error", message: "Falha ao carregar redes e equipamentos." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [account?.id, authLoading]);

  const assetsInNetwork = useMemo(() => {
    if (!selectedNetworkId) return [];
    return allAssets.filter((a) => a.networkId === selectedNetworkId);
  }, [selectedNetworkId, allAssets]);

  const assetsWithContacts = useMemo(
    () =>
      allAssets.filter(
        (a) =>
          (a.contactName && a.contactName.trim() !== "") ||
          (a.contactEmails && a.contactEmails.length > 0) ||
          (a.contactPhones && a.contactPhones.length > 0)
      ),
    [allAssets]
  );

  useEffect(() => {
    if (selectedAsset) {
      setContactName(selectedAsset.contactName ?? "");
      setEmails(selectedAsset.contactEmails ?? []);
      setPhones(selectedAsset.contactPhones ?? []);
    } else {
      setContactName("");
      setEmails([]);
      setPhones([]);
    }
    setCurrentEmail("");
    setCurrentPhone("");
    setFeedback(null);
  }, [selectedAsset]);

  const handleSelectAsset = (assetId: string) => {
    if (!assetId) {
      setSelectedAsset(null);
      return;
    }
    const asset = allAssets.find((a) => a.id === assetId) ?? null;
    setSelectedAsset(asset);
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedNetworkId(asset.networkId);
  };

  const addEmail = () => {
    const trimmed = currentEmail.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      AccountAlerts.showError("Informe um e-mail válido para receber os alertas.");
      return;
    }
    if (emails.includes(trimmed)) {
      AccountAlerts.showError("Este e-mail já foi adicionado à lista.");
      return;
    }
    setEmails([...emails, trimmed]);
    setCurrentEmail("");
  };

  const removeEmail = (index: number) => setEmails(emails.filter((_, i) => i !== index));

  const editEmail = (index: number) => {
    setCurrentEmail(emails[index] ?? "");
    setEmails(emails.filter((_, i) => i !== index));
  };

  const addPhone = () => {
    const trimmed = currentPhone.trim();
    if (!trimmed) return;
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 10) {
      AccountAlerts.showError("Informe um WhatsApp válido (DDD + número).");
      return;
    }
    if (phones.includes(trimmed)) {
      AccountAlerts.showError("Este WhatsApp já foi adicionado à lista.");
      return;
    }
    setPhones([...phones, trimmed]);
    setCurrentPhone("");
  };

  const removePhone = (index: number) => setPhones(phones.filter((_, i) => i !== index));

  const editPhone = (index: number) => {
    setCurrentPhone(phones[index] ?? "");
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const data = {
        contactName: contactName.trim() || undefined,
        contactEmails: emails.length > 0 ? emails : undefined,
        contactPhones: phones.length > 0 ? phones : undefined,
      };
      await assetsController.updateAsset(selectedAsset.id, data);
      setAllAssets((prev) =>
        prev.map((a) => (a.id === selectedAsset.id ? { ...a, ...data } : a))
      );
      setSelectedAsset((prev) => (prev ? { ...prev, ...data } : null));
      setFeedback({ type: "success", message: "Contatos salvos com sucesso!" });
      AccountAlerts.showSuccess("Contatos salvos com sucesso!");
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Erro ao salvar. Tente novamente." });
      AccountAlerts.showError("Erro ao salvar os contatos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContacts = async () => {
    if (!selectedAsset) return;
    const result = await confirmContactDelete(selectedAsset.contactName || selectedAsset.name);
    if (!result.isConfirmed) return;
    try {
      await assetsController.deleteAssetContacts(selectedAsset.id);
      setAllAssets((prev) =>
        prev.map((a) =>
          a.id === selectedAsset.id
            ? { ...a, contactName: undefined, contactEmails: undefined, contactPhones: undefined }
            : a
        )
      );
      setSelectedAsset((prev) =>
        prev?.id === selectedAsset.id
          ? { ...prev, contactName: undefined, contactEmails: undefined, contactPhones: undefined }
          : prev
      );
      setContactName("");
      setEmails([]);
      setPhones([]);
      AccountAlerts.showSuccess("Contatos removidos deste equipamento.");
      setFeedback({ type: "success", message: "Contatos excluídos." });
    } catch (err) {
      console.error(err);
      AccountAlerts.showError("Falha ao excluir contatos.");
    }
  };

  const hasAnyContact = contactName.trim() !== "" || emails.length > 0 || phones.length > 0;

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-8 sm:px-6 lg:px-8">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Configurar contatos para alertas
          </h1>
          <p className="text-slate-300 mt-1">
            Selecione a rede e o equipamento e crie a lista de contatos (e-mail ou WhatsApp) que
            receberão os alertas.
          </p>
        </header>

        {feedback && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              feedback.type === "success" ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {feedback.message}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Seleção Rede + Ativo (igual a Configurar Limites) */}
            <section className="bg-slate-800/40 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">
                1. Selecione a rede e o equipamento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="network" className="block text-sm font-medium text-slate-300 mb-2">
                    Rede
                  </label>
                  <select
                    id="network"
                    value={selectedNetworkId}
                    onChange={(e) => {
                      setSelectedNetworkId(e.target.value);
                      setSelectedAsset(null);
                    }}
                    className="w-full rounded-lg border-0 bg-slate-700/50 px-4 py-3 text-white ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">— Escolha uma rede —</option>
                    {networks.map((net) => (
                      <option key={net.id} value={net.id}>
                        {net.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="asset" className="block text-sm font-medium text-slate-300 mb-2">
                    Equipamento (ativo)
                  </label>
                  <select
                    id="asset"
                    value={selectedAsset?.id ?? ""}
                    onChange={(e) => handleSelectAsset(e.target.value)}
                    disabled={!selectedNetworkId}
                    className="w-full rounded-lg border-0 bg-slate-700/50 px-4 py-3 text-white ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">— Escolha um equipamento —</option>
                    {assetsInNetwork.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Formulário de contatos (quando ativo selecionado) */}
            {selectedAsset && (
              <section className="bg-slate-800/40 border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Contatos para: {selectedAsset.name}
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  Adicione e-mails ou números de WhatsApp. Estes contatos receberão os alertas deste
                  equipamento.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-medium text-slate-300 mb-2"
                    >
                      Nome do grupo (opcional)
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-lg border-0 bg-slate-700/50 px-4 py-3 text-white ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500"
                      placeholder="Ex: Equipe de manutenção"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      E-mails para alertas
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={currentEmail}
                        onChange={(e) => setCurrentEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                        className="flex-1 rounded-lg border-0 bg-slate-700/50 px-4 py-3 text-white ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500"
                        placeholder="email@exemplo.com"
                      />
                      <button
                        type="button"
                        onClick={addEmail}
                        className="rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Adicionar
                      </button>
                    </div>
                    {emails.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {emails.map((email, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-slate-900/60 px-4 py-2 text-sm"
                          >
                            <span className="flex items-center gap-2 text-slate-200">
                              <Mail className="w-4 h-4 text-slate-400" />
                              {email}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => editEmail(i)}
                                className="text-cyan-400 hover:text-cyan-300 p-1.5 rounded"
                                aria-label="Editar e-mail"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeEmail(i)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded"
                                aria-label="Remover e-mail"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      WhatsApp para alertas
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={currentPhone}
                        onChange={(e) => setCurrentPhone(formatPhoneBR(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhone())}
                        className="flex-1 rounded-lg border-0 bg-slate-700/50 px-4 py-3 text-white ring-1 ring-inset ring-slate-600 focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500"
                        placeholder="(47) 99999-9999"
                      />
                      <button
                        type="button"
                        onClick={addPhone}
                        className="rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Adicionar
                      </button>
                    </div>
                    {phones.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {phones.map((phone, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-slate-900/60 px-4 py-2 text-sm"
                          >
                            <span className="flex items-center gap-2 text-slate-200">
                              <MessageCircle className="w-4 h-4 text-slate-400" />
                              {phone}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => editPhone(i)}
                                className="text-cyan-400 hover:text-cyan-300 p-1.5 rounded"
                                aria-label="Editar WhatsApp"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removePhone(i)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded"
                                aria-label="Remover WhatsApp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleDeleteContacts}
                      disabled={!hasAnyContact}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Excluir todos os contatos
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {isSubmitting ? "Salvando…" : "Salvar contatos"}
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            )}

            {/* 3. Lista de equipamentos com contatos configurados */}
            <section className="bg-slate-800/40 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">
                Equipamentos com contatos configurados
              </h2>
              {assetsWithContacts.length === 0 ? (
                <p className="text-slate-400 text-center py-6">
                  Nenhum equipamento com contatos de alerta ainda.
                </p>
              ) : (
                <ul className="space-y-3">
                  {assetsWithContacts.map((asset) => {
                    const count =
                      (asset.contactEmails?.length ?? 0) + (asset.contactPhones?.length ?? 0);
                    return (
                      <li
                        key={asset.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-900/50 p-4"
                      >
                        <div>
                          <p className="font-semibold text-white">{asset.name}</p>
                          <p className="text-sm text-slate-400">
                            {asset.networkName ?? "—"} · {count} contato(s)
                            {asset.contactName && ` · ${asset.contactName}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEdit(asset)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" /> Alterar
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
