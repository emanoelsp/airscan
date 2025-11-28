"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getNetworkByUser, listenToRealtimeData, getSensorDataHistory } from "@/lib/db/pressure";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos corrigidos
interface NetworkInfo {
  id: string;
  name: string;
}

interface HistoryPoint {
  time: string;
  pressao: number;
  mse: number;
  limiar: number;
}

export default function PressureMonitor() {
  const { user } = useUser();
  const [currentAsset, setCurrentAsset] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPressure, setCurrentPressure] = useState<number | null>(null);
  const [currentMSE, setCurrentMSE] = useState<number | null>(null);
  const [currentThreshold, setCurrentThreshold] = useState<number | null>(null);
  const [currentLeak, setCurrentLeak] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [leakStartTime, setLeakStartTime] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) return;

    async function fetchNetwork() {
      setLoading(true);

      const net = await getNetworkByUser(user.id);
      if (net) {
        setNetworkInfo({ id: net.id, name: net.name });
        setCurrentAsset(net.deviceId);
      }

      setLoading(false);
    }

    fetchNetwork();
  }, [user]);

  useEffect(() => {
    if (!currentAsset) return;

    const unsubscribe = listenToRealtimeData(currentAsset, (newData) => {
      if (!newData) return;

      setCurrentPressure(newData.pressao ?? null);
      setCurrentMSE(newData.mse ?? null);
      setCurrentThreshold(newData.threshold ?? null);
      setCurrentLeak(newData.isLeak ?? false);

      if (newData.isLeak && !leakStartTime) {
        setLeakStartTime(newData.lastUpdate);
      }

      setHistoryData((prevHistory) => {
        const updated = [...prevHistory];

        updated.unshift({
          time: newData.lastUpdate,
          pressao: newData.pressao,
          mse: newData.mse,
          limiar: newData.threshold,
        });

        return updated.slice(0, 30);
      });
    });

    (async () => {
      const initialHistory = await getSensorDataHistory(currentAsset, 30);
      if (initialHistory) {
        const formattedHistory = initialHistory.map((item) => ({
          time: item.lastUpdate,
          pressao: item.pressao,
          mse: item.mse,
          limiar: item.threshold,
        }));
        setHistoryData(formattedHistory.reverse());
      }
    })();

    return () => unsubscribe();
  }, [currentAsset, leakStartTime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg font-medium text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  if (!networkInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <h2 className="text-xl font-semibold text-red-500">Nenhuma Rede Associada</h2>
        <p className="text-muted-foreground text-center mt-2">
          Você ainda não está associado a um dispositivo de pressão. Peça ao administrador da fábrica para vinculá-lo a uma rede.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* CARD PRINCIPAL */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Monitoramento do Dispositivo – {networkInfo?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {/* PRESSÃO */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Pressão Atual</h3>
              <p className="text-2xl font-bold">{currentPressure ? `${currentPressure} PSI` : "--"}</p>
            </div>

            {/* MSE */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Erro (MSE)</h3>
              <p className="text-2xl font-bold">{currentMSE ? currentMSE.toFixed(4) : "--"}</p>
            </div>

            {/* LIMIAR */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Limiar</h3>
              <p className="text-2xl font-bold">{currentThreshold ? currentThreshold.toFixed(4) : "--"}</p>
            </div>

            {/* STATUS DE VAZAMENTO */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              {currentLeak ? (
                <Badge variant="destructive">Vazamento Detectado</Badge>
              ) : (
                <Badge variant="outline">Normal</Badge>
              )}
            </div>
          </div>

          {leakStartTime && (
            <div className="mt-4 text-sm text-red-600">
              Vazamento detectado desde:{" "}
              <strong>{format(new Date(leakStartTime), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GRÁFICO */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Histórico de Pressão</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pressao" stroke="#8884d8" />
              <Line type="monotone" dataKey="mse" stroke="#82ca9d" />
              <Line type="monotone" dataKey="limiar" stroke="#ff0000" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
