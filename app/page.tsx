"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, Pill, Label, fmt } from "@/components/ui";

const SENDER = "noy";

export default function Home() {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => {
    const load = () => fetch(`/api/transfers?user=${SENDER}`).then((r) => r.json()).then(setRows).catch(() => {});
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <Shell title="KipLink" lao="EN · ລາວ">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-900">Hello, Noy</h1>
        <p className="lao text-sm text-slate-500">ສະບາຍດີ, ນ້ອຍ</p>
      </div>
      <Link href="/send" className="block rounded-2xl bg-blue-600 py-4 text-center text-lg font-bold text-white hover:bg-blue-700">
        Send money<span className="lao block text-sm font-normal opacity-90">ສົ່ງເງິນ</span>
      </Link>
      <Label>Past transfers · ການໂອນກ່ອນໜ້າ</Label>
      <div className="flex flex-col">
        {rows === null && <p className="text-sm text-slate-500">Loading…</p>}
        {rows?.length === 0 && <p className="text-sm text-slate-500">No transfers yet.</p>}
        {rows?.map((t) => (
          <Link key={t.id} href={`/status/${t.id}`} className="flex items-center justify-between gap-3 border-b border-blue-100 py-3 last:border-0">
            <div>
              <b>{t.receiverName}</b>
              <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()} · {fmt(t.amountThb)} THB</div>
            </div>
            <Pill status={t.status} />
          </Link>
        ))}
      </div>
      <div className="flex-1" />
      <p className="text-xs text-slate-500">Demo app on a test network. No real money moves.</p>
      <Link href="/receive?u=bounma" className="text-center text-sm font-bold text-blue-600 underline">Open the receiver screen (demo)</Link>
    </Shell>
  );
}
