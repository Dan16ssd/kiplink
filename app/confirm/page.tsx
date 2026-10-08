"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shell, Btn, Label, Sim, Err, fmt } from "@/components/ui";
import { USERS } from "@/config/demo";

function Confirm() {
  const router = useRouter();
  const sp = useSearchParams();
  const amount = Number(sp.get("amount"));
  const to = USERS.find((u) => u.id === sp.get("to"));
  const [q, setQ] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/quote?amount=${amount}`).then(async (r) => {
      const j = await r.json();
      r.ok ? setQ(j) : setErr(j.error);
    });
  }, [amount]);

  async function pay() {
    setBusy(true); setErr("");
    const r = await fetch("/api/transfers", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ senderId: "noy", receiverId: to?.id, amountThb: amount }),
    });
    const j = await r.json();
    if (!r.ok) { setErr(j.error || "Something went wrong. Try again."); setBusy(false); return; }
    router.push(`/status/${j.id}`);
  }

  const rows: [string, string | undefined][] = [
    ["To", to?.name],
    ["You send · ທ່ານສົ່ງ", `${fmt(amount)} THB`],
    ["Fee · ຄ່າທຳນຽມ", q ? `${q.feeThb} THB` : "—"],
    ["Rate · ອັດຕາ", q ? `1 THB = ${q.rate} LAK` : "—"],
  ];

  return (
    <Shell title="Confirm" lao="ຢືນຢັນ">
      <div className="rounded-2xl border border-blue-100 px-4 py-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-blue-100 py-2 last:border-0">
            <span className="text-slate-500">{k}</span><b className="tabular-nums">{v}</b>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-blue-50 p-4">
        <Label>They get exactly · ຜູ້ຮັບໄດ້ຮັບ</Label>
        <div className="text-4xl font-extrabold tabular-nums text-blue-900">{q ? fmt(q.amountLak) : "—"} <small className="text-lg text-blue-600">LAK</small></div>
      </div>
      <Sim>Demo rates · simulated pay-in</Sim>
      <Err msg={err} />
      <div className="flex-1" />
      {busy && <p className="text-center text-sm font-semibold text-blue-700">Sending to the network. This can take up to a minute.</p>}
      <Btn disabled={!q || busy} onClick={pay} lao="ການຈ່າຍຈຳລອງ">{busy ? "Sending…" : `Pay ${fmt(amount)} THB (simulated payment)`}</Btn>
      <Btn ghost disabled={busy} onClick={() => router.back()}>Back</Btn>
    </Shell>
  );
}

export default function Page() {
  return <Suspense><Confirm /></Suspense>;
}
