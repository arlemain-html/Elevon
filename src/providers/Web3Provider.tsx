import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import { CHAIN_CONFIG, CONTRACT_ADDRESSES, VERIFICATION_BADGE_ID } from "../blockchain/config";
import {
  FORUM_IDENTITY_REGISTRY_ABI,
  FORUM_REPUTATION_ABI,
  SOULBOUND_REPUTATION_TOKENS_ABI,
} from "../blockchain/abis";
import { UserStats, BadgeType } from "../types/forum";
import { ForumBackendService } from "../services/supabase";

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  readOnlyProvider: ethers.JsonRpcProvider;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  userStats: UserStats | null;
  badges: BadgeType[];
  isTxPending: boolean;
  currentTxHash: string | null;
  txError: string | null;
  txSuccessMessage: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<boolean>;
  refreshStats: (targetAddress?: string) => Promise<void>;
  
  // Contract Transactions
  registerIdentityOnChain: (username: string) => Promise<string | null>;
  updateProfileHashOnChain: (newUsername: string) => Promise<string | null>;
  setVerificationOnChain: (account: string, verified: boolean) => Promise<string | null>;
  grantBadgeOnChain: (account: string, badgeId: number) => Promise<string | null>;
  unlockAchievementOnChain: (account: string, achievementId: number) => Promise<string | null>;
  assignCommunityRoleOnChain: (communityId: string, account: string, role: number) => Promise<string | null>;
  recordContributionOnChain: (account: string, xp: number, reputationDelta: number, reason: string) => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [isTxPending, setIsTxPending] = useState<boolean>(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccessMessage, setTxSuccessMessage] = useState<string | null>(null);
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);

  // 1. Read-only provider connected to Base RPC directly
  const readOnlyProvider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);

  // Initialize and check for existing connection
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    const checkConnection = async () => {
      if (ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(ethereum);
          setProvider(browserProvider);

          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const network = await browserProvider.getNetwork();
            const currentChainId = Number(network.chainId);
            setChainId(currentChainId);
            setAccount(accounts[0]);
            
            const isCorrect = currentChainId === CHAIN_CONFIG.chainId;
            setIsCorrectNetwork(isCorrect);

            if (isCorrect) {
              const currentSigner = await browserProvider.getSigner();
              setSigner(currentSigner);
            }
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Setup Ethereum event listeners
    if (ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          refreshStats(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (hexChainId: string) => {
        const newChainId = parseInt(hexChainId, 16);
        setChainId(newChainId);
        setIsCorrectNetwork(newChainId === CHAIN_CONFIG.chainId);
        window.location.reload();
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Sync / refresh user stats and badges
  useEffect(() => {
    if (account && isCorrectNetwork) {
      refreshStats(account);
    } else {
      // Load default global demo stats in read-only mode for deployer if wallet disconnected
      refreshStats(CONTRACT_ADDRESSES.ForumIdentityRegistry);
    }
  }, [account, isCorrectNetwork]);

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      setTxError("Browser wallet not detected. Please install MetaMask or Coinbase Wallet.");
      return;
    }

    setIsConnecting(true);
    setTxError(null);
    try {
      const browserProvider = new ethers.BrowserProvider(ethereum);
      setProvider(browserProvider);

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);
      
      setChainId(currentChainId);
      setAccount(accounts[0]);
      
      const isCorrect = currentChainId === CHAIN_CONFIG.chainId;
      setIsCorrectNetwork(isCorrect);

      if (isCorrect) {
        const currentSigner = await browserProvider.getSigner();
        setSigner(currentSigner);
      } else {
        await switchNetwork();
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      setTxError(error.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setSigner(null);
    setAccount(null);
    setUserStats(null);
    setBadges([]);
    setTxError(null);
    setTxSuccessMessage(null);
  };

  const switchNetwork = async (): Promise<boolean> => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;
    try {
      const targetHex = "0x" + CHAIN_CONFIG.chainId.toString(16);
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }],
      });
      setIsCorrectNetwork(true);
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + CHAIN_CONFIG.chainId.toString(16),
                chainName: CHAIN_CONFIG.networkName,
                rpcUrls: [CHAIN_CONFIG.rpcUrl],
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: [CHAIN_CONFIG.blockExplorer],
              },
            ],
          });
          setIsCorrectNetwork(true);
          return true;
        } catch (addError) {
          console.error("Failed to add Base network", addError);
        }
      }
      console.error("Failed to switch network", switchError);
      return false;
    }
  };

  // Convert a plain string into bytes32 hex representation
  const stringToBytes32 = (str: string): string => {
    const utf8Bytes = ethers.toUtf8Bytes(str);
    if (utf8Bytes.length > 32) {
      throw new Error("String exceeds 32 bytes limit");
    }
    const bytes32 = new Uint8Array(32);
    bytes32.set(utf8Bytes);
    return ethers.hexlify(bytes32);
  };

  // Parse bytes32 hex back to clean string
  const bytes32ToString = (hex: string): string => {
    try {
      const cleanHex = hex.replace(/^0x/, "").replace(/(00)*$/, "");
      const bytes = ethers.getBytes("0x" + cleanHex);
      return ethers.toUtf8String(bytes);
    } catch {
      return hex;
    }
  };

  const refreshStats = async (targetAddress?: string) => {
    const addressToQuery = targetAddress || account;
    if (!addressToQuery) return;

    try {
      // Connect contract instances using read-only provider (no wallet required to view)
      const identityRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.ForumIdentityRegistry,
        FORUM_IDENTITY_REGISTRY_ABI,
        readOnlyProvider
      );

      const reputationContract = new ethers.Contract(
        CONTRACT_ADDRESSES.ForumReputation,
        FORUM_REPUTATION_ABI,
        readOnlyProvider
      );

      const soulboundTokensContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SoulboundReputationTokens,
        SOULBOUND_REPUTATION_TOKENS_ABI,
        readOnlyProvider
      );

      // 1. Fetch Identity status
      let isRegistered = false;
      let isVerified = false;
      let profileHash = "0x" + "0".repeat(64);
      let registeredAt = 0;
      let updatedAt = 0;

      try {
        const identity = await identityRegistry.identityOf(addressToQuery);
        isRegistered = identity.registered;
        isVerified = identity.verified;
        profileHash = identity.profileHash;
        registeredAt = Number(identity.registeredAt);
        updatedAt = Number(identity.updatedAt);
      } catch (err) {
        console.warn("Identity check failed:", err);
      }

      // 2. Fetch Account stats (XP, Reputation, Level, actions)
      let xp = 0;
      let reputation = 0;
      let level = 1;
      let actionCount = 0;

      try {
        const stats = await reputationContract.accountStats(addressToQuery);
        xp = Number(stats.xp);
        reputation = Number(stats.reputation);
        level = Number(stats.level);
        actionCount = Number(stats.actionCount);
      } catch (err) {
        console.warn("Reputation stats query failed:", err);
      }

      // 3. Fetch user roles for administrative panel access
      let isGlobalModerator = false;
      let hasVerifierRole = false;
      let hasAdminRole = false;

      try {
        isGlobalModerator = await identityRegistry.isGlobalModerator(addressToQuery);
        
        const VERIFIER_ROLE = await identityRegistry.VERIFIER_ROLE();
        hasVerifierRole = await identityRegistry.hasRole(VERIFIER_ROLE, addressToQuery);

        const ADMIN_ROLE = await identityRegistry.DEFAULT_ADMIN_ROLE();
        hasAdminRole = await identityRegistry.hasRole(ADMIN_ROLE, addressToQuery);
      } catch (err) {
        console.warn("Roles query failed:", err);
      }

      setUserStats({
        xp,
        reputation,
        level,
        actionCount,
        isRegistered,
        isVerified,
        profileHash,
        registeredAt,
        updatedAt,
        isGlobalModerator,
        hasVerifierRole,
        hasAdminRole,
      });

      // 4. Fetch Badge & Achievement Balances
      const baseBadges: BadgeType[] = [
        {
          id: VERIFICATION_BADGE_ID,
          name: "Identity Verification",
          description: "Granted to on-chain verified forum citizens by a verifier.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=verified",
          uri: "",
          isOwned: false,
          kind: "Badge",
          active: true
        },
        {
          id: 2,
          name: "Elite Contributor",
          description: "Granted to high-reputation members (>500 Rep) for high-quality contributions.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=elite",
          uri: "",
          isOwned: false,
          kind: "Badge",
          active: true
        },
        {
          id: 3,
          name: "Senior Moderator",
          description: "Integrated on-chain moderator access to maintain social forum stability.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=mod",
          uri: "",
          isOwned: false,
          kind: "Badge",
          active: true
        },
        {
          id: 4,
          name: "First Post Milestone",
          description: "Achievement unlocked by publishing your very first discussion topic.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=first",
          uri: "",
          isOwned: false,
          kind: "Achievement",
          active: true
        },
        {
          id: 5,
          name: "Reputation Pioneer",
          description: "Reached Level 5+ on-chain through consistent quality contributions.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=pioneer",
          uri: "",
          isOwned: false,
          kind: "Achievement",
          active: true
        }
      ];

      const loadedBadges = await Promise.all(
        baseBadges.map(async (badge) => {
          try {
            const bal = await soulboundTokensContract.balanceOf(addressToQuery, badge.id);
            return {
              ...badge,
              isOwned: Number(bal) > 0,
            };
          } catch {
            return badge;
          }
        })
      );

      setBadges(loadedBadges);
    } catch (error) {
      console.error("Global Web3 refresh stats error:", error);
    }
  };

  // Transaction runner wrap
  const runTransaction = async (
    contractAddress: string,
    abi: any,
    methodName: string,
    args: any[],
    successMsg: string
  ): Promise<string | null> => {
    if (!signer) {
      setTxError("Connect your wallet first.");
      return null;
    }
    if (!isCorrectNetwork) {
      const switched = await switchNetwork();
      if (!switched) {
        setTxError("Please switch to the Base network.");
        return null;
      }
    }

    setIsTxPending(true);
    setTxError(null);
    setTxSuccessMessage(null);

    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract[methodName](...args);
      setCurrentTxHash(tx.hash);
      
      // Wait for 1 confirmation
      const receipt = await tx.wait(1);
      
      setTxSuccessMessage(`${successMsg} (Gas used: ${receipt.gasUsed.toString()})`);
      setCurrentTxHash(receipt.hash);
      
      // Refresh statistics
      await refreshStats();
      return receipt.hash;
    } catch (error: any) {
      console.error(`Transaction ${methodName} failed:`, error);
      setTxError(error.reason || error.message || "Transaction failed.");
      return null;
    } finally {
      setIsTxPending(false);
    }
  };

  // On-chain write methods
  const registerIdentityOnChain = async (username: string): Promise<string | null> => {
    const bytes32Name = stringToBytes32(username);
    return runTransaction(
      CONTRACT_ADDRESSES.ForumIdentityRegistry,
      FORUM_IDENTITY_REGISTRY_ABI,
      "register",
      [bytes32Name],
      `Successfully registered identity name "${username}"!`
    );
  };

  const updateProfileHashOnChain = async (newUsername: string): Promise<string | null> => {
    const bytes32Name = stringToBytes32(newUsername);
    return runTransaction(
      CONTRACT_ADDRESSES.ForumIdentityRegistry,
      FORUM_IDENTITY_REGISTRY_ABI,
      "updateProfileHash",
      [bytes32Name],
      `Successfully updated profile name to "${newUsername}"!`
    );
  };

  const setVerificationOnChain = async (accountAddress: string, verified: boolean): Promise<string | null> => {
    return runTransaction(
      CONTRACT_ADDRESSES.ForumIdentityRegistry,
      FORUM_IDENTITY_REGISTRY_ABI,
      "setVerification",
      [accountAddress, verified],
      `Successfully updated verification status for ${accountAddress.substring(0, 6)}...!`
    );
  };

  const grantBadgeOnChain = async (accountAddress: string, badgeId: number): Promise<string | null> => {
    return runTransaction(
      CONTRACT_ADDRESSES.SoulboundReputationTokens,
      SOULBOUND_REPUTATION_TOKENS_ABI,
      "grantBadge",
      [accountAddress, badgeId],
      `Successfully minted Soulbound Badge #${badgeId} for ${accountAddress.substring(0, 6)}...!`
    );
  };

  const unlockAchievementOnChain = async (accountAddress: string, achievementId: number): Promise<string | null> => {
    return runTransaction(
      CONTRACT_ADDRESSES.SoulboundReputationTokens,
      SOULBOUND_REPUTATION_TOKENS_ABI,
      "unlockAchievement",
      [accountAddress, achievementId],
      `Successfully unlocked Achievement #${achievementId} for ${accountAddress.substring(0, 6)}...!`
    );
  };

  const assignCommunityRoleOnChain = async (communityId: string, accountAddress: string, role: number): Promise<string | null> => {
    return runTransaction(
      CONTRACT_ADDRESSES.ForumIdentityRegistry,
      FORUM_IDENTITY_REGISTRY_ABI,
      "assignCommunityRole",
      [communityId, accountAddress, role],
      `Successfully assigned new community role!`
    );
  };

  const recordContributionOnChain = async (
    accountAddress: string,
    xp: number,
    reputationDelta: number,
    reason: string
  ): Promise<string | null> => {
    const bytes32Reason = stringToBytes32(reason.substring(0, 31));
    return runTransaction(
      CONTRACT_ADDRESSES.ForumIdentityRegistry,
      FORUM_IDENTITY_REGISTRY_ABI,
      "recordContribution",
      [accountAddress, xp, reputationDelta, bytes32Reason],
      `On-chain contribution successfully recorded! (+${xp} XP, ${reputationDelta > 0 ? "+" : ""}${reputationDelta} Rep)`
    );
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        readOnlyProvider,
        signer,
        account,
        chainId,
        isConnecting,
        isCorrectNetwork,
        userStats,
        badges,
        isTxPending,
        currentTxHash,
        txError,
        txSuccessMessage,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshStats,
        registerIdentityOnChain,
        updateProfileHashOnChain,
        setVerificationOnChain,
        grantBadgeOnChain,
        unlockAchievementOnChain,
        assignCommunityRoleOnChain,
        recordContributionOnChain,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
