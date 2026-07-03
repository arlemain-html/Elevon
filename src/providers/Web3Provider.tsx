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
import { Check, AlertCircle, Sparkles } from "lucide-react";
import { createWeb3Modal, useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect, useWalletClient, useSwitchChain } from "wagmi";
import { wagmiConfig, projectId } from "../blockchain/wagmiConfig";
import { type WalletClient } from "viem";

// Initialize Web3Modal once
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
});

function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(transport as any, network);
  const signer = new ethers.JsonRpcSigner(provider, account.address);
  return signer;
}

// Local storage helpers
const getStorageItem = <T,>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStorageItem = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export type TxState = "idle" | "waiting_confirmation" | "pending" | "confirmed" | "failed";

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
  isSandboxMode: boolean;
  txState: TxState;
  
  // Actions
  connectWallet: () => Promise<void>;
  connectSandboxWallet: () => void;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<boolean>;
  refreshStats: (targetAddress?: string) => Promise<void>;
  addXPAndReputation: (xpDelta: number, repDelta: number) => void;
  clearTxState: () => void;
  
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
  const { address: wagmiAddress, chainId: wagmiChainId, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const { open: openModal } = useWeb3Modal();

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
  const isSandboxMode = false;
  const [txState, setTxState] = useState<TxState>("idle");
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);

  // 1. Read-only provider connected to Base RPC directly
  const readOnlyProvider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);

  // Sync the wagmi account state to our local state
  useEffect(() => {
    if (isConnected && wagmiAddress) {
      setAccount(wagmiAddress);
      setChainId(wagmiChainId || null);
      setIsCorrectNetwork(wagmiChainId === CHAIN_CONFIG.chainId);
    } else {
      setAccount(null);
      setChainId(null);
      setIsCorrectNetwork(false);
      setSigner(null);
      setProvider(null);
    }
  }, [isConnected, wagmiAddress, wagmiChainId]);

  // Sync the walletClient to the Ethers signer and provider
  useEffect(() => {
    if (walletClient) {
      try {
        const ethersSigner = walletClientToSigner(walletClient);
        setSigner(ethersSigner);
        if (ethersSigner.provider) {
          setProvider(ethersSigner.provider as ethers.BrowserProvider);
        }
      } catch (err) {
        console.error("Error mapping walletClient to Ethers Signer:", err);
      }
    } else {
      setSigner(null);
      setProvider(null);
    }
  }, [walletClient]);

  // Sync / refresh user stats and badges
  useEffect(() => {
    if (account) {
      refreshStats(account);
    } else {
      // Load default global demo stats in read-only mode for deployer if wallet disconnected
      refreshStats(CONTRACT_ADDRESSES.ForumIdentityRegistry);
    }
  }, [account, isCorrectNetwork]);

  const connectWallet = async () => {
    setTxError(null);
    setTxSuccessMessage(null);
    setIsConnecting(true);
    try {
      await openModal();
    } catch (err: any) {
      console.error("Error opening Web3Modal:", err);
      setTxError("Failed to open connection modal.");
    } finally {
      setIsConnecting(false);
    }
  };

  const connectSandboxWallet = () => {
    console.warn("Sandbox Mode is disabled in production.");
  };

  const disconnectWallet = () => {
    wagmiDisconnect();
    setSigner(null);
    setAccount(null);
    setUserStats(null);
    setBadges([]);
    setTxError(null);
    setTxSuccessMessage(null);
    setTxState("idle");
  };

  const switchNetwork = async (): Promise<boolean> => {
    try {
      await switchChainAsync({ chainId: CHAIN_CONFIG.chainId });
      setIsCorrectNetwork(true);
      return true;
    } catch (err: any) {
      console.error("Failed to switch network via Wagmi:", err);
      setTxError("Failed to switch network. Please switch to Base manually.");
      return false;
    }
  };

  const stringToBytes32 = (str: string): string => {
    const utf8Bytes = ethers.toUtf8Bytes(str);
    if (utf8Bytes.length > 32) {
      throw new Error("String exceeds 32 bytes limit");
    }
    const bytes32 = new Uint8Array(32);
    bytes32.set(utf8Bytes);
    return ethers.hexlify(bytes32);
  };

  const bytes32ToString = (hex: string): string => {
    try {
      const cleanHex = hex.replace(/^0x/, "").replace(/(00)*$/, "");
      const bytes = ethers.getBytes("0x" + cleanHex);
      return ethers.toUtf8String(bytes);
    } catch {
      return hex;
    }
  };

  const addXPAndReputation = (xpDelta: number, repDelta: number) => {
    if (!account) return;
    const currentLocal = getStorageItem<UserStats>(`user_stats_${account.toLowerCase()}`, {
      xp: 0,
      reputation: 0,
      level: 1,
      actionCount: 0,
      isRegistered: false,
      isVerified: false,
      profileHash: "0x" + "0".repeat(64),
      registeredAt: 0,
      updatedAt: 0,
      isGlobalModerator: false,
      hasVerifierRole: false,
      hasAdminRole: false,
    });

    const newXp = (userStats?.xp || currentLocal.xp || 0) + xpDelta;
    const newRep = (userStats?.reputation || currentLocal.reputation || 0) + repDelta;
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)));
    const newActionCount = (userStats?.actionCount || currentLocal.actionCount || 0) + 1;

    const updated = {
      ...(userStats || currentLocal),
      xp: newXp,
      reputation: newRep,
      level: newLevel,
      actionCount: newActionCount
    };

    setStorageItem(`user_stats_${account.toLowerCase()}`, updated);
    setUserStats(updated);
  };

  const clearTxState = () => {
    setTxState("idle");
    setIsTxPending(false);
    setTxError(null);
    setTxSuccessMessage(null);
    setCurrentTxHash(null);
  };

  const refreshStats = async (targetAddress?: string) => {
    const addressToQuery = targetAddress || account;
    if (!addressToQuery) return;

    if (isSandboxMode) {
      const local = getStorageItem<UserStats>(`user_stats_${addressToQuery.toLowerCase()}`, {
        xp: 150,
        reputation: 15,
        level: 1,
        actionCount: 3,
        isRegistered: true,
        isVerified: true,
        profileHash: stringToBytes32("SandboxCitizen"),
        registeredAt: Math.floor(Date.now() / 1000) - 86400,
        updatedAt: Math.floor(Date.now() / 1000),
        isGlobalModerator: false,
        hasVerifierRole: true,
        hasAdminRole: false,
      });
      setUserStats(local);

      // Set sandbox badges
      const baseBadges: BadgeType[] = [
        {
          id: VERIFICATION_BADGE_ID,
          name: "Identity Verification",
          description: "Granted to on-chain verified forum citizens by a verifier.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=verified",
          uri: "",
          isOwned: local.isVerified,
          kind: "Badge",
          active: true
        },
        {
          id: 2,
          name: "Elite Contributor",
          description: "Granted to high-reputation members (>500 Rep) for high-quality contributions.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=elite",
          uri: "",
          isOwned: local.reputation > 500,
          kind: "Badge",
          active: true
        },
        {
          id: 3,
          name: "Senior Moderator",
          description: "Integrated on-chain moderator access to maintain social forum stability.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=mod",
          uri: "",
          isOwned: local.isGlobalModerator,
          kind: "Badge",
          active: true
        },
        {
          id: 4,
          name: "First Post Milestone",
          description: "Achievement unlocked by publishing your very first discussion topic.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=first",
          uri: "",
          isOwned: local.actionCount >= 1,
          kind: "Achievement",
          active: true
        },
        {
          id: 5,
          name: "Reputation Pioneer",
          description: "Reached Level 5+ on-chain through consistent quality contributions.",
          image: "https://api.dicebear.com/7.x/identicon/svg?seed=pioneer",
          uri: "",
          isOwned: local.level >= 5,
          kind: "Achievement",
          active: true
        }
      ];
      setBadges(baseBadges);
      return;
    }

    try {
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

      // 2. Fetch Account stats
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

      // Sync and load local backup if contract returns empty or fails
      const localBackup = getStorageItem<any>(`user_stats_${addressToQuery.toLowerCase()}`, null);
      if (localBackup) {
        xp = Math.max(xp, localBackup.xp || 0);
        reputation = Math.max(reputation, localBackup.reputation || 0);
        level = Math.max(level, localBackup.level || 1);
        actionCount = Math.max(actionCount, localBackup.actionCount || 0);
        if (localBackup.isRegistered) isRegistered = true;
        if (localBackup.isVerified) isVerified = true;
      }

      // 3. Fetch user roles
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
              isOwned: Number(bal) > 0 || (badge.id === 1 && isVerified),
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
    setIsTxPending(true);
    setTxError(null);
    setTxSuccessMessage(null);

    if (isSandboxMode) {
      setTxState("waiting_confirmation");
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setTxState("pending");
      const fakeHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setCurrentTxHash(fakeHash);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setTxState("confirmed");
      setTxSuccessMessage(`${successMsg} (Simulated Gas used: 64120)`);
      
      // Update local stats based on simulated transaction methods
      if (account) {
        const local = getStorageItem<UserStats>(`user_stats_${account.toLowerCase()}`, {
          xp: 150,
          reputation: 15,
          level: 1,
          actionCount: 3,
          isRegistered: true,
          isVerified: true,
          profileHash: stringToBytes32("SandboxCitizen"),
          registeredAt: Math.floor(Date.now() / 1000) - 86400,
          updatedAt: Math.floor(Date.now() / 1000),
          isGlobalModerator: false,
          hasVerifierRole: true,
          hasAdminRole: false,
        });

        if (methodName === "register") {
          local.isRegistered = true;
          local.profileHash = args[0];
          local.registeredAt = Math.floor(Date.now() / 1000);
          local.updatedAt = Math.floor(Date.now() / 1000);
        } else if (methodName === "updateProfileHash") {
          local.profileHash = args[0];
          local.updatedAt = Math.floor(Date.now() / 1000);
        } else if (methodName === "setVerification") {
          local.isVerified = args[1];
        } else if (methodName === "recordContribution") {
          local.xp += Number(args[1]);
          local.reputation += Number(args[2]);
          local.level = Math.max(1, Math.floor(Math.sqrt(local.xp / 100)));
          local.actionCount += 1;
        }

        setStorageItem(`user_stats_${account.toLowerCase()}`, local);
        setUserStats(local);
      }

      await refreshStats();
      setIsTxPending(false);
      return fakeHash;
    }

    if (!signer) {
      setTxError("Connect your wallet first.");
      setTxState("failed");
      setIsTxPending(false);
      return null;
    }
    if (!isCorrectNetwork) {
      const switched = await switchNetwork();
      if (!switched) {
        setTxError("Please switch to the Base network.");
        setTxState("failed");
        setIsTxPending(false);
        return null;
      }
    }

    setTxState("waiting_confirmation");
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract[methodName](...args);
      
      setTxState("pending");
      setCurrentTxHash(tx.hash);
      
      // Wait for 1 confirmation
      const receipt = await tx.wait(1);
      
      setTxState("confirmed");
      setTxSuccessMessage(`${successMsg} (Gas used: ${receipt.gasUsed.toString()})`);
      setCurrentTxHash(receipt.hash);
      
      // Sync local stats to avoid gaps
      if (account) {
        const local = getStorageItem<any>(`user_stats_${account.toLowerCase()}`, {});
        if (methodName === "register") {
          local.isRegistered = true;
          local.profileHash = args[0];
        } else if (methodName === "updateProfileHash") {
          local.profileHash = args[0];
        } else if (methodName === "recordContribution") {
          local.xp = (local.xp || 0) + Number(args[1]);
          local.reputation = (local.reputation || 0) + Number(args[2]);
          local.level = Math.max(1, Math.floor(Math.sqrt(local.xp / 100)));
          local.actionCount = (local.actionCount || 0) + 1;
        }
        setStorageItem(`user_stats_${account.toLowerCase()}`, local);
      }

      await refreshStats();
      return receipt.hash;
    } catch (error: any) {
      console.error(`Transaction ${methodName} failed:`, error);
      setTxState("failed");
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
        isSandboxMode,
        txState,
        connectWallet,
        connectSandboxWallet,
        disconnectWallet,
        switchNetwork,
        refreshStats,
        addXPAndReputation,
        clearTxState,
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
      
      {/* Floating Transaction Status Toast */}
      {txState !== "idle" && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-4 md:p-5 animate-slide-up backdrop-blur-md">
          <div className="flex items-start gap-3">
            {txState === "waiting_confirmation" && (
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                <div className="w-4.5 h-4.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {txState === "pending" && (
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <div className="w-4.5 h-4.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {txState === "confirmed" && (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-5 h-5" />
              </div>
            )}
            {txState === "failed" && (
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                {txState === "waiting_confirmation" && "Confirm Transaction"}
                {txState === "pending" && "Transaction Pending"}
                {txState === "confirmed" && "Transaction Confirmed!"}
                {txState === "failed" && "Transaction Failed"}
                {isSandboxMode && (
                  <span className="flex items-center gap-0.5 text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-mono uppercase">
                    <Sparkles className="w-2.5 h-2.5" /> Sandbox
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {txState === "waiting_confirmation" && "Please open your wallet and approve the transaction signature request."}
                {txState === "pending" && "Transaction has been broadcast to the Base network. Waiting for confirmation on-chain..."}
                {txState === "confirmed" && (txSuccessMessage || "Successfully submitted to Base.")}
                {txState === "failed" && (txError || "An error occurred while executing the contract transaction.")}
              </p>

              {currentTxHash && (
                <div className="mt-3 flex items-center justify-between bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-[10px] font-mono">
                  <span className="text-slate-500 truncate mr-2">Tx: {currentTxHash}</span>
                  {!isSandboxMode ? (
                    <a
                      href={`${CHAIN_CONFIG.blockExplorer}/tx/${currentTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold shrink-0"
                    >
                      Basescan ↗
                    </a>
                  ) : (
                    <span className="text-slate-500 font-semibold italic shrink-0">Simulated</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearTxState}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-[#0c0c0e] border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
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
