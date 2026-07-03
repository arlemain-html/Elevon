import React, { useState } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { 
  CheckCircle, 
  Award, 
  ShieldAlert, 
  UserCheck, 
  Send,
  ExternalLink,
  Flame,
  Check,
  AlertCircle,
  HelpCircle,
  Clock
} from "lucide-react";

export const BadgeView: React.FC = () => {
  const { 
    account, 
    badges, 
    userStats, 
    isTxPending, 
    currentTxHash, 
    txError, 
    txSuccessMessage,
    grantBadgeOnChain,
    setVerificationOnChain
  } = useWeb3();

  // Admin / operator fields
  const [recipient, setRecipient] = useState<string>("");
  const [selectedBadgeId, setSelectedBadgeId] = useState<number>(1);
  const [isVerifyingState, setIsVerifyingState] = useState<boolean>(true);

  const handleSubmitBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !ethersValidateAddress(recipient)) {
      return;
    }
    
    // Call on-chain grantBadge
    await grantBadgeOnChain(recipient, selectedBadgeId);
    setRecipient("");
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !ethersValidateAddress(recipient)) {
      return;
    }

    // Call on-chain setVerification
    await setVerificationOnChain(recipient, isVerifyingState);
    setRecipient("");
  };

  const ethersValidateAddress = (address: string) => {
    try {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
          <CheckCircle className="text-indigo-400 w-7 h-7" />
          Soulbound Reputation Badges (ERC1155)
        </h2>
        <p className="text-slate-400 text-sm">
          All badges in this forum are Soulbound Tokens (SBTs), meaning they cannot be transferred, traded, or moved once minted on-chain on the Base network.
        </p>
      </div>

      {/* Transaction Notifications Banner */}
      {isTxPending && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
          <div>
            <h4 className="font-bold text-sm">Transaction Processing</h4>
            <p className="text-xs text-indigo-400/80 mt-1">Sending smart contract write instructions to the Base network...</p>
            {currentTxHash && (
              <a 
                href={`https://basescan.org/tx/${currentTxHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline text-indigo-300 font-mono mt-2 block flex items-center gap-1"
              >
                Check status on Basescan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {txSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          <div>
            <h4 className="font-bold text-sm">Transaction Successful!</h4>
            <p className="text-xs text-emerald-400/80 mt-1">{txSuccessMessage}</p>
            {currentTxHash && (
              <a 
                href={`https://basescan.org/tx/${currentTxHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline text-emerald-300 font-mono mt-1.5 block flex items-center gap-1"
              >
                View details on Basescan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {txError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <div>
            <h4 className="font-bold text-sm">Transaction Failed</h4>
            <p className="text-xs text-rose-400/80 mt-1">{txError}</p>
          </div>
        </div>
      )}

      {/* Grid: Badges list & Admin panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Badge Catalog View */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            On-Chain Badge Catalog
          </h3>

          <div className="space-y-3">
            {badges.filter(b => b.kind === "Badge").map((badge) => (
              <div 
                key={badge.id} 
                className={`bg-slate-900/40 border rounded-2xl p-5 flex gap-4 items-center transition-all ${
                  badge.isOwned 
                    ? "border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 to-slate-900" 
                    : "border-slate-800/80"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  badge.isOwned 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                    : "bg-[#09090b] text-slate-600 border border-slate-850"
                }`}>
                  <Award className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm truncate font-display">{badge.name}</h4>
                    {badge.isOwned && (
                      <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Owned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 break-words leading-relaxed">{badge.description}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-1">Contract ID: #{badge.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verifier Admin Role Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            On-Chain Verifier Panel
          </h3>

          {/* Secure Permission Validation Check */}
          {account && (userStats?.hasVerifierRole || userStats?.hasAdminRole) ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 p-3.5 rounded-2xl flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Authorization confirmed. You have write access to the contract because you hold the <strong className="text-white">VERIFIER_ROLE</strong>.
                </p>
              </div>

              {/* Action 1: Set Verifikasi On-Chain */}
              <form onSubmit={handleSubmitVerification} className="space-y-3 pb-5 border-b border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">
                  Verify New Citizen
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Wallet Address (0x...)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVerifyingState(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        isVerifyingState 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                          : "bg-slate-950 text-slate-500 border-transparent hover:text-slate-300"
                      }`}
                    >
                      Verify (Set True)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVerifyingState(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                        !isVerifyingState 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30" 
                          : "bg-slate-950 text-slate-500 border-transparent hover:text-slate-300"
                      }`}
                    >
                      Revoke Verification (Set False)
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isTxPending || !recipient || !ethersValidateAddress(recipient)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Verification Transaction
                  </button>
                </div>
              </form>

              {/* Action 2: Grant Badge On-Chain */}
              <form onSubmit={handleSubmitBadge} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">
                  Mint & Grant SB Badge
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Recipient Wallet Address (0x...)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                  <select
                    value={selectedBadgeId}
                    onChange={(e) => setSelectedBadgeId(Number(e.target.value))}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/85"
                  >
                    <option value={1}>Badge #1 - Identity Verification</option>
                    <option value={2}>Badge #2 - Elite Contributor</option>
                    <option value={3}>Badge #3 - Senior Moderator</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isTxPending || !recipient || !ethersValidateAddress(recipient)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Mint On-Chain (Mint SBT)
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center text-slate-500 space-y-4">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm font-display">Restricted Access</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Only wallets holding the <code className="text-indigo-400 font-mono">VERIFIER_ROLE</code> or <code className="text-indigo-400 font-mono">BADGE_MANAGER_ROLE</code> are allowed to modify citizen verification status or mint badges on-chain on Base mainnet.
                </p>
              </div>
              <div className="text-[10px] text-slate-600 bg-[#09090b] p-3 rounded-xl border border-slate-800 text-left font-mono">
                <p className="font-bold text-slate-500">Contract Verifier Info:</p>
                <p className="truncate mt-1">Admin: 0x08a1D669F33c6591f0bf0CCA49D6d98eb9050b20</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
