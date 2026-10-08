// Demo store: a JSON file. Stand-in for Supabase until a real project exists.
import fs from "fs";
import path from "path";

export type Transfer = {
  id: string;            // uuid
  chainId: `0x${string}`; // bytes32 transferId
  senderId: string;
  receiverId: string;
  amountThb: number;
  feeThb: number;
  amountLak: number;
  usdtUnits: string;
  claimCode: string;
  status: "pending" | "claimed" | "refunded";
  expiry: number;
  depositTx: string;
  claimTx?: string;
  refundTx?: string;
  createdAt: number;
};

const FILE = path.join(process.cwd(), "data", "db.json");

function read(): Transfer[] {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return []; }
}
function write(rows: Transfer[]) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(rows, null, 2));
}

export const db = {
  list: () => read().sort((a, b) => b.createdAt - a.createdAt),
  get: (id: string) => read().find((t) => t.id === id),
  insert: (t: Transfer) => write([...read(), t]),
  update: (id: string, patch: Partial<Transfer>) => write(read().map((t) => (t.id === id ? { ...t, ...patch } : t))),
};
