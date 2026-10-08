import { DEMO } from "@/config/demo";

export function makeQuote(amountThb: number) {
  const net = amountThb - DEMO.feeThb;
  return {
    amountThb,
    feeThb: DEMO.feeThb,
    rate: DEMO.lakPerThb,
    amountLak: Math.floor(net * DEMO.lakPerThb),
    usdtUnits: BigInt(Math.floor((net / DEMO.thbPerUsdt) * 1e6)), // 6 decimals
  };
}

export function validAmount(n: number) {
  return Number.isFinite(n) && Number.isInteger(n) && n >= DEMO.minThb && n <= DEMO.maxThb;
}
