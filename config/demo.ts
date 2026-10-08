// DEMO VALUES ONLY. Placeholders, not market or real fee data.
export const DEMO = {
  feeThb: 20,            // flat fee, demo
  lakPerThb: 640,        // demo rate
  thbPerUsdt: 35,        // demo rate used for the mock USDT amount
  expirySeconds: 24 * 3600,
  minThb: 100,
  maxThb: 20000,
};

export const USERS = [
  { id: "noy", name: "Noy", role: "sender", place: "Bangkok, Thailand" },
  { id: "bounma", name: "Mae Bounma", role: "receiver", place: "Vientiane, Laos" },
  { id: "khamla", name: "Pa Khamla", role: "receiver", place: "Savannakhet, Laos" },
] as const;
