import fs from "fs";
import path from "path";
import { createPublicClient, createWalletClient, defineChain, http, parseAbi, keccak256, toBytes, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Falls back to the local Hardhat node + deployments/localhost.json when env vars are empty.
// The fallback key is Hardhat's well-known public account #0. It is for the local node only.
const LOCAL_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

function deployed() {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "deployments", "localhost.json"), "utf8")); } catch { return {}; }
}
const d = deployed();

export const CHAIN_ID = Number(process.env.CHAIN_ID || 31337);
export const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
export const EXPLORER_URL = process.env.EXPLORER_URL || "";
export const IS_LOCAL = CHAIN_ID === 31337;
const TOKEN = (process.env.MOCK_USDT_ADDRESS || d.token) as Hex;
const ESCROW = (process.env.ESCROW_ADDRESS || d.escrow) as Hex;

export const chain = defineChain({
  id: CHAIN_ID, name: IS_LOCAL ? "Local Hardhat" : "Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [RPC_URL] } },
});

const account = privateKeyToAccount((process.env.BACKEND_PRIVATE_KEY as Hex) || LOCAL_KEY);
export const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });

const tokenAbi = parseAbi([
  "function mint(address to, uint256 amount)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
]);
const escrowAbi = parseAbi([
  "function deposit(bytes32 transferId, uint256 amount, bytes32 claimHash, uint64 expiry)",
  "function claim(bytes32 transferId, string claimCode)",
  "function refund(bytes32 transferId)",
]);

export const hashCode = (code: string) => keccak256(toBytes(code));
export const explorerTx = (hash: string) => (EXPLORER_URL ? `${EXPLORER_URL.replace(/\/$/, "")}/${hash}` : "");

async function send(request: any) {
  const hash = await wallet.writeContract(request);
  const r = await publicClient.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw new Error("Transaction failed");
  return hash;
}

export async function depositOnChain(id: Hex, amount: bigint, claimHash: Hex, expiry: number) {
  if (!TOKEN || !ESCROW) throw new Error("Contracts not deployed. Run: npm run node, then npm run deploy:local");
  // Mock USDT has a public mint, so the demo backend tops itself up before each deposit.
  await send({ address: TOKEN, abi: tokenAbi, functionName: "mint", args: [account.address, amount] });
  const allowance = await publicClient.readContract({ address: TOKEN, abi: tokenAbi, functionName: "allowance", args: [account.address, ESCROW] });
  if (allowance < amount) await send({ address: TOKEN, abi: tokenAbi, functionName: "approve", args: [ESCROW, 2n ** 255n] });
  return send({ address: ESCROW, abi: escrowAbi, functionName: "deposit", args: [id, amount, claimHash, BigInt(expiry)] });
}
export const claimOnChain = (id: Hex, code: string) => send({ address: ESCROW, abi: escrowAbi, functionName: "claim", args: [id, code] });
export const refundOnChain = (id: Hex) => send({ address: ESCROW, abi: escrowAbi, functionName: "refund", args: [id] });

export async function chainNow() {
  return Number((await publicClient.getBlock()).timestamp);
}
