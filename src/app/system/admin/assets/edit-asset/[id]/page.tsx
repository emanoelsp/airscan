"use client";

import { useState, useEffect, ReactElement, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Asset, UpdateAssetData } from "@/lib/controllers/assetscontroller";
import assetsController from "@/lib/controllers/assetscontroller";
import { showSuccess, showError } from "@/components/allerts/accountsallert";
import {
  HardDrive,
  Type,
  MapPin,
  Server,
  KeyRound,
  Link2,
  FileText,
  Gauge,
  Zap,
  ToggleLeft,
  X,
  Loader2,
} from "lucide-react";

// --- COMPONENTES DE FORMULÁRIO REUTILIZADOS ---

type InputFieldProps = {
  icon: React.ElementType;
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string | number;
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
          className={`block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
    </div>
  );
}

type SelectFieldProps = {
    icon: React.ElementType;
    id: string;
    name: string;
    label: string;
    children: React.ReactNode;
    defaultValue?: string;
  };

function SelectField({ icon: Icon, id, name, label, children, defaultValue }: SelectFieldProps) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
        <div className="relative mt-2">
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            id={id}
            name={name}
            defaultValue={defaultValue}
            className="block w-full appearance-none rounded-md border-0 bg-slate-800/50 py-3 pl-10 pr-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
          >
            {children}
          </select>
        </div>
      </div>
    );
}


function AssetForm({
  asset,
  onSave,
  onCancel,
}: {
  asset: Asset;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}) {
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
        <h1 className="text-2xl font-bold">Editar Ativo: {asset.name}</h1>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-slate-700 transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="border-b border-white/10 pb-8">
        <h2 className="text-xl font-semibold text-white">Informações Gerais</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField icon={HardDrive} id="name" name="name" label="Nome do Ativo" placeholder="Compressor Principal" defaultValue={asset.name} />
          <InputField icon={Server} id="model" name="model" label="Modelo" placeholder="Atlas Copco GA 37" defaultValue={asset.model} />
          <InputField icon={Type} id="type" name="type" label="Tipo de Ativo" placeholder="Compressor" defaultValue={asset.type} />
          <InputField icon={MapPin} id="location" name="location" label="Localização" placeholder="Linha de Produção 1" defaultValue={asset.location} />
          <div className="sm:col-span-2">
             <InputField icon={FileText} id="description" name="description" label="Descrição" placeholder="Ativo responsável pelo suprimento principal de ar" required={false} defaultValue={asset.description}/>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 pb-8">
        <h2 className="text-xl font-semibold text-white">Dados Técnicos e Status</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <InputField icon={Gauge} id="maxPressure" name="maxPressure" type="number" label="Pressão Máx. (bar)" placeholder="10" defaultValue={asset.maxPressure} />
          <InputField icon={Zap} id="powerRating" name="powerRating" type="number" label="Potência (kW)" placeholder="40" defaultValue={asset.powerRating} />
           <SelectField icon={ToggleLeft} id="status" name="status" label="Status" defaultValue={asset.status}>
              <option value="online">Online</option>
              <option value="maintenance">Em Manutenção</option>
              <option value="offline">Offline</option>
           </SelectField>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">Conexão e Rede</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <InputField icon={KeyRound} id="apiKey" name="apiKey" label="API Key" placeholder="Chave de acesso da API" defaultValue={asset.apiKey} />
            <InputField icon={Link2} id="apiUrl" name="apiUrl" label="URL da API" placeholder="https://api.example.com/data" defaultValue={asset.apiUrl} />
            <InputField icon={Server} id="networkName" name="networkName" label="Nome da Rede" placeholder="Rede servidor" defaultValue={asset.networkName} disabled={true} />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 flex justify-end items-center">
        <div className="flex items-center gap-x-4">
          <button type="button" onClick={onCancel} className="rounded-lg px-8 py-3 text-sm font-bold text-slate-300 transition-all hover:bg-slate-700">
            Cancelar
          </button>
          <button
            type="submit"
            className="flex justify-center rounded-lg bg-yellow-400 px-8 py-3 text-sm font-bold leading-6 text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </form>
  );
}

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
function EditAssetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const assetDataString = searchParams.get("data");
    if (assetDataString) {
      try {
        const parsedAsset = JSON.parse(decodeURIComponent(assetDataString));
        setAsset(parsedAsset);
      } catch (e) {
        setError("Não foi possível carregar os dados do ativo. Tente voltar e selecionar novamente.");
      }
    } else {
      setError("Dados do ativo não encontrados. Por favor, retorne à lista e tente novamente.");
    }
  }, [searchParams]);

  const handleCancel = () => {
    router.push("/system/admin/assets");
  };

  const handleSave = async (formData: FormData) => {
    if (!asset) return;

    const rawData = Object.fromEntries(formData.entries());
    const dataToUpdate: UpdateAssetData = {
        ...rawData,
        maxPressure: Number(rawData.maxPressure),
        powerRating: Number(rawData.powerRating),
        status: rawData.status as 'online' | 'offline' | 'maintenance',
        type: rawData.type as string, // Garantir que o tipo seja string
    };
    
    try {
      await assetsController.updateAsset(asset.id, dataToUpdate);
      showSuccess("Ativo atualizado com sucesso!");
      router.push("/system/admin/assets");
    } catch (err) {
      showError("Ocorreu um erro ao salvar as alterações.");
      console.error(err);
    }
  };

  if (error) {
    return (
        <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
           <div className="text-center bg-slate-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Erro</h2>
                <p className="text-slate-300">{error}</p>
                <button onClick={handleCancel} className="mt-6 rounded-lg bg-yellow-400 px-6 py-2 text-sm font-bold text-slate-900">
                    Voltar para a Lista
                </button>
           </div>
        </main>
    )
  }

  if (!asset) {
    return (
      <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
        <div className="relative z-10 max-w-4xl mx-auto">
            <AssetForm asset={asset} onSave={handleSave} onCancel={handleCancel} />
        </div>
    </main>
  );
}

// O Suspense é necessário para que o useSearchParams funcione corretamente durante a renderização no lado do servidor.
export default function EditAssetPageWrapper() {
    return (
        <Suspense fallback={
            <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
            </main>
        }>
            <EditAssetPage />
        </Suspense>
    )
}

