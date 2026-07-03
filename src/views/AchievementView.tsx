import React, { useState } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { 
  Trophy, 
  Clock, 
  Check, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Send,
  HelpCircle,
  Zap
} from "lucide-react";

export const AchievementView: React.FC = () => {
  const { 
    account, 
    badges, 
    userStats, 
    isTxPending, 
    currentTxHash, 
    txError, 
    txSuccessMessage,
    grantBadgeOnChain 
  } = useWeb3();

  const [recipient, setRecipient] = useState<string>("");
  const [selectedAchievementId, setSelectedAchievementId] = useState<number>(4);

  const handleUnlockAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !ethersValidateAddress(recipient)) {
      return;
    }

    // Call on-chain grantBadge/unlockAchievement on SBT contract
    await grantBadgeOnChain(recipient, selectedAchievementId);
    setRecipient("");
  };

  const ethersValidateAddress = (address: string) => {
    try {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } catch {
      return false;
    }
  };

  const allAchievements = badges.filter(b => b.kind === "Achievement");

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Title Block */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
          <Trophy className="text-amber-500 w-7 h-7" />
          On-Chain Achievements (SBT)
        </h2>
        <p className="text-slate-400 text-sm">
          Complete forum contribution tasks, reach the highest reputation levels, and unlock permanent on-chain achievement badges recorded as proof of Soulbound Token ownership.
        </p>
      </div>

      {/* Transaction Notifications Banner */}
      {isTxPending && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
          <div>
            <h4 className="font-bold text-sm">Publishing Transaction</h4>
            <p className="text-xs text-indigo-400/80 mt-1">Submitting the achievement unlock transaction to the Base network...</p>
          </div>
        </div>
      )}

      {txSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          <div>
            <h4 className="font-bold text-sm">Achievement Unlocked Successfully!</h4>
            <p className="text-xs text-emerald-400/80 mt-1">{txSuccessMessage}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Achievements list */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Available Achievements List
          </h3>

          <div className="space-y-3">
            {allAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex gap-4 items-center transition-all ${
                  achievement.isOwned 
                    ? "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-[#09090b]/40" 
                    : "border-slate-800/80"
                }`}
              >
                <div className="relative">
                  <img 
                    src={achievement.image} 
                    alt="achievement icon" 
                    className="w-12 h-12 rounded-xl bg-[#09090b] p-1.5 border border-slate-800"
                  />
                  {achievement.isOwned && (
                    <span className="w-4 h-4 bg-amber-500 rounded-full absolute -top-1 -right-1 flex items-center justify-center border border-slate-900">
                      <Check className="w-2.5 h-2.5 text-slate-950" />
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm truncate font-display">{achievement.name}</h4>
                    {achievement.isOwned ? (
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <span className="bg-[#09090b] text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-800">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 break-words leading-relaxed">{achievement.description}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-1">Contract ID: #{achievement.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Unlock Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Operator Achievement Panel
          </h3>

          {account && (userStats?.hasVerifierRole || userStats?.hasAdminRole) ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="bg-amber-500/5 text-amber-400 border border-amber-500/10 p-3.5 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-550 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Verified Operator Authorization. You are authorized to trigger on-chain transactions to grant achievements to citizens.
                </p>
              </div>

              <form onSubmit={handleUnlockAchievement} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase font-display">
                    Select Achievement to Unlock
                  </label>
                  <select
                    value={selectedAchievementId}
                    onChange={(e) => setSelectedAchievementId(Number(e.target.value))}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/80"
                  >
                    <option value={4}>Achievement #4 - First Post Milestone</option>
                    <option value={5}>Achievement #5 - Reputation Pioneer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase font-display">
                    Citizen Wallet Address (0x...)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter recipient wallet address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isTxPending || !recipient || !ethersValidateAddress(recipient)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-700 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                >
                  <Zap className="w-4 h-4 text-slate-950" />
                  Send Achievement Unlock Transaction
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center text-slate-500 space-y-4">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm font-display">Operator Access Locked</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Only wallets holding the <code className="text-indigo-400 font-mono">ACHIEVEMENT_MANAGER_ROLE</code> or <code className="text-indigo-400 font-mono">DEFAULT_ADMIN_ROLE</code> are allowed to unlock citizen achievements on Base.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
