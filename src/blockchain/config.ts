/**
 * Web3 dApp Blockchain Configurations
 * source of truth for Base Network configurations and contract addresses
 */

export const CHAIN_CONFIG = {
  networkName: "Base",
  chainId: 8453,
  rpcUrl: "https://mainnet.base.org",
  blockExplorer: "https://basescan.org",
};

export const CONTRACT_ADDRESSES = {
  ForumReputation: "0x20D902Adc3c7956C0aE06E685e773C9d26d76372",
  SoulboundReputationTokens: "0x5b41CD272C6cd5D2EcdE02771d0aD62962378b1A",
  ForumIdentityRegistry: "0x1eF070954192D53df4b4cc9c2941aeC315B3e6F7",
};

export const DEPLOYER_ADDRESS = "0x08a1D669F33c6591f0bf0CCA49D6d98eb9050b20";
export const INITIAL_ADMIN = "0x08a1D669F33c6591f0bf0CCA49D6d98eb9050b20";
export const VERIFICATION_BADGE_ID = 1;
