"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shell, Btn, Label, Pill, Err, TxLink, fmt } from "@/components/ui";

function Step({ done, n, title, sub }: { done: boolean; n: number; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 last:pb-0">
      <span className={`grid h-6 w-6 flex-none place-items-center rounded-full text-xs font-extrabold ${done ? "bg-blue-600 text-white" : "border-2 border-blue-100 bg-white text-slate-400"}`}>{done ? "✓" : n}</span>
      <div><b className={done ? "" : "text-slate-500"}>{title}</b>{sub && <div className="text-xs text-slate-500">{sub}</div>}</div>
    </div>
  );
}

const left = (s: number) => `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`;

function Status() {
  const id = useSearchParams().get("id") ?? "";
  const [t, setT] = useState<any>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api(`/api/transfers/${id}`).then((r) => r.json()).then(setT).catch(() => {});
  useEffect(() => {
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [id]);

  async function post(path: string, body?: object) {
    setBusy(true); setErr("");
    const r = await api(path, { method: "POST", headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) setErr((await r.json()).error || "Something went wrong.");
    await load();
    setBusy(false);
  }

  if (!t) return <Shell title="Transfer"><p className="text-slate-500">Loading…</p></Shell>;
  const expired = t.status === "pending" && t.secondsLeft === 0;

  return (
    <Shell title="Transfer" lao="ສະຖານະ">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label>To {t.receiverName}</Label>
          <div className="text-4xl font-extrabold tabular-nums text-blue-900">{fmt(t.amountLak)} <small className="text-lg text-blue-600">LAK</small></div>
        </div>
        <Pill status={t.status} />
      </div>
      <div>
        <Step done n={1} title="Baht paid" sub="Simulated payment" />
        <Step done n={2} title="Locked in escrow" sub={t.preview ? "Simulated in preview, no blockchain" : "Test network, confirmed"} />
        {t.status === "refunded" ? (
          <Step done n={3} title="Refunded to you" sub="Timeout passed, unclaimed" />
        ) : (
          <Step done={t.status === "claimed"} n={3}
            title={t.status === "claimed" ? `${t.receiverName} claimed` : `Waiting for ${t.receiverName} to claim`}
            sub={t.status === "pending" ? (expired ? "Timed out. You can refund." : `Expires in ${left(t.secondsLeft)}`) : undefined} />
        )}
        {t.status !== "refunded" && <Step done={t.status === "claimed"} n={4} title="Kip paid out" sub="Simulated payout" />}
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-blue-50 p-4">
        <Label>Transactions</Label>
        <TxLink hash={t.depositTx} url={t.depositUrl} label="Deposit" />
        {t.claimTx && <TxLink hash={t.claimTx} url={t.claimUrl} label="Claim" />}
        {t.refundTx && <TxLink hash={t.refundTx} url={t.refundUrl} label="Refund" />}
      </div>
      <Err msg={err} />
      <div className="flex-1" />
      {t.status === "pending" && (
        <>
          <Btn ghost disabled={!expired || busy} onClick={() => post(`/api/transfers/${id}/refund`)}>{expired ? "Refund to me" : "Refund available after timeout"}</Btn>
          {t.isLocal && !expired && (
            <button onClick={() => post("/api/dev/fast-forward", { id })} className="text-xs font-bold text-blue-600 underline">Demo only: skip the timeout (local node)</button>
          )}
        </>
      )}
    </Shell>
  );
}

export default function Page() {
  return <Suspense><Status /></Suspense>;
}
