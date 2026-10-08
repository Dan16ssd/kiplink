import Link from "next/link";
import { PREVIEW } from "@/lib/api";

export function Shell({ title, lao, children, receiver = false }: { title: string; lao?: string; children: React.ReactNode; receiver?: boolean }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-white shadow-xl shadow-blue-900/10">
      <header className={`flex items-center justify-between px-5 py-4 text-white ${receiver ? "bg-blue-700" : "bg-blue-600"}`}>
        <Link href="/" className="text-lg font-extrabold">{title}</Link>
        {lao && <span className="lao rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{lao}</span>}
      </header>
      {PREVIEW && <p className="bg-blue-100 px-5 py-2 text-xs font-semibold text-blue-900">Preview: no blockchain here. Everything on this page is simulated in your browser.</p>}
      <div className="flex flex-1 flex-col gap-4 p-5">{children}</div>
    </main>
  );
}

export function Btn({ children, lao, ghost, large, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { lao?: string; ghost?: boolean; large?: boolean }) {
  return (
    <button {...p} className={`w-full rounded-2xl font-bold transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${large ? "py-5 text-2xl" : "py-4 text-lg"} ${ghost ? "border-2 border-blue-600 bg-white text-blue-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
      {children}
      {lao && <span className="lao block text-sm font-normal opacity-90">{lao}</span>}
    </button>
  );
}

export const Sim = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block self-start rounded-md bg-blue-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">{children}</span>
);

export const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">{children}</div>
);

export function Pill({ status }: { status: "pending" | "claimed" | "refunded" }) {
  const c = { pending: "border-[1.5px] border-blue-600 bg-white text-blue-700", claimed: "bg-blue-600 text-white", refunded: "bg-blue-100 text-blue-900" }[status];
  return <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${c}`}>{status[0].toUpperCase() + status.slice(1)}</span>;
}

export const Err = ({ msg }: { msg: string }) =>
  msg ? <p role="alert" className="rounded-xl border border-blue-300 bg-blue-50 p-3 text-sm font-semibold text-blue-900">{msg}</p> : null;

export const fmt = (n: number) => n.toLocaleString("en-US");

export function TxLink({ hash, url, label }: { hash: string; url: string; label: string }) {
  if (PREVIEW) return <span className="text-sm font-semibold text-blue-700">{label}: no blockchain transaction in preview</span>;
  const short = `${hash.slice(0, 8)}…${hash.slice(-6)}`;
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" className="break-all font-mono text-sm font-bold text-blue-600 underline">{label} {short}</a>
  ) : (
    <span className="break-all font-mono text-sm font-bold text-blue-700" title={hash}>
      {label} {short} <span className="font-sans text-xs font-normal text-slate-500">(local node, no explorer)</span>
    </span>
  );
}
