import React, { useState, useEffect } from "react";
import { Post, Comment } from "../types/forum";
import { ForumBackendService } from "../services/supabase";
import { PostCard } from "../components/PostCard";
import { useWeb3 } from "../providers/Web3Provider";
import { ethers } from "ethers";
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Inbox,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2
} from "lucide-react";

interface FeedViewProps {
  selectedCategory: string | null;
  searchQuery: string;
}

export const FeedView: React.FC<FeedViewProps> = ({ selectedCategory, searchQuery }) => {
  const { account, userStats, recordContributionOnChain, addXPAndReputation } = useWeb3();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "top">("newest");

  // Selected post detail state
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>("");

  // Edit & Delete States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, searchQuery, sortBy]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedPosts = await ForumBackendService.getPosts(selectedCategory || undefined, searchQuery);
      
      // Sort logic
      if (sortBy === "newest") {
        fetchedPosts = [...fetchedPosts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        fetchedPosts = [...fetchedPosts].sort(
          (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );
      }
      setPosts(fetchedPosts);
    } catch (err: any) {
      setError("Failed to load posts from the database.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    try {
      const updatedPost = await ForumBackendService.votePost(postId, voteType, account || "");
      if (updatedPost) {
        // Optimistically update posts state
        setPosts(posts.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
        if (activePost && activePost.id === postId) {
          setActivePost({ ...activePost, ...updatedPost });
        }

        // On-chain integration: award 10 XP and 2 reputation points for active voting upvotes on Base!
        if (account && voteType === "up") {
          // Increment locally instantly
          addXPAndReputation(10, 2);
          try {
            await recordContributionOnChain(account, 10, 2, "Vote Upvote Action");
          } catch (onChainErr) {
            console.warn("On-chain action record failed, offline fallback applied.", onChainErr);
          }
        }
      }
    } catch (err) {
      console.error("Voting failed:", err);
    }
  };

  // Detailed view comment loading
  const handlePostClick = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setActivePost(post);
    setIsEditing(false);
    setCommentsLoading(true);
    try {
      const postComments = await ForumBackendService.getComments(postId);
      setComments(postComments);
    } catch (err) {
      console.error("Failed to load comments.", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !activePost || !newCommentText.trim()) return;

    try {
      const newComment = await ForumBackendService.addComment(
        activePost.id,
        newCommentText,
        account,
        userStats?.isRegistered ? decodeBytes32String(userStats.profileHash) : undefined
      );

      setComments([...comments, newComment]);
      setNewCommentText("");

      // Update local comment count on activePost
      const updatedPost = { ...activePost, commentsCount: activePost.commentsCount + 1 };
      setActivePost(updatedPost);
      setPosts(posts.map(p => p.id === activePost.id ? updatedPost : p));

      // Award XP and reputation locally instantly
      addXPAndReputation(15, 3);

      // Trigger standard on-chain XP reward: 15 XP, 3 Reputation points for participating in debate!
      try {
        await recordContributionOnChain(account, 15, 3, "New Comment");
      } catch (onChainErr) {
        console.warn("On-chain action record failed, offline fallback applied.", onChainErr);
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleStartEdit = (post: Post) => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !activePost) return;

    try {
      const updated = await ForumBackendService.updatePost(activePost.id, editTitle.trim(), editContent.trim(), account);
      if (updated) {
        setActivePost({ ...activePost, ...updated });
        setPosts(posts.map(p => p.id === activePost.id ? { ...p, ...updated } : p));
        setIsEditing(false);
        addXPAndReputation(10, 1);
        try {
          await recordContributionOnChain(account, 10, 1, "Edit Existing Post");
        } catch {}
      }
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!account) return;
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

    try {
      const success = await ForumBackendService.deletePost(postId, account);
      if (success) {
        setPosts(posts.filter(p => p.id !== postId));
        if (activePost && activePost.id === postId) {
          setActivePost(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const decodeBytes32String = (hex: string): string => {
    try {
      return ethers.decodeBytes32String(hex);
    } catch {
      return hex;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // --- Detail View Render ---
  if (activePost) {
    const catDetails = activePost.category === "cat_dev" 
      ? { name: "Developer", class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" }
      : activePost.category === "cat_gov"
        ? { name: "Governance", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" }
        : activePost.category === "cat_memes"
          ? { name: "Memes", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
          : { name: "General", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };

    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => {
            setActivePost(null);
            loadPosts();
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm transition-colors py-1"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Feed
        </button>

        {/* Detailed Post Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2.5 py-0.5 rounded-lg border font-semibold ${catDetails.class}`}>
                {catDetails.name}
              </span>
              <span className="text-slate-600">•</span>
              <img 
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${activePost.id}`} 
                alt="avatar" 
                className="w-5 h-5 rounded bg-slate-900"
              />
              <span className="font-bold text-slate-200">
                {activePost.authorUsername || formatAddress(activePost.authorAddress)}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500 font-medium">
                {new Date(activePost.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </span>
            </div>

            {account && account.toLowerCase() === activePost.authorAddress.toLowerCase() && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(activePost)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit Post"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePost(activePost.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Delete Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-display">Edit Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-display">Edit Content</label>
                <textarea
                  required
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white bg-[#0c0c0e] border border-slate-800 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug font-display">
                {activePost.title}
              </h2>

              <p className="text-slate-300 text-base leading-relaxed break-words whitespace-pre-wrap">
                {activePost.content}
              </p>

              {activePost.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[500px] flex items-center justify-center bg-[#09090b]/60">
                  <img 
                    src={activePost.imageUrl} 
                    alt={activePost.title} 
                    className="object-contain w-full h-full max-h-[500px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </>
          )}

          {/* Upvote & Social detail footer */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-800/60">
            <div className="flex items-center gap-2 bg-[#09090b]/60 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => handleVote(activePost.id, "up")}
                className={`p-1.5 rounded-lg transition-colors ${
                  activePost.voted === "up" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold font-mono text-slate-300 px-1">
                {activePost.upvotes - activePost.downvotes} Net Votes
              </span>
              <button
                onClick={() => handleVote(activePost.id, "down")}
                className={`p-1.5 rounded-lg transition-colors ${
                  activePost.voted === "down" ? "bg-rose-500/20 text-rose-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
            <span className="text-slate-550 text-xs font-mono">{activePost.authorAddress}</span>
          </div>
        </div>

        {/* Comment Section Header */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-display">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Community Discussion ({comments.length})
          </h3>

          {/* New Comment Form */}
          {account ? (
            <form onSubmit={handleAddComment} className="flex gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-3">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write your opinion, suggestion, or argument here..."
                rows={2}
                className="flex-1 bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-660 focus:outline-none focus:border-indigo-500/80 resize-none transition-colors"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="self-end bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white p-3 rounded-xl transition-all shadow-md"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center text-slate-500 text-sm font-medium">
              Connect your wallet to contribute to this discussion.
            </div>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(n => (
                <div key={n} className="bg-slate-900/40 h-24 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/40 rounded-2xl p-8 text-center text-slate-500 space-y-2">
              <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs text-slate-600">Be the first to start the discussion here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.id}`} 
                        alt="author" 
                        className="w-5 h-5 rounded bg-slate-900"
                      />
                      <span className="font-bold text-slate-300">
                        {comment.authorUsername || formatAddress(comment.authorAddress)}
                      </span>
                    </div>
                    <span className="text-slate-500 font-medium">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed leading-relaxed break-words whitespace-pre-wrap pl-7">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Normal Feed Render ---
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header Banner */}
      {searchQuery && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <p className="text-sm text-slate-300">
            Showing search results for &quot;<span className="font-bold text-white">{searchQuery}</span>&quot;
          </p>
        </div>
      )}

      {/* Filter and Sorting Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-display">
          {selectedCategory ? "Topics List" : "All Discussions"}
        </h2>

        <div className="flex items-center gap-2 bg-[#09090b]/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setSortBy("newest")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortBy === "newest" 
                ? "bg-slate-800 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Newest
          </button>
          <button
            onClick={() => setSortBy("top")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortBy === "top" 
                ? "bg-slate-800 text-white shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Top Voted
          </button>
        </div>
      </div>

      {/* Main Listing View */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900/40 h-44 rounded-2xl animate-pulse border border-slate-800/80"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <div>
            <h4 className="font-bold text-sm">An Error Occurred</h4>
            <p className="text-xs text-rose-400/80 mt-1">{error}</p>
          </div>
          <button onClick={loadPosts} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-4 py-2 rounded-xl text-xs font-semibold transition-colors mt-2">
            Reload
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-300">No discussions yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? "No posts were found matching your search keywords."
              : "This category is currently empty. Be the first to start an on-chain discussion today!"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostClick={handlePostClick}
              onVote={handleVote}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
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
