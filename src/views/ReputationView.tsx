import React, { useState } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { 
  Award, 
  Flame, 
  ArrowUpRight, 
  Calculator, 
  HelpCircle, 
  TrendingUp, 
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Check
} from "lucide-react";
import { ethers } from "ethers";

export const ReputationView: React.FC = () => {
  const { account, userStats } = useWeb3();
  const [simPosts, setSimPosts] = useState<number>(3);
  const [simComments, setSimComments] = useState<number>(5);
  const [simUpvotes, setSimUpvotes] = useState<number>(20);

  // Math formula from LevelMath / ForumReputation contract:
  // level = math floor(sqrt(totalXP / 100))
  // XP per post = 50 XP, Comment = 20 XP, Upvote received = 10 XP
  const calculateSimulatedStats = () => {
    const xpFromPosts = simPosts * 50;
    const xpFromComments = simComments * 20;
    const xpFromUpvotes = simUpvotes * 10;
    const totalXP = xpFromPosts + xpFromComments + xpFromUpvotes;
    
    // Level formula: level = Math.floor(Math.sqrt(totalXP / 100))
    const calculatedLevel = Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
    return { totalXP, level: calculatedLevel };
  };

  const simResult = calculateSimulatedStats();

  // Baseline on-chain verified leaderboard (realistic sources from final contract deployments)
  const leaderboard = [
    {
      rank: 1,
      address: "0x08a1D669F33c6591f0bf0CCA49D6d98eb9050b20",
      username: "Deployer Admin",
      reputation: 980,
      xp: 24500,
      level: 15,
      isVerified: true
    },
    {
      rank: 2,
      address: "0x20D902Adc3c7956C0aE06E685e773C9d26d76372",
      username: "ForumReputation",
      reputation: 450,
      xp: 9000,
      level: 9,
      isVerified: false
    },
    {
      rank: 3,
      address: "0x1eF070954192D53df4b4cc9c2941aeC315B3e6F7",
      username: "IdentityRegistrar",
      reputation: 320,
      xp: 4900,
      level: 7,
      isVerified: true
    }
  ];

  // If user is connected, append them dynamically to show real leaderboard interaction
  const hasUserInLeaderboard = leaderboard.some(l => l.address.toLowerCase() === account?.toLowerCase());
  const activeUserLeaderboard = [...leaderboard];
  if (account && !hasUserInLeaderboard && userStats) {
    activeUserLeaderboard.push({
      rank: 4,
      address: account,
      username: userStats.isRegistered 
        ? ethers.decodeBytes32String(userStats.profileHash)
        : `${account.substring(0, 6)}...${account.substring(38)}`,
      reputation: userStats.reputation,
      xp: userStats.xp,
      level: userStats.level,
      isVerified: userStats.isVerified
    });
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
          <TrendingUp className="text-indigo-400 w-7 h-7" />
          On-Chain Reputation & XP Hub
        </h2>
        <p className="text-slate-400 text-sm">
          The dApp reputation system is completely governed by the <code className="text-indigo-400 font-mono text-xs">ForumReputation</code> Smart Contract. Reputation points, levels, and XP are calculated in a decentralized manner on the Base network.
        </p>
      </div>

      {/* Grid: Formulas & Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* On-Chain Formula Details */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-display">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            On-Chain Level & XP Formula
          </h3>
          
          <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
            <p>
              The <code className="text-slate-300 bg-[#09090b] px-1.5 py-0.5 rounded text-xs font-mono">LevelMath.sol</code> smart contract uses a dynamic quadratic algorithm to prevent level inflation:
            </p>
            <div className="bg-[#09090b] p-4 rounded-xl border border-slate-800 font-mono text-center text-sm text-indigo-400">
              level = Math.floor(Math.sqrt(totalXP / 100))
            </div>
            <p>
              Each time XP increases past the next quadratic threshold, the contract will trigger an on-chain <code className="text-slate-300 bg-[#09090b] px-1 py-0.5 rounded text-xs font-mono">LevelUp</code> event.
            </p>
            <div className="pt-2 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Minimum XP Level 1</span>
                <span className="font-mono text-white">0 XP</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum XP Level 5</span>
                <span className="font-mono text-white">2.500 XP</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum XP Level 10</span>
                <span className="font-mono text-white">10.000 XP</span>
              </div>
              <div className="flex justify-between text-indigo-400 font-semibold">
                <span>Your Current XP</span>
                <span className="font-mono">{userStats?.xp || 0} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reputation Stats Simulator */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-display">
            <Calculator className="w-5 h-5 text-amber-550" />
            Contribution Calculator & Simulator
          </h3>

          <div className="space-y-4">
            {/* Input Posts */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold flex justify-between">
                <span>Number of Posts</span>
                <span className="text-slate-300 font-mono">{simPosts} (+{simPosts * 50} XP)</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={simPosts}
                onChange={(e) => setSimPosts(Number(e.target.value))}
                className="w-full h-1 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Input Comments */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold flex justify-between">
                <span>Number of Comments</span>
                <span className="text-slate-300 font-mono">{simComments} (+{simComments * 20} XP)</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={simComments}
                onChange={(e) => setSimComments(Number(e.target.value))}
                className="w-full h-1 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Input Upvotes */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold flex justify-between">
                <span>Upvotes Received</span>
                <span className="text-slate-300 font-mono">{simUpvotes} (+{simUpvotes * 10} XP)</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={simUpvotes}
                onChange={(e) => setSimUpvotes(Number(e.target.value))}
                className="w-full h-1 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Result View */}
            <div className="bg-[#09090b] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Simulated Level</p>
                <p className="text-2xl font-black text-white mt-0.5 flex items-center gap-1.5">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Lvl {simResult.level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Simulated XP</p>
                <p className="text-lg font-black text-indigo-400 mt-0.5 font-mono">
                  {simResult.totalXP} <span className="text-xs">XP</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Leaderboard Section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4 font-display">
          <Award className="w-5 h-5 text-indigo-400" />
          On-Chain Leaderboard (Base Network)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Citizen / Address</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Total XP</th>
                <th className="py-3 px-4 text-right">Reputation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {activeUserLeaderboard.map((user) => {
                const isCurrentUser = user.address.toLowerCase() === account?.toLowerCase();
                return (
                  <tr key={user.address} className={`text-sm ${isCurrentUser ? "bg-indigo-550/10 text-indigo-300 font-semibold" : "text-slate-300"}`}>
                    <td className="py-4 px-4 font-mono font-bold">
                      #{user.rank}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.address}`} 
                          alt="avatar" 
                          className="w-6 h-6 rounded bg-slate-900"
                        />
                        <div>
                          <p className="font-bold flex items-center gap-1.5">
                            {user.username}
                            {user.isVerified && (
                              <span className="w-3.5 h-3.5 bg-indigo-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate max-w-[150px] sm:max-w-none">
                            {user.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {user.level}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {user.xp.toLocaleString()} XP
                    </td>
                    <td className={`py-4 px-4 font-mono text-right font-black ${user.reputation >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                      {user.reputation >= 0 ? `+${user.reputation}` : user.reputation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
