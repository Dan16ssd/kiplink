"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, Btn, Label, Err, fmt } from "@/components/ui";
import { USERS } from "@/config/demo";

const receivers = USERS.filter((u) => u.role === "receiver");

export default function Send() {
  const router = useRouter();
  const [amount, setAmount] = useState("1000");
  const [to, setTo] = useState<string>(receivers[0].id);
  const [quote, setQuote] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const n = Number(amount);
    const t = setTimeout(() => {
      fetch(`/api/quote?amount=${n}`).then(async (r) => {
        const j = await r.json();
        if (r.ok) { setQuote(j); setErr(""); } else { setQuote(null); setErr(j.error); }
      });
    }, 250);
    return () => clearTimeout(t);
  }, [amount]);

  return (
    <Shell title="Send money" lao="ສົ່ງເງິນ">
      <Label>You send · ທ່ານສົ່ງ</Label>
      <label className="flex items-baseline justify-between rounded-2xl border-2 border-blue-600 px-4 py-3">
        <input aria-label="Amount in THB" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          className="w-full min-w-0 bg-transparent text-4xl font-extrabold tabular-nums text-blue-900 outline-none" />
        <span className="font-bold text-blue-600">THB</span>
      </label>
      <Err msg={err} />
      <Label>To · ຜູ້ຮັບ</Label>
      {receivers.map((u) => (
        <button key={u.id} onClick={() => setTo(u.id)} className={`flex items-center gap-3 rounded-2xl p-3 text-left ${to === u.id ? "border-2 border-blue-600 bg-blue-50" : "border border-blue-100"}`}>
          <span className={`grid h-10 w-10 flex-none place-items-center rounded-full font-extrabold ${to === u.id ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
            {u.name.split(" ").map((w) => w[0]).join("")}
          </span>
          <span><b className="block">{u.name}</b><span className="text-xs text-slate-500">{u.place}</span></span>
        </button>
      ))}
      <div className="rounded-2xl bg-blue-50 p-4">
        <Label>They get · ຜູ້ຮັບໄດ້ຮັບ</Label>
        <div className="text-4xl font-extrabold tabular-nums text-blue-900">{quote ? fmt(quote.amountLak) : "—"} <small className="text-lg text-blue-600">LAK</small></div>
        <p className="text-xs text-slate-500">Demo rate: 1 THB = {quote?.rate ?? 640} LAK</p>
      </div>
      <div className="flex-1" />
      <Btn lao="ສືບຕໍ່" disabled={!quote} onClick={() => router.push(`/confirm?amount=${amount}&to=${to}`)}>Continue</Btn>
    </Shell>
  );
}
