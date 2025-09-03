"use client"

import { useState, useEffect, ElementType } from "react"
import Link from "next/link"
import { 
    AlertTriangle, Bell, MessageSquare, Ticket, Users, UserX, Share2, 
    Wifi,  Server, Power, Loader2
} from "lucide-react"
import { db } from "@/lib/model/firebase"
import { collection, getDocs } from "firebase/firestore"

// --- INTERFACES ---
interface Stats {
    clients: { active: number; inactive: number };
    networks: { total: number; active: number; inactive: number };
    equipment: { total: number; online: number; offline: number };
    support: { tickets: number; solicitations: number; messages: number };
    alerts: { critical: number; moderate: number };
}


// --- SUB-COMPONENTES ---
function StatCard({ icon: Icon, title, value, color, href }: { icon: ElementType; title: string; value: string | number; color: string; href?: string }) {
    const colorClasses: Record<string, string> = {
        red: "text-red-400",
        yellow: "text-yellow-400",
        blue: "text-blue-400",
        green: "text-green-400",
        purple: "text-purple-400",
        slate: "text-slate-400",
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

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        clients: { active: 0, inactive: 0 },
        networks: { total: 0, active: 0, inactive: 0 },
        equipment: { total: 0, online: 0, offline: 0 },
        support: { tickets: 0, solicitations: 0, messages: 0 }, // Mocked data for now
        alerts: { critical: 0, moderate: 0 }, // Mocked data for now
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Usando Promise.all para buscar dados em paralelo
                const [accountsSnap, networksSnap, assetsSnap] = await Promise.all([
                    getDocs(collection(db, "airscan_accounts")),
                    getDocs(collection(db, "airscan_networks")),
                    getDocs(collection(db, "airscan_assets")),
                    // Adicionar aqui as buscas para tickets, alerts, etc. quando as coleções existirem
                ]);

                // Processar Clientes
                const accounts = accountsSnap.docs.map(doc => doc.data());
                const activeClients = accounts.filter(acc => acc.role === 'cliente' && acc.status === 'active').length;
                const inactiveClients = accounts.filter(acc => acc.role === 'cliente' && acc.status === 'inactive').length;

                // Processar Redes
                const networks = networksSnap.docs.map(doc => doc.data());
                const activeNetworks = networks.filter(net => net.status === 'active').length;
                const inactiveNetworks = networks.length - activeNetworks;

                // Processar Equipamentos
                const assets = assetsSnap.docs.map(doc => doc.data());
                const onlineEquipment = assets.filter(asset => asset.status === 'online').length;
                const offlineEquipment = assets.length - onlineEquipment;

                setStats({
                    clients: { active: activeClients, inactive: inactiveClients },
                    networks: { total: networks.length, active: activeNetworks, inactive: inactiveNetworks },
                    equipment: { total: assets.length, online: onlineEquipment, offline: offlineEquipment },
                    // Dados mockados até que as coleções existam
                    support: { tickets: 5, solicitations: 2, messages: 8 },
                    alerts: { critical: 3, moderate: 12 },
                });

            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
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
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Dashboard do Administrador</h1>
                    <p className="text-slate-300 mt-2 text-lg">Visão geral do sistema de monitoramento.</p>
                </div>
                
                <Section title="Alertas">
                    <StatCard icon={AlertTriangle} title="Alertas Críticos" value={stats.alerts.critical} color="red" />
                    <StatCard icon={Bell} title="Alertas Moderados" value={stats.alerts.moderate} color="yellow" />
                </Section>
                
                <Section title="Suporte">
                    <StatCard icon={Ticket} title="Chamados Abertos" value={stats.support.tickets} color="orange" href="/system/admin/tickets" />
                    <StatCard icon={MessageSquare} title="Mensagens de Contato" value={stats.support.messages} color="blue" href="/system/admin/messages/contacts" />
                    <StatCard icon={MessageSquare} title="Orçamentos" value={stats.support.solicitations} color="purple" href="/system/admin/messages/solicitations" />
                </Section>

                <Section title="Clientes">
                    <StatCard icon={Users} title="Clientes Ativos" value={stats.clients.active} color="green" href="/system/admin/accounts" />
                    <StatCard icon={UserX} title="Clientes Inativos" value={stats.clients.inactive} color="slate" href="/system/admin/accounts" />
                </Section>
                
                <Section title="Redes e Equipamentos">
                    <StatCard icon={Share2} title="Redes Monitoradas" value={stats.networks.total} color="blue" href="/system/admin/network/search-network" />
                    <StatCard icon={Wifi} title="Redes Ativas" value={stats.networks.active} color="green" href="/system/admin/network/search-network" />
                    <StatCard icon={Server} title="Equipamentos Totais" value={stats.equipment.total} color="purple" href="/system/admin/assets" />
                    <StatCard icon={Power} title="Equipamentos Online" value={stats.equipment.online} color="green" href="/system/admin/assets" />
                </Section>

            </div>
        </main>
    );
}

