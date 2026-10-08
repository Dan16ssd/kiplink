import { NextResponse } from "next/server";
import { makeQuote, validAmount } from "@/lib/quote";

export async function GET(req: Request) {
  const amount = Number(new URL(req.url).searchParams.get("amount"));
  if (!validAmount(amount)) return NextResponse.json({ error: "Enter a whole amount between 100 and 20,000 THB" }, { status: 400 });
  const q = makeQuote(amount);
  return NextResponse.json({ ...q, usdtUnits: q.usdtUnits.toString() });
}
