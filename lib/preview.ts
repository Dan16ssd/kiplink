// In-browser stand-in for the API, used only on the public GitHub Pages preview.
// Nothing here touches a blockchain. Data lives in this browser's localStorage.
import { DEMO, USERS } from "@/config/demo";
import { makeQuote, validAmount } from "@/lib/quote";

type Row = {
  id: string; senderId: string; receiverId: string; amountThb: number; feeThb: number; amountLak: number;
  claimCode: string; status: "pending" | "claimed" | "refunded"; expiry: number; createdAt: number;
};

const KEY = "kiplink-preview-v1";
const OFFSET_KEY = "kiplink-preview-offset";

const load = (): Row[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const save = (rows: Row[]) => { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch {} };
const offset = () => { try { return Number(localStorage.getItem(OFFSET_KEY) || 0); } catch { return 0; } };
const now = () => Math.floor(Date.now() / 1000) + offset();
const name = (id: string) => USERS.find((u) => u.id === id)?.name ?? id;
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function view(t: Row, forReceiver: boolean) {
  const none = { depositTx: "preview", depositUrl: "", claimUrl: "", refundUrl: "" };
  return {
    ...none, isLocal: true, preview: true, id: t.id, status: t.status, amountThb: t.amountThb, feeThb: t.feeThb, amountLak: t.amountLak,
    senderName: name(t.senderId), receiverName: name(t.receiverId), expiry: t.expiry, secondsLeft: Math.max(0, t.expiry - now()),
    createdAt: t.createdAt, claimTx: t.status === "claimed" ? "preview" : null, refundTx: t.status === "refunded" ? "preview" : null,
    claimCode: forReceiver ? t.claimCode : undefined,
  };
}

export async function previewFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = new URL(path, "http://preview.local");
  const method = (init?.method || "GET").toUpperCase();
  const parts = url.pathname.replace(/^\/api\//, "").split("/");
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  await new Promise((r) => setTimeout(r, method === "POST" ? 900 : 60)); // brief pause so pending states are visible

  if (parts[0] === "quote") {
    const amount = Number(url.searchParams.get("amount"));
    if (!validAmount(amount)) return reply({ error: "Enter a whole amount between 100 and 20,000 THB" }, 400);
    const q = makeQuote(amount);
    return reply({ ...q, usdtUnits: q.usdtUnits.toString() });
  }

  if (parts[0] === "transfers" && parts.length === 1) {
    if (method === "POST") {
      const { senderId, receiverId, amountThb } = body;
      if (!validAmount(amountThb)) return reply({ error: "Invalid amount" }, 400);
      const q = makeQuote(amountThb);
      const row: Row = {
        id: crypto.randomUUID(), senderId, receiverId, amountThb, feeThb: q.feeThb, amountLak: q.amountLak,
        claimCode: String(100000 + Math.floor(Math.random() * 900000)), status: "pending", expiry: now() + DEMO.expirySeconds, createdAt: Date.now(),
      };
      save([...load(), row]);
      return reply(view(row, false));
    }
    const user = url.searchParams.get("user");
    const receiver = url.searchParams.get("role") === "receiver";
    const rows = load().filter((t) => (receiver ? t.receiverId === user : t.senderId === user)).sort((a, b) => b.createdAt - a.createdAt);
    return reply(rows.map((t) => view(t, receiver)));
  }

  if (parts[0] === "transfers") {
    const rows = load();
    const t = rows.find((r) => r.id === parts[1]);
    if (!t) return reply({ error: "Not found" }, 404);
    const action = parts[2];
    if (!action) return reply(view(t, url.searchParams.get("role") === "receiver"));
    if (t.status !== "pending") return reply({ error: `Already ${t.status}` }, 409);
    if (action === "claim") t.status = "claimed";
    else if (action === "refund") {
      if (now() < t.expiry) return reply({ error: "Not expired yet" }, 409);
      t.status = "refunded";
    }
    save(rows);
    return reply(view(t, action === "claim"));
  }

  if (parts[0] === "dev") {
    const t = load().find((r) => r.id === body.id);
    if (!t) return reply({ error: "Not found" }, 404);
    try { localStorage.setItem(OFFSET_KEY, String(offset() + Math.max(1, t.expiry - now() + 1))); } catch {}
    return reply({ ok: true });
  }

  return reply({ error: "Not found" }, 404);
}
