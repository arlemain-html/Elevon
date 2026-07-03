import React from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { ethers } from "ethers";
import { 
  Wallet, 
  Search, 
  PlusCircle, 
  ChevronDown, 
  LogOut, 
  Check, 
  AlertTriangle,
  Flame,
  Award,
  ShieldCheck
} from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreatePostClick: () => void;
  setCurrentView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onCreatePostClick,
  setCurrentView
}) => {
  const {
    account,
    chainId,
    isConnecting,
    isCorrectNetwork,
    userStats,
    connectWallet,
    disconnectWallet,
    switchNetwork
  } = useWeb3();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header id="top_header" className="h-16 bg-[#09090b]/85 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* App Branding */}
      <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentView("feed")}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <span className="text-white font-black text-lg tracking-wider font-display">Φ</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
            ELEVON
            <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">L2 SOCIAL</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono">On-Chain Identity & Reputation Hub</p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search posts, topics, code, or reputation threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0c0c0e]/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 transition-colors"
        />
      </div>

      {/* Action Buttons & Wallet Connection */}
      <div className="flex items-center gap-4">
        {/* Create Post Action */}
        {account && (
          <button
            onClick={onCreatePostClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-900/30 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4 text-indigo-200" />
            <span>New Post</span>
          </button>
        )}

        {/* Wallet Controller */}
        {!account ? (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-800 transition-all"
          >
            <Wallet className="w-4 h-4 text-indigo-400" />
            <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        ) : !isCorrectNetwork ? (
          <button
            onClick={switchNetwork}
            className="flex items-center gap-2 bg-amber-600/10 text-amber-400 hover:bg-amber-600/20 px-4 py-2.5 rounded-xl border border-amber-500/20 text-xs font-bold transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Wrong Network (Switch to Base)</span>
          </button>
        ) : (
          <div className="relative">
            {/* Connected User Summary */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-1.5 pl-3 pr-2.5 cursor-pointer hover:border-slate-700 transition-all select-none"
            >
              {/* User Avatar + Small Badge indicators */}
              <div className="relative">
                <img 
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${account}`} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-lg bg-slate-900"
                />
                {userStats?.isVerified && (
                  <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full border border-slate-950 absolute -bottom-1 -right-1 flex items-center justify-center shadow-lg">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>

              {/* Username + Status indicators */}
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">
                    {userStats?.isRegistered 
                      ? ethers.decodeBytes32String(userStats.profileHash)
                      : formatAddress(account)
                    }
                  </span>
                  {userStats?.isGlobalModerator && (
                    <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-emerald-500/20">MOD</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {/* On-chain Level/Reputation summary */}
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-orange-500" />
                    Lvl {userStats?.level || 1}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({userStats?.reputation || 0} Rep)
                  </span>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-550" />
            </div>

            {/* Account Quick Actions Dropdown */}
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-64 bg-[#09090b] border border-slate-800 rounded-2xl shadow-2xl p-5 z-40 space-y-4">
                  <div className="pb-3 border-b border-slate-800">
                    <p className="text-xs text-slate-550 font-semibold mb-1 uppercase tracking-wider">Connected Address</p>
                    <p className="text-[11px] font-mono text-slate-300 break-all bg-[#0c0c0e] p-2.5 rounded-xl border border-slate-800/80">
                      {account}
                    </p>
                  </div>

                  {/* Level & XP progression bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>XP {userStats?.xp || 0}</span>
                      <span>Level {userStats?.level || 1}</span>
                    </div>
                    <div className="w-full bg-[#0c0c0e] h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-350"
                        style={{ width: `${Math.min(100, ((userStats?.xp || 0) % 1000) / 10)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <button
                      onClick={() => {
                        setCurrentView("settings");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all font-medium"
                    >
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span>Modify On-Chain Identity</span>
                    </button>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-medium text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
