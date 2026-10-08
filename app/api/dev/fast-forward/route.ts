import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { IS_LOCAL, RPC_URL, chainNow } from "@/lib/chain";

// Local demo only: moves the Hardhat node clock past a transfer's expiry so refund can be shown.
export async function POST(req: Request) {
  if (!IS_LOCAL) return NextResponse.json({ error: "Local node only" }, { status: 403 });
  const { id } = await req.json();
  const t = db.get(id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const secs = Math.max(1, t.expiry - (await chainNow()) + 1);
  const rpc = (method: string, params: unknown[]) =>
    fetch(RPC_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  await rpc("evm_increaseTime", [secs]);
  await rpc("evm_mine", []);
  return NextResponse.json({ ok: true });
}
