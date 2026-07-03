import { defaultWagmiConfig } from "@web3modal/wagmi/react";
import { base } from "wagmi/chains";

// Get WalletConnect Project ID from environment or use a generic fallback ID
export const projectId = (import.meta as any).env.VITE_WALLET_CONNECT_PROJECT_ID || "c7b94db22be3f790c3773199c095303a";

export const metadata = {
  name: "DecentraForum",
  description: "On-Chain Web3 Social Forum dApp on Base Network",
  url: typeof window !== "undefined" ? window.location.origin : "https://decentraforum.xyz",
  icons: ["https://api.dicebear.com/7.x/identicon/svg?seed=decentraforum"],
};

export const chains = [base] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
