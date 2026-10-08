import { USERS } from "@/config/demo";
import { explorerTx, chainNow, IS_LOCAL } from "@/lib/chain";
import type { Transfer } from "@/lib/store";

const name = (id: string) => USERS.find((u) => u.id === id)?.name ?? id;

// Shape sent to the browser. The claim code is only included for the receiver view.
export async function toView(t: Transfer, forReceiver = false) {
  return {
    isLocal: IS_LOCAL, id: t.id, status: t.status, amountThb: t.amountThb, feeThb: t.feeThb, amountLak: t.amountLak,
    senderName: name(t.senderId), receiverName: name(t.receiverId),
    expiry: t.expiry, secondsLeft: Math.max(0, t.expiry - (await chainNow())),
    createdAt: t.createdAt,
    depositTx: t.depositTx, depositUrl: explorerTx(t.depositTx),
    claimTx: t.claimTx ?? null, claimUrl: t.claimTx ? explorerTx(t.claimTx) : "",
    refundTx: t.refundTx ?? null, refundUrl: t.refundTx ? explorerTx(t.refundTx) : "",
    claimCode: forReceiver ? t.claimCode : undefined,
  };
}
