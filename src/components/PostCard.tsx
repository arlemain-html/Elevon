import React, { useState, useEffect } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Bookmark, 
  Check, 
  Flame, 
  ShieldAlert, 
  Share2,
  Trash2,
  ExternalLink
} from "lucide-react";
import { Post } from "../types/forum";
import { useWeb3 } from "../providers/Web3Provider";
import { ForumBackendService } from "../services/supabase";

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
  onVote: (postId: string, voteType: "up" | "down") => void;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostClick, onVote, onDelete }) => {
  const { account } = useWeb3();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const isOwner = account && account.toLowerCase() === post.authorAddress.toLowerCase();

  useEffect(() => {
    if (account) {
      ForumBackendService.isBookmarked(post.id, account).then(setIsBookmarked);
    }
  }, [account, post.id]);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account) return;
    const isAdded = await ForumBackendService.toggleBookmark(post.id, account);
    setIsBookmarked(isAdded);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const getCategoryDetails = (catId: string) => {
    switch (catId) {
      case "cat_dev":
        return { name: "Developer", class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
      case "cat_gov":
        return { name: "Governance", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      case "cat_memes":
        return { name: "Memes", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      default:
        return { name: "General", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
  };

  const catDetails = getCategoryDetails(post.category);

  return (
    <article 
      onClick={() => onPostClick(post.id)}
      className="bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row group"
    >
      {/* Upvote Column */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-[#09090b]/40 p-3 md:p-4 flex md:flex-col items-center justify-between md:justify-start gap-2 border-b md:border-b-0 md:border-r border-slate-800/60 min-w-[3.5rem]"
      >
        <button
          onClick={() => onVote(post.id, "up")}
          className={`p-1.5 rounded-lg transition-colors ${
            post.voted === "up" 
              ? "bg-indigo-500/20 text-indigo-400" 
              : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          }`}
          title="Upvote (Increases on-chain reputation)"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <span className={`text-sm font-bold font-mono ${
          post.voted === "up" 
            ? "text-indigo-400" 
            : post.voted === "down" 
              ? "text-rose-500" 
              : "text-slate-400"
        }`}>
          {post.upvotes - post.downvotes}
        </span>
        <button
          onClick={() => onVote(post.id, "down")}
          className={`p-1.5 rounded-lg transition-colors ${
            post.voted === "down" 
              ? "bg-rose-500/20 text-rose-500" 
              : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          }`}
          title="Downvote (Decreases on-chain reputation)"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 space-y-3">
        {/* Post Metadata Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Badge */}
          <span className={`px-2 py-0.5 rounded-md border font-medium ${catDetails.class}`}>
            {catDetails.name}
          </span>
          <span className="text-slate-600">•</span>
          
          {/* Author avatar & on-chain badge preview */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <img 
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.signer || post.id}`} 
                alt="author avatar" 
                className="w-5 h-5 rounded bg-slate-900"
              />
              {post.verified && (
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full border border-slate-950 absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
                  <Check className="w-1.5 h-1.5 text-white" />
                </span>
              )}
            </div>

            <span className="font-bold text-slate-300 hover:text-white transition-colors">
              {post.authorUsername || formatAddress(post.authorAddress)}
            </span>
          </div>

          <span className="text-slate-600">•</span>
          <span className="text-slate-500 font-medium">{formatTime(post.createdAt)}</span>

          {/* On-chain Level Indicator */}
          {post.onChainLevel && (
            <>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-0.5 text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 font-medium">
                <Flame className="w-3.5 h-3.5" />
                Lvl {post.onChainLevel}
              </span>
            </>
          )}

          {/* On-Chain Rep Delta preview */}
          {post.onChainReputation !== undefined && (
            <span className="text-slate-500 font-mono">
              ({post.onChainReputation} Rep)
            </span>
          )}
        </div>

        {/* Post Title */}
        <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors leading-snug font-display">
          {post.title}
        </h3>

        {/* Post Snippet */}
        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed break-words">
          {post.content}
        </p>

        {/* Optional Thumbnail Image */}
        {post.imageUrl && (
          <div className="w-full max-h-80 rounded-xl overflow-hidden mt-3 border border-slate-800/60 bg-[#09090b]/60 flex items-center justify-center">
            <img 
              src={post.imageUrl} 
              alt="post media attachment" 
              className="object-cover w-full h-full max-h-80 group-hover:scale-[1.01] transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Post Bottom Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-slate-500 text-xs font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
              <MessageSquare className="w-4.5 h-4.5 text-slate-500" />
              <span>{post.commentsCount} Comments</span>
            </span>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <Share2 className="w-4.5 h-4.5 text-slate-500" />
              <span>{copiedShare ? "Link Copied!" : "Share"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(post.id);
                }}
                className="p-1 rounded text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {account && (
              <button 
                onClick={handleBookmarkToggle}
                className={`p-1 rounded transition-colors ${
                  isBookmarked ? "text-indigo-400 hover:text-indigo-300" : "text-slate-500 hover:text-slate-300"
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Save Post"}
              >
                <Bookmark className="w-4.5 h-4.5 fill-current" />
              </button>
            )}
            
            {/* Direct Basescan link */}
            <a 
              href={`https://basescan.org/address/${post.authorAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
              title="Open Profile on Basescan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
