import Link from "next/link"
import { Plus, Search, TriangleIcon as Topology } from "lucide-react"

export default function NetworkPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rede de Monitoramento</h1>
          <p className="text-gray-600">Gerencie suas redes de monitoramento e ativos conectados</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Criar Nova Rede */}
          <Link href="/network/create" className="group">
            <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Criar Nova Rede</h3>
              <p className="text-gray-600 mb-4">
                Configure uma nova rede de monitoramento para seus compressores de ar comprimido
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">Começar configuração →</div>
            </div>
          </Link>

          {/* Criar Novo Ativo */}
          <Link href="/network/create-asset" className="group">
            <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                <Plus className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Criar Novo Ativo</h3>
              <p className="text-gray-600 mb-4">Adicione um novo ativo de ar comprimido a uma rede existente</p>
              <div className="text-orange-600 font-medium group-hover:text-orange-700">Adicionar ativo →</div>
            </div>
          </Link>

          {/* Topologia de Ativos */}
          <Link href="/network/topology" className="group">
            <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <Topology className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Topologia de Ativos</h3>
              <p className="text-gray-600 mb-4">
                Visualize a topologia completa dos seus ativos monitorados em tempo real
              </p>
              <div className="text-green-600 font-medium group-hover:text-green-700">Ver topologia →</div>
            </div>
          </Link>

          {/* Procurar Ativos */}
          <Link href="/network/search" className="group">
            <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Procurar Ativos</h3>
              <p className="text-gray-600 mb-4">
                Encontre ativos específicos por nome, tipo ou descrição e monitore em tempo real
              </p>
              <div className="text-purple-600 font-medium group-hover:text-purple-700">Buscar ativos →</div>
            </div>
          </Link>
        </div>

        {/* Redes Existentes */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Redes Existentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Fábrica Principal",
                devices: 15,
                status: "online",
                efficiency: 96.2,
                lastUpdate: "2 min atrás",
              },
              {
                name: "Unidade Norte",
                devices: 12,
                status: "online",
                efficiency: 94.8,
                lastUpdate: "1 min atrás",
              },
              {
                name: "Linha de Produção B",
                devices: 8,
                status: "warning",
                efficiency: 92.1,
                lastUpdate: "5 min atrás",
              },
            ].map((network, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{network.name}</h3>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      network.status === "online"
                        ? "status-online"
                        : network.status === "warning"
                          ? "status-warning"
                          : "status-offline"
                    }`}
                  >
                    {network.status === "online" ? "Online" : network.status === "warning" ? "Atenção" : "Offline"}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispositivos:</span>
                    <span className="font-medium">{network.devices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Eficiência:</span>
                    <span className="font-medium">{network.efficiency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última atualização:</span>
                    <span className="text-sm text-gray-500">{network.lastUpdate}</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors">
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
