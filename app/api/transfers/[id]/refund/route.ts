import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { refundOnChain, chainNow } from "@/lib/chain";
import { toView } from "@/lib/view";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const t = db.get(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (t.status !== "pending") return NextResponse.json({ error: `Already ${t.status}` }, { status: 409 });
  if ((await chainNow()) < t.expiry) return NextResponse.json({ error: "Not expired yet" }, { status: 409 });
  try {
    const refundTx = await refundOnChain(t.chainId);
    db.update(t.id, { status: "refunded", refundTx });
    return NextResponse.json(await toView(db.get(t.id)!));
  } catch (e: any) {
    return NextResponse.json({ error: e.shortMessage || e.message }, { status: 502 });
  }
}
