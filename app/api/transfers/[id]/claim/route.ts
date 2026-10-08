import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { claimOnChain } from "@/lib/chain";
import { toView } from "@/lib/view";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const t = db.get(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (t.status !== "pending") return NextResponse.json({ error: `Already ${t.status}` }, { status: 409 });
  try {
    const claimTx = await claimOnChain(t.chainId, t.claimCode);
    db.update(t.id, { status: "claimed", claimTx });
    return NextResponse.json(await toView(db.get(t.id)!, true));
  } catch (e: any) {
    return NextResponse.json({ error: e.shortMessage || e.message }, { status: 502 });
  }
}
