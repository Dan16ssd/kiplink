"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Shell, Sim, TxLink, fmt } from "@/components/ui";

export default function Claimed() {
  const { id } = useParams<{ id: string }>();
  const [t, setT] = useState<any>(null);
  useEffect(() => { fetch(`/api/transfers/${id}?role=receiver`).then((r) => r.json()).then(setT); }, [id]);
  if (!t) return <Shell title="KipLink" receiver><p>Loading…</p></Shell>;

  return (
    <Shell title="KipLink" lao="ລາວ · EN" receiver>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-blue-600 text-4xl font-extrabold text-white">✓</div>
        <p className="text-2xl font-extrabold text-blue-900">Paid out</p>
        <p className="lao text-lg">ຈ່າຍເງິນແລ້ວ</p>
        <div className="text-5xl font-extrabold tabular-nums text-blue-900">{fmt(t.amountLak)} <small className="text-lg text-blue-600">kip</small></div>
        <Sim>Simulated payout</Sim>
        <div className="w-full rounded-2xl bg-blue-50 p-4 text-left">
          <div className="flex justify-between border-b border-blue-100 py-2"><span className="text-slate-500">From</span><b>{t.senderName}</b></div>
          <div className="flex flex-col gap-1 pt-2">
            <span className="text-slate-500">Receipt</span>
            {t.claimTx ? <TxLink hash={t.claimTx} url={t.claimUrl} label="Claim" /> : <span>Not claimed yet</span>}
          </div>
        </div>
      </div>
      <Link href="/receive" className="text-center text-sm font-bold text-blue-600 underline">Back</Link>
    </Shell>
  );
}
