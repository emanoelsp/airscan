/**
 * Cron API: fetches current readings from each asset's API and saves one document
 * per asset into airscan_dados_ia every run. Call this route every 1 minute
 * (e.g. Vercel Cron in vercel.json or external cron) to feed the Consumption Report.
 *
 * Security: set CRON_SECRET in env; Vercel Cron sends it as Authorization: Bearer <CRON_SECRET>.
 * You can also pass ?secret=CRON_SECRET or header x-cron-secret (optional; if not set, route still runs).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebaseconfig";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

const TIMEOUT_MS = 10000;

async function fetchReading(apiUrl: string): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(apiUrl.trim(), {
      headers: { "ngrok-skip-browser-warning": "true" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return data;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const provided = bearer ?? request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const networksSnap = await getDocs(collection(db, "airscan_networks"));
    const assetsSnap = await getDocs(collection(db, "airscan_assets"));
    const networks = networksSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as { id: string; name?: string }[];
    const assets = assetsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
      id: string;
      networkId?: string;
      name?: string;
      apiUrl?: string;
    }[];

    const withApi = assets.filter((a) => typeof a.apiUrl === "string" && (a.apiUrl as string).trim().length > 0);
    let saved = 0;

    for (const asset of withApi) {
      const apiUrl = (asset.apiUrl as string).trim();
      const data = await fetchReading(apiUrl);
      if (!data) continue;

      const pressao = typeof data.pressao === "number" ? data.pressao : parseFloat(String(data.pressao ?? 0));
      const networkId = asset.networkId ?? "";
      const assetName = asset.name ?? asset.id;

      await addDoc(collection(db, "airscan_dados_ia"), {
        networkId,
        assetId: asset.id,
        assetName,
        timestamp: serverTimestamp(),
        pressao: Number.isNaN(pressao) ? 0 : pressao,
        is_anomaly: Boolean(data.is_anomaly),
        status_sistema: data.status_sistema ?? "Desconhecido",
        mse: data.mse ?? 0,
        uncertainty: data.uncertainty ?? 0,
        drift: data.drift ?? "n/a",
        lpm_vazamento: Number(data.lpm_vazamento ?? 0),
        gap: data.gap != null ? Number(data.gap) : 0,
        threshold: data.threshold != null ? Number(data.threshold) : 0,
        duracao_minutos: data.duracao_minutos != null ? Number(data.duracao_minutos) : 0,
        severidade: data.severidade ?? "normal",
      });
      saved++;
    }

    return NextResponse.json({ ok: true, saved, total: withApi.length });
  } catch (e) {
    console.error("sync-readings error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}
