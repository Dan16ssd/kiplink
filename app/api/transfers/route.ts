import { NextResponse } from "next/server";
import { randomUUID, randomInt } from "crypto";
import { keccak256, toBytes } from "viem";
import { DEMO, USERS } from "@/config/demo";
import { makeQuote, validAmount } from "@/lib/quote";
import { db } from "@/lib/store";
import { depositOnChain, hashCode, chainNow } from "@/lib/chain";
import { toView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const user = p.get("user");
  const role = p.get("role");
  const rows = db.list().filter((t) => (role === "receiver" ? t.receiverId === user : t.senderId === user));
  return NextResponse.json(await Promise.all(rows.map((t) => toView(t, role === "receiver"))));
}

export async function POST(req: Request) {
  const { senderId, receiverId, amountThb } = await req.json();
  if (!USERS.some((u) => u.id === senderId) || !USERS.some((u) => u.id === receiverId)) return NextResponse.json({ error: "Unknown user" }, { status: 400 });
  if (!validAmount(amountThb)) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  // The simulated baht payment already happened in the UI. Convert at the quoted demo rate and deposit.
  const q = makeQuote(amountThb);
  const id = randomUUID();
  const chainId = keccak256(toBytes(id));
  const claimCode = String(randomInt(100000, 1000000));
  const expiry = (await chainNow()) + DEMO.expirySeconds;
  try {
    const depositTx = await depositOnChain(chainId, q.usdtUnits, hashCode(claimCode), expiry);
    const row = { id, chainId, senderId, receiverId, amountThb, feeThb: q.feeThb, amountLak: q.amountLak, usdtUnits: q.usdtUnits.toString(),
      claimCode, status: "pending" as const, expiry, depositTx, createdAt: Date.now() };
    db.insert(row);
    return NextResponse.json(await toView(row));
  } catch (e: any) {
    return NextResponse.json({ error: e.shortMessage || e.message }, { status: 502 });
  }
}
