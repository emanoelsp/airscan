/**
 * Cron API: removes documents from airscan_dados_ia older than 60 days.
 * Run daily (e.g. Vercel Cron or external cron). Same auth as sync-readings (CRON_SECRET).
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebaseconfig";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  writeBatch,
  Timestamp,
} from "firebase/firestore";

const RETENTION_DAYS = 60;
const BATCH_SIZE = 500;

function checkCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const provided = bearer ?? request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
  return provided === secret;
}

export async function GET(request: NextRequest) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
    const cutoffTimestamp = Timestamp.fromDate(cutoff);

    const col = collection(db, "airscan_dados_ia");
    let totalDeleted = 0;

    // Delete in batches (Firestore limit 500 per batch)
    while (true) {
      const q = query(col, where("timestamp", "<", cutoffTimestamp), limit(BATCH_SIZE));
      const snapshot = await getDocs(q);
      if (snapshot.empty) break;

      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      totalDeleted += snapshot.docs.length;

      if (snapshot.docs.length < BATCH_SIZE) break;
    }

    return NextResponse.json({
      ok: true,
      deleted: totalDeleted,
      olderThan: cutoff.toISOString(),
    });
  } catch (e) {
    console.error("cleanup-old-readings error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
