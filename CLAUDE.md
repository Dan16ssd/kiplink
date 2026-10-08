# KipLink

Hackathon prototype for the bitqik Web3 Hackathon (build days 17-18 Oct 2026, final pitch 22 Oct 2026).
"KipLink" is a placeholder name.

## What this is

A cross-border remittance prototype. A Lao worker in Thailand sends baht; it travels as USDT through an
escrow smart contract; the family in Laos claims it and is paid in kip. Neither user ever sees a wallet
or handles crypto directly.

Goal of this repo: one end-to-end flow that works live on two phones. Nothing else matters until that works.

## The flow to build

1. Sender enters an amount in THB and picks a receiver.
2. App shows a quote: fee, exchange rate, exact LAK the receiver gets.
3. Sender confirms. Baht pay-in is SIMULATED (a button, clearly labelled "simulated payment").
4. Backend converts THB to mock USDT at the quoted rate and calls `deposit` on the escrow contract.
5. Receiver sees a notification with the LAK amount and a claim code.
6. Receiver taps Claim. Backend calls `claim` on the contract; USDT is released to the off-ramp address.
7. Kip payout is SIMULATED (a "paid out" screen, clearly labelled).
8. Both sides see a receipt with a link to the transaction on the block explorer.
9. If unclaimed after the timeout, the sender can trigger `refund`.

## Real vs simulated

| Part | Status |
| --- | --- |
| Escrow contract on a testnet | Real |
| Mock USDT token transfers | Real (our own test token) |
| Sender and receiver screens | Real |
| Baht pay-in | Simulated, labelled in the UI |
| USDT to kip conversion and payout | Simulated, labelled in the UI |
| Exchange rates and fees | Hardcoded config values, labelled as demo rates |

Never present a simulated part as real, in the UI or in copy.

## Tech stack

- App: Next.js (App Router), TypeScript, Tailwind. Mobile-first layout, max width about 420px.
- Backend: Next.js API routes. Supabase (Postgres) for users, transfers, claim codes.
- Contracts: Solidity, OpenZeppelin, Hardhat.
- Chain access: viem.
- Network: an EVM testnet. NOT YET CONFIRMED. Read chain ID, RPC URL and explorer URL from env vars
  so it can be switched in one place.
- Token: `MockUSDT`, an ERC-20 with 6 decimals and a public mint for testing.

Wallets: the backend holds one testnet key and signs all transactions on behalf of users (custodial demo).
Users log in with a phone number or a simple demo account picker. No MetaMask, no seed phrases.

## Smart contract: `RemittanceEscrow`

- `deposit(bytes32 transferId, uint256 amount, bytes32 claimHash, uint64 expiry)`
  pulls `amount` of MockUSDT from the caller and stores the transfer.
- `claim(bytes32 transferId, string claimCode)`
  checks `keccak256(claimCode) == claimHash`, not expired, not already settled; sends USDT to the
  off-ramp address.
- `refund(bytes32 transferId)`
  after expiry and if unclaimed, returns USDT to the depositor.
- Events: `Deposited`, `Claimed`, `Refunded`.
- Use OpenZeppelin `SafeERC20` and `ReentrancyGuard`. Each transfer settles exactly once.

Write Hardhat tests for: happy path, wrong claim code, double claim, claim after expiry, refund before
expiry (must fail), refund after expiry.

## Screens

Sender (Lao and English labels):
1. Home: balance-free, just "Send money" and past transfers.
2. Send: amount in THB, receiver picker, live quote.
3. Confirm: fee, rate, LAK received, simulated pay button.
4. Status: pending / claimed / refunded, explorer link.

Receiver:
1. Incoming: "You received X kip from NAME", Claim button.
2. Claimed: simulated payout confirmation, receipt, explorer link.

Keep the receiver side extremely simple: large text, one button per screen.

## Suggested structure

```
/contracts        Solidity sources
/test             Hardhat tests
/scripts          deploy and seed scripts
/app              Next.js routes (sender, receiver, api)
/lib              chain client, quote logic, db client
/config           demo rates and fees
```

## Build order

1. Contracts and tests passing locally.
2. Deploy script; deploy MockUSDT and RemittanceEscrow to a local Hardhat node.
3. Backend routes: create transfer, get quote, claim, refund, list transfers.
4. Sender screens wired to the backend.
5. Receiver screens wired to the backend.
6. End-to-end run on the local node, then on the testnet.
7. Polish: Lao labels, receipt screen, loading and error states.
8. Stretch only after 1-7 work: Lao voice announcement for the receiver.

Stop and report after each step rather than building everything at once.

## Rules

- Testnet only. Never use mainnet, real funds, or real USDT.
- Secrets live in `.env.local`, which is gitignored. Commit a `.env.example` with empty values.
  Never print or commit private keys.
- No real payment, banking or KYC integrations. Do not call any bitqik or third-party production API.
- Demo rates and fees are placeholders in `/config`; do not invent "real" market or fee data.
- Prefer the simplest thing that makes the demo work. No extra features, no admin panel, no analytics.
- If the testnet is slow, the UI must show a clear pending state rather than hang.

## Done means

On two phones, on the testnet: sender sends 1,000 THB, receiver sees the LAK amount within about a
minute, taps Claim, and both see a receipt linking to a real transaction on the explorer.

## Open items (fill in after the 10 Oct workshop)

- Chain / testnet to use:
- Whether sponsor tooling (bitqik API or sandbox, Tether developer tools) is expected:
- Presentation language (Lao, English, or both):
- Team members and roles:
