"use client"

import { useState, useEffect, ElementType } from "react" // Adicionado ElementType
import Link from "next/link"
import { 
    AlertTriangle, Bell, Ticket, Share2, Wifi, Server, Power, Loader2 
} from "lucide-react"
import { db } from "@/lib/model/firebase"
// 1. 'DocumentData' removido da importação pois não estava em uso.
import { collection, getDocs, query, where } from "firebase/firestore"
import { useAuth } from "@/lib/controllers/authcontroller"
import type { Account } from "@/lib/controllers/accountscontroller"

// --- INTERFACES ---
interface ClientStats {
    networks: { total: number; active: number };
    equipment: { total: number; online: number };
    support: { openTickets: number };
    alerts: { critical: number; moderate: number };
}

// 3. Interfaces mais específicas para evitar o uso de `any`.
// Adicionamos as propriedades que sabemos que existem nos documentos.
interface Network {
    id: string;
    status: 'active' | 'inactive';
    clientId: string;
    name?: string; // Adicionando outras propriedades prováveis como opcionais
}

interface Asset {
    id: string;
    status: 'online' | 'offline' | 'maintenance';
    networkId: string;
    name?: string; // Adicionando outras propriedades prováveis como opcionais
}


// --- SUB-COMPONENTES ---
// 2. Tipo do ícone corrigido de 'any' para 'ElementType' para maior segurança.
function StatCard({ icon: Icon, title, value, color, href }: { icon: ElementType; title:string; value: string | number; color: string; href?: string }) {
    const colorClasses: Record<string, string> = { // Tipo mais específico para o objeto
        red: "text-red-400",
        yellow: "text-yellow-400",
        orange: "text-orange-400",
        blue: "text-blue-400",
        green: "text-green-400",
        purple: "text-purple-400",
    };

    const CardContent = () => (
        <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-100">{value}</p>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="group block bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:scale-[1.02]">
                <CardContent />
            </Link>
        )
    }
    return (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <CardContent />
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {children}
            </div>
        </section>
    );
}

export default function ClientDashboardPage() {
    const { account, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<ClientStats>({
        networks: { total: 0, active: 0 },
        equipment: { total: 0, online: 0 },
        support: { openTickets: 0 },
        alerts: { critical: 0, moderate: 0 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async (currentAccount: Account) => {
            try {
                // 1. Buscar as redes do cliente logado
                const networksQuery = query(collection(db, "airscan_networks"), where("clientId", "==", currentAccount.id));
                const networksSnap = await getDocs(networksQuery);
                // O casting para 'Network[]' agora é mais seguro com a interface aprimorada
                const clientNetworks = networksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Network));
                
                const activeNetworks = clientNetworks.filter(net => net.status === 'active').length;
                
                let onlineEquipment = 0;
                let totalEquipment = 0;

                // 2. Buscar os ativos baseados nas redes encontradas
                if (clientNetworks.length > 0) {
                    const networkIds = clientNetworks.map(net => net.id);
                    const assetsQuery = query(collection(db, "airscan_assets"), where("networkId", "in", networkIds));
                    const assetsSnap = await getDocs(assetsQuery);
                     // O casting para 'Asset[]' agora é mais seguro
                    const clientAssets = assetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));

                    totalEquipment = clientAssets.length;
                    onlineEquipment = clientAssets.filter(asset => asset.status === 'online').length;
                }

                // 3. (Futuro) Buscar chamados e alertas do cliente
                // const ticketsQuery = query(collection(db, "tickets"), where("clientId", "==", account.id), where("status", "==", "aberto"));
                // const ticketsSnap = await getDocs(ticketsQuery);

                setStats({
                    networks: { total: clientNetworks.length, active: activeNetworks },
                    equipment: { total: totalEquipment, online: onlineEquipment },
                    // Dados mockados até que as coleções de suporte/alertas existam
                    support: { openTickets: 3 },
                    alerts: { critical: 1, moderate: 4 },
                });

            } catch (error) {
                console.error("Erro ao buscar dados do dashboard do cliente:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (account) {
                fetchData(account);
            } else {
                setLoading(false);
            }
        }
    }, [account, authLoading]);

    if (loading || authLoading) {
        return (
            <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
            </main>
        );
    }

    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                        Bem-vindo, {account?.contactName.split(' ')[0] || 'Cliente'}!
                    </h1>
                    <p className="text-slate-300 mt-2 text-lg">Visão geral do seu sistema de monitoramento.</p>
                </div>
                
                <Section title="Minha Rede">
                    <StatCard icon={Share2} title="Redes Monitoradas" value={stats.networks.total} color="blue" href="/system/client/network/view-network" />
                    <StatCard icon={Wifi} title="Redes Ativas" value={stats.networks.active} color="green" href="/system/client/network/view-network" />
                    <StatCard icon={Server} title="Equipamentos Totais" value={stats.equipment.total} color="purple" href="/system/client/assets" />
                    <StatCard icon={Power} title="Equipamentos Online" value={stats.equipment.online} color="green" href="/system/client/assets" />
                </Section>

                <Section title="Alertas e Suporte">
                    <StatCard icon={AlertTriangle} title="Alertas Críticos" value={stats.alerts.critical} color="red" href="/client/alerts/panel" />
                    <StatCard icon={Bell} title="Alertas Moderados" value={stats.alerts.moderate} color="yellow" href="/client/alerts/panel" />
                    <StatCard icon={Ticket} title="Chamados Abertos" value={stats.support.openTickets} color="orange" href="/system/client/tickets/search-ticket" />
                </Section>
            </div>
        </main>
    );
}