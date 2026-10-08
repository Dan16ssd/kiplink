# KipLink (demo)

Hackathon prototype: a Lao worker in Thailand sends baht, it moves as USDT through an escrow contract, and the family in Laos claims it in kip.

**Public preview:** https://dan16ssd.github.io/kiplink/ (simulated in the browser, no blockchain).

Baht pay-in and kip payout are simulated. Rates and fees are demo values.

## Run locally with the real contract

    npm install
    npm run node          # local chain, own terminal
    npm run deploy:local
    npm run dev           # http://localhost:3000

`npm test` runs the contract tests. Copy `.env.example` to `.env.local` to point at a testnet.
