import React, { useState, useEffect } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { ethers } from "ethers";
import { 
  Award, 
  CheckCircle, 
  Flame, 
  Calendar, 
  Inbox, 
  Bookmark, 
  ShieldCheck, 
  Zap, 
  Trophy,
  Copy,
  Check,
  ChevronRight
} from "lucide-react";
import { Post } from "../types/forum";
import { ForumBackendService } from "../services/supabase";

interface ProfileViewProps {
  onPostClick: (postId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onPostClick }) => {
  const { account, userStats, badges } = useWeb3();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"badges" | "bookmarks">("badges");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (account) {
      ForumBackendService.getBookmarks(account).then(setBookmarkedPosts);
    }
  }, [account]);

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const decodeBytes32String = (hex: string): string => {
    try {
      return ethers.decodeBytes32String(hex);
    } catch {
      return hex;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`;
  };

  if (!account) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900/40 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white font-display">Wallet Not Connected</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Please connect MetaMask, Coinbase Wallet, or your Web3 wallet to view your on-chain profile stats.
        </p>
      </div>
    );
  }

  const ownedBadges = badges.filter(b => b.isOwned && b.kind === "Badge");
  const unlockedAchievements = badges.filter(b => b.isOwned && b.kind === "Achievement");

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Cover & Header Banner */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-indigo-600/30 via-indigo-900/20 to-slate-950"></div>
        
        {/* Profile Info Overlay */}
        <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 relative z-10">
          <div className="relative">
            <img 
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${account}`} 
              alt="Profile Avatar" 
              className="w-24 h-24 rounded-2xl border-4 border-slate-900 bg-[#09090b]"
            />
            {userStats?.isVerified && (
              <span className="w-6 h-6 bg-indigo-500 rounded-full border-2 border-slate-900 absolute -bottom-1 -right-1 flex items-center justify-center shadow-lg" title="Verifikasi On-chain">
                <Check className="w-4 h-4 text-white" />
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight font-display">
                {userStats?.isRegistered 
                  ? decodeBytes32String(userStats.profileHash)
                  : `${account.substring(0, 6)}...${account.substring(38)}`
                }
              </h2>
              {userStats?.isRegistered ? (
                <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded-md border border-indigo-500/20">
                  Registered Identity
                </span>
              ) : (
                <span className="bg-rose-500/10 text-rose-400 text-xs font-semibold px-2 py-0.5 rounded-md border border-rose-500/20">
                  Unregistered
                </span>
              )}
              {userStats?.isGlobalModerator && (
                <span className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  Global Moderator
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <button 
                onClick={copyAddress}
                className="flex items-center gap-1.5 hover:text-white font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800/80 transition-colors"
              >
                <span>{formatAddress(account)}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-500" />}
              </button>
              {userStats?.registeredAt ? (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Citizen since {new Date(userStats.registeredAt * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Stats Bento Grid Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-800/80 bg-slate-950/40 text-center">
          <div className="p-5 border-r border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">On-Chain Reputation</span>
            <p className="text-xl font-black text-white mt-1 font-mono">
              {userStats?.reputation !== undefined ? (userStats.reputation > 0 ? `+${userStats.reputation}` : userStats.reputation) : "0"}
            </p>
          </div>
          <div className="p-5 border-r border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">XP & Progress</span>
            <p className="text-xl font-black text-white mt-1 font-mono">
              {userStats?.xp || 0} <span className="text-xs text-slate-500">XP</span>
            </p>
          </div>
          <div className="p-5 border-r border-slate-800/60">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">User Level</span>
            <p className="text-xl font-black text-white mt-1 flex items-center justify-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-500" />
              {userStats?.level || 1}
            </p>
          </div>
          <div className="p-5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Action Count</span>
            <p className="text-xl font-black text-white mt-1 font-mono">
              {userStats?.actionCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "badges" 
                ? "border-indigo-500 text-white" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            My Badges & Achievements ({ownedBadges.length + unlockedAchievements.length})
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "bookmarks" 
                ? "border-indigo-500 text-white" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Saved Bookmarks ({bookmarkedPosts.length})
          </button>
        </div>

        {/* Tab Badges Rendering */}
        {activeTab === "badges" && (
          <div className="space-y-6">
            {/* Badges Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Soulbound Badges</h3>
              {ownedBadges.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center text-slate-500 text-xs">
                  No on-chain Soulbound Badges owned yet. Contact a verifier or accumulate upvotes to receive elite citizen certification!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ownedBadges.map((badge) => (
                    <div key={badge.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm font-display">{badge.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                        <p className="text-[10px] text-indigo-400 font-mono mt-1">ID: #{badge.id} (Soulbound)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">On-Chain Achievements</h3>
              {unlockedAchievements.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 text-center text-slate-500 text-xs">
                  No achievements unlocked yet. Keep growing your reputation in the forum to trigger automatic achievement unlocks!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {unlockedAchievements.map((badge) => (
                    <div key={badge.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm font-display">{badge.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                        <p className="text-[10px] text-amber-400 font-mono mt-1">ID: #{badge.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Bookmarks Rendering */}
        {activeTab === "bookmarks" && (
          <div className="space-y-4">
            {bookmarkedPosts.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-400 font-display">No bookmarks saved yet</h4>
                <p className="text-xs text-slate-500">Important discussion posts you save will appear neatly here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => onPostClick(post.id)}
                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm hover:text-indigo-400 transition-colors font-display">
                        {post.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Diposting oleh {post.authorUsername || formatAddress(post.authorAddress)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
