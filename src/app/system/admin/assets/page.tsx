"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/firebaseconfig";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Share2, HardDrive, Pencil, Trash2, ChevronDown, Loader2, Plus, Server, Eye } from "lucide-react";
// Importando os alertas customizados
import { confirmAssetDelete } from "@/components/allerts/assetsallert";
import { showSuccess, showError } from "@/components/allerts/accountsallert";

// --- NOVAS INTERFACES BASEADAS NA ESTRUTURA DE DADOS ---
interface Network {
  id: string;
  name: string;
  // Adicione outros campos da sua coleção de redes se necessário
}

interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance'; // Status como string
  networkId: string; // Referência à rede
  location: string;
  model: string;
  apiUrl?: string;
}

interface NetworkWithAssets {
  network: Network;
  assets: Asset[];
}

export default function ManageAssetsPage() {
  const [networksWithAssets, setNetworksWithAssets] = useState<NetworkWithAssets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openNetworkId, setOpenNetworkId] = useState<string | null>(null);
  const [apiStatusByAssetId, setApiStatusByAssetId] = useState<Record<string, boolean>>({});
  const apiCheckReqRef = useRef(0);
  const router = useRouter();

  const isApiOnline = async (apiUrl: string, timeoutMs = 5000): Promise<boolean> => {
    const url = apiUrl.trim();
    if (!url) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: { "ngrok-skip-browser-warning": "true" },
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const getEffectiveStatus = (asset: Asset): Asset["status"] => {
    // Se estiver em manutenção, respeita o status do cadastro
    if (asset.status === "maintenance") return "maintenance";

    // Se tiver API, usa resultado da verificação (quando disponível)
    if (asset.apiUrl && asset.apiUrl.trim()) {
      const online = apiStatusByAssetId[asset.id];
      if (online === true) return "online";
      if (online === false) return "offline";
      // Ainda não verificado: cai no status salvo
      return asset.status;
    }

    return asset.status;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Buscar todas as Redes
        const networksRef = collection(db, "airscan_networks");
        const networksSnapshot = await getDocs(networksRef);
        const allNetworks = networksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Network));

        if (allNetworks.length === 0) {
          setNetworksWithAssets([]);
          return;
        }

        // 2. Para cada rede, buscar seus ativos
        const allData = await Promise.all(
          allNetworks.map(async (network) => {
            const assetsRef = collection(db, "airscan_assets");
            const qAssets = query(assetsRef, where("networkId", "==", network.id));
            const assetsSnapshot = await getDocs(qAssets);
            const assets = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
            return { network, assets };
          })
        );
        
        setNetworksWithAssets(allData);

      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados. Verifique a estrutura das coleções e tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleNetwork = (networkId: string) => {
    setOpenNetworkId((prevId) => {
      const nextId = prevId === networkId ? null : networkId;

      // Ao abrir, verifica status via API para os ativos dessa rede (1x por abertura)
      if (nextId) {
        const reqId = ++apiCheckReqRef.current;
        const networkData = networksWithAssets.find((n) => n.network.id === nextId);
        const assetsToCheck =
          networkData?.assets.filter((a) => typeof a.apiUrl === "string" && a.apiUrl.trim().length > 0) || [];

        if (assetsToCheck.length > 0) {
          Promise.all(
            assetsToCheck.map(async (asset) => {
              const ok = await isApiOnline(asset.apiUrl as string);
              return { id: asset.id, ok };
            })
          ).then((results) => {
            // ignora resultado de requests antigos
            if (apiCheckReqRef.current !== reqId) return;
            setApiStatusByAssetId((prev) => {
              const next = { ...prev };
              for (const r of results) next[r.id] = r.ok;
              return next;
            });
          });
        }
      }

      return nextId;
    });
  };

  const handleEditAsset = (asset: Asset) => {
    const assetQuery = encodeURIComponent(JSON.stringify(asset));
    router.push(`/system/admin/assets/edit-asset/${asset.id}?data=${assetQuery}`);
  };

  const handleViewAsset = (asset: Asset) => {
    const assetQuery = encodeURIComponent(JSON.stringify(asset));
    router.push(`/administracao/equipamentos/visualizar/${asset.id}?data=${assetQuery}`);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    const isConfirmed = await confirmAssetDelete(asset.name);
    
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, "airscan_assets", asset.id));
        setNetworksWithAssets(prevData =>
          prevData.map(item =>
            item.network.id === asset.networkId
              ? { ...item, assets: item.assets.filter(a => a.id !== asset.id) }
              : item
          )
        );
        showSuccess(`O ativo ${asset.name} foi excluído.`);
      } catch (error) {
        console.error("Erro ao excluir ativo:", error);
        showError('Não foi possível excluir o ativo.');
      }
    }
  };
  
  // Função para mapear status para cor e texto
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'online':
        return { text: 'Online', className: 'bg-green-500/10 text-green-400' };
      case 'maintenance':
        return { text: 'Manutenção', className: 'bg-yellow-500/10 text-yellow-400' };
      case 'offline':
        return { text: 'Offline', className: 'bg-red-500/10 text-red-400' };
      default:
        return { text: 'Indefinido', className: 'bg-gray-500/10 text-gray-400' };
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </main>
    );
  }

  if (error) {
    return (
        <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="text-center bg-slate-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Erro</h2>
                <p className="text-slate-300">{error}</p>
            </div>
        </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-slate-100">Gerenciamento de Ativos</h1>
            <button
                onClick={() => router.push('/system/admin/assets/create-asset')}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all transform hover:scale-105"
            >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Novo Ativo</span>
            </button>
        </div>
        
        {networksWithAssets.length === 0 ? (
          <div className="text-center text-slate-400 mt-16 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <Server className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-200">Nenhuma rede encontrada</h3>
            <p className="text-sm">Você pode começar cadastrando uma nova rede no sistema.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {networksWithAssets.map(({ network, assets }) => (
              <div key={network.id} className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex flex-col transition-all hover:border-white/20 hover:scale-[1.01]">
                <button
                  onClick={() => handleToggleNetwork(network.id)}
                  className="w-full flex justify-between items-center p-4 text-left rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Share2 className="w-6 h-6 text-blue-400" />
                    <span className="font-semibold text-lg text-slate-100">{network.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full">
                      {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openNetworkId === network.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {openNetworkId === network.id && (
                  <div className="border-t border-white/10 mx-4 mt-2 pt-4">
                    {assets.length > 0 ? (
                      <ul className="space-y-3 p-2">
                        {assets.map(asset => (
                          <li key={asset.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/50 rounded-lg hover:bg-slate-900/80 transition-colors">
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                               <HardDrive className="w-6 h-6 text-slate-300"/>
                               <div>
                                   <p className="font-semibold text-slate-100">{asset.name}</p>
                                   <p className="text-sm text-slate-400">{asset.model} • {asset.location}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusProps(getEffectiveStatus(asset)).className}`}>
                                {getStatusProps(getEffectiveStatus(asset)).text}
                              </span>
                              <button onClick={() => handleViewAsset(asset)} className="p-2 text-slate-400 hover:text-green-400 rounded-full hover:bg-green-500/10 transition-colors">
                                <Eye className="w-5 h-5"/>
                              </button>
                              <button onClick={() => handleEditAsset(asset)} className="p-2 text-slate-400 hover:text-blue-400 rounded-full hover:bg-blue-500/10 transition-colors">
                                <Pencil className="w-5 h-5"/>
                              </button>
                              <button onClick={() => handleDeleteAsset(asset)} className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-5 h-5"/>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-4 text-center text-slate-400">Nenhum ativo encontrado para esta rede.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

