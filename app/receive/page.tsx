"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shell, Btn, Err, fmt } from "@/components/ui";
import { USERS } from "@/config/demo";

function Receive() {
  const router = useRouter();
  const u = useSearchParams().get("u") || "bounma";
  const [rows, setRows] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = () => fetch(`/api/transfers?user=${u}&role=receiver`).then((r) => r.json()).then(setRows).catch(() => {});
    setRows(null);
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [u]);

  const incoming = rows?.find((t) => t.status === "pending" && t.secondsLeft > 0);
  const lastClaimed = rows?.find((t) => t.status === "claimed");

  async function claim() {
    setBusy(true); setErr("");
    const r = await fetch(`/api/transfers/${incoming.id}/claim`, { method: "POST" });
    if (!r.ok) { setErr((await r.json()).error || "Could not claim. Try again."); setBusy(false); return; }
    router.push(`/r/${incoming.id}`);
  }

  return (
    <Shell title="KipLink" lao="ລາວ · EN" receiver>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Demo account:</span>
        {USERS.filter((x) => x.role === "receiver").map((x) => (
          <Link key={x.id} href={`/receive?u=${x.id}`} className={`rounded-full px-3 py-1 font-bold ${x.id === u ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-700"}`}>{x.name}</Link>
        ))}
      </div>
      {incoming ? (
        <div className="flex flex-1 flex-col justify-center gap-4 text-center">
          <p className="lao text-xl">ທ່ານໄດ້ຮັບເງິນ</p>
          <p className="text-xl font-semibold">You received</p>
          <div className="text-5xl font-extrabold tabular-nums text-blue-900">{fmt(incoming.amountLak)} <small className="text-lg text-blue-600">kip</small></div>
          <p className="text-xl">from <b>{incoming.senderName}</b></p>
          <div className="rounded-2xl bg-blue-100 p-3 font-mono text-3xl font-bold tracking-[0.18em] text-blue-900">{incoming.claimCode}</div>
          <p className="lao text-xs text-slate-500">Claim code · ລະຫັດຮັບເງິນ</p>
          <Err msg={err} />
          <div className="flex-1" />
          {busy && <p className="text-sm font-semibold text-blue-700">Claiming on the network…</p>}
          <Btn large disabled={busy} onClick={claim} lao="ຮັບເງິນ">{busy ? "Claiming…" : "Claim"}</Btn>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-2xl font-bold text-blue-900">{rows === null ? "Loading…" : "No money waiting"}</p>
          <p className="lao text-slate-500">ຍັງບໍ່ມີເງິນເຂົ້າ</p>
          {lastClaimed && <Link className="font-bold text-blue-600 underline" href={`/r/${lastClaimed.id}`}>Last receipt</Link>}
        </div>
      )}
    </Shell>
  );
}

export default function Page() {
  return <Suspense><Receive /></Suspense>;
}
