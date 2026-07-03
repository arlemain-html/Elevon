import React, { useState } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { ForumBackendService } from "../services/supabase";
import { X, Send, ImageIcon, Info, Sparkles } from "lucide-react";
import { Post } from "../types/forum";
import { ethers } from "ethers";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { account, userStats, recordContributionOnChain } = useWeb3();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("cat_general");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      // Call off-chain backend service
      const post = await ForumBackendService.createPost(
        title.trim(),
        content.trim(),
        category,
        account,
        userStats?.isRegistered ? decodeBytes32String(userStats.profileHash) : undefined,
        imageUrl.trim() || undefined
      );

      // On-chain integration: reward 50 XP, 5 Reputation on Base for publishing a smart topic!
      try {
        await recordContributionOnChain(account, 50, 5, "Publish New Post");
      } catch (onChainErr) {
        console.warn("On-chain points logging failed, offline fallback applied.", onChainErr);
      }

      onPostCreated(post);
      onClose();
    } catch (err) {
      console.error("Gagal memposting:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const decodeBytes32String = (hex: string): string => {
    try {
      return ethers.decodeBytes32String(hex);
    } catch {
      return hex;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal Container */}
        <div className="bg-[#09090b]/90 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 animate-scale-up">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-black text-white font-display">Create New On-Chain Post</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase font-display">Post Title</label>
              <input
                type="text"
                required
                placeholder="Enter an engaging discussion title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase font-display">Forum Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/80"
                >
                  <option value="cat_general">General Discussion</option>
                  <option value="cat_dev">Developer Hub</option>
                  <option value="cat_gov">Governance & Proposals</option>
                  <option value="cat_memes">Base Memes & Fun</option>
                </select>
              </div>

              {/* Media URL link (optional) */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1 font-display">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Attachment Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 transition-colors"
                />
              </div>
            </div>

            {/* Content Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase font-display">Post Content / Message</label>
              <textarea
                required
                rows={5}
                placeholder="Share your ideas, code, proposals, or Web3 opinions here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 resize-none transition-colors"
              />
            </div>

            {/* On-Chain reward notice */}
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex gap-3 text-xs text-indigo-400 leading-relaxed">
              <Info className="w-4.5 h-4.5 shrink-0 text-indigo-400" />
              <p>
                <strong>On-Chain Reward Active:</strong> Every high-quality post published uploads your profile hash, triggers the smart contract, builds your reputation on-chain, and automatically awards you <strong className="text-white">+50 XP</strong> on Base.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#0c0c0e] hover:bg-slate-850 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Processing..." : "Publish Post"}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};
