import React, { useState } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { 
  Settings, 
  UserCheck, 
  Send, 
  Clock, 
  Check, 
  AlertCircle,
  HelpCircle,
  Hash,
  Activity,
  Globe
} from "lucide-react";
import { ethers } from "ethers";

export const SettingsView: React.FC = () => {
  const { 
    account, 
    userStats, 
    isTxPending, 
    currentTxHash, 
    txError, 
    txSuccessMessage,
    registerIdentityOnChain,
    updateProfileHashOnChain
  } = useWeb3();

  const [usernameInput, setUsernameInput] = useState<string>("");

  const decodeBytes32String = (hex: string): string => {
    try {
      return ethers.decodeBytes32String(hex);
    } catch {
      return hex;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    await registerIdentityOnChain(usernameInput.trim());
    setUsernameInput("");
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    await updateProfileHashOnChain(usernameInput.trim());
    setUsernameInput("");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Introduction */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
          <Settings className="text-indigo-400 w-7 h-7" />
          On-Chain Identity Registry
        </h2>
        <p className="text-slate-400 text-sm">
          Manage your on-chain profile through permanent bytes32-based identity registration in the <code className="text-indigo-400 font-mono text-xs">ForumIdentityRegistry</code> smart contract on the Base network.
        </p>
      </div>

      {/* Transaction Notifications Banner */}
      {isTxPending && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
          <div>
            <h4 className="font-bold text-sm">Transaction in Progress</h4>
            <p className="text-xs text-indigo-400/80 mt-1">Submitting your on-chain identity change to Base...</p>
          </div>
        </div>
      )}

      {txSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          <div>
            <h4 className="font-bold text-sm">On-Chain Identity Updated Successfully!</h4>
            <p className="text-xs text-emerald-400/80 mt-1">{txSuccessMessage}</p>
          </div>
        </div>
      )}

      {txError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <div>
            <h4 className="font-bold text-sm">Transaction Error</h4>
            <p className="text-xs text-rose-400/80 mt-1">{txError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Form Registration / Editing */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Profile Settings
          </h3>

          {!account ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center text-slate-500 text-xs font-medium">
              Connect your wallet first to update your on-chain identity.
            </div>
          ) : userStats?.isRegistered ? (
            /* Rename / Update Form */
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase">Registered On-Chain Identity</p>
                <p className="text-lg font-black text-white font-display">
                  &quot;{decodeBytes32String(userStats.profileHash)}&quot;
                </p>
              </div>

              <form onSubmit={handleRename} className="space-y-3">
                <label className="text-xs text-slate-400 font-medium">Change On-Chain Profile Name</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    maxLength={31}
                    placeholder="Enter new profile name..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 font-display"
                  />
                  <button
                    type="submit"
                    disabled={isTxPending || !usernameInput.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Name Change Transaction
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* First-time Register Form */
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 p-4 rounded-2xl flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  You have not registered your identity with our smart contract registry yet. Initial registration is required before contributing on-chain.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <label className="text-xs text-slate-400 font-semibold uppercase font-display">Register New On-Chain Profile Name</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    maxLength={31}
                    placeholder="Example: CaissaTen"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 font-display"
                  />
                  <button
                    type="submit"
                    disabled={isTxPending || !usernameInput.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Registration Transaction
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Network and Node Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Network Connection Status
          </h3>
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs text-slate-400">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="flex items-center gap-1.5 font-bold">
                <Globe className="w-4 h-4 text-indigo-400" />
                Blockchain Network
              </span>
              <span className="font-mono text-white">Base Mainnet</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="flex items-center gap-1.5 font-bold">
                <Hash className="w-4 h-4 text-indigo-400" />
                Chain ID
              </span>
              <span className="font-mono text-white">8453</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="flex items-center gap-1.5 font-bold">
                <Activity className="w-4 h-4 text-indigo-400" />
                RPC Endpoint
              </span>
              <span className="font-mono text-indigo-400 truncate max-w-[150px] sm:max-w-none">https://mainnet.base.org</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="flex items-center gap-1.5 font-bold">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Identity Contract
              </span>
              <span className="font-mono text-slate-500 truncate max-w-[120px] sm:max-w-none" title="0x1eF070954192D53df4b4cc9c2941aeC315B3e6F7">
                0x1eF0...e6F7
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
