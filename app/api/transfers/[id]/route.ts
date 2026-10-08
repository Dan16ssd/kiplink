import { NextResponse } from "next/server";
import { db } from "@/lib/store";
import { toView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const t = db.get(params.id);
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const forReceiver = new URL(req.url).searchParams.get("role") === "receiver";
  return NextResponse.json(await toView(t, forReceiver));
}
