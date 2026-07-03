/**
 * Supabase service layer with LocalStorage failover.
 * Ensures the app works perfectly regardless of database initialization state
 * while using real Supabase connections when variables are present.
 */

import { createClient } from "@supabase/supabase-js";
import { Post, Comment, Bookmark, Notification, Category } from "../types/forum";

// Support both NEXT_PUBLIC_ (user env) and standard VITE_ prefixes
const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = 
  (metaEnv.NEXT_PUBLIC_SUPABASE_URL as string) || 
  (metaEnv.VITE_SUPABASE_URL as string) || 
  "https://njandjtkbzdttvstnrms.supabase.co";

const SUPABASE_KEY = 
  (metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || 
  (metaEnv.VITE_SUPABASE_ANON_KEY as string) || 
  "sb_publishable_nqUNCQwyz0bTSLU67GfrkQ_lHWltN5k";

let supabaseClient: any = null;
try {
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (error) {
  console.warn("Supabase initialization failed, falling back to LocalStorage persistence.", error);
}

// Default visual seeds for high fidelity layout
const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat_general",
    name: "General Discussion",
    description: "General discussion regarding Web3 development, the Base ecosystem, and other social topics.",
    icon: "MessageSquare",
    communityId: "0x67656e6572616c00000000000000000000000000000000000000000000000000" // "general" in hex
  },
  {
    id: "cat_dev",
    name: "Developer Hub",
    description: "Gathering place for smart contract developers, dApp frontend architects, and technical audiences.",
    icon: "Code",
    communityId: "0x646576656c6f7065720000000000000000000000000000000000000000000000" // "developer" in hex
  },
  {
    id: "cat_gov",
    name: "Governance & Proposals",
    description: "Discussions on voting, moderator assignments, improving the dApp reputation system, and on-chain parameters.",
    icon: "ShieldAlert",
    communityId: "0x676f7665726e616e636500000000000000000000000000000000000000000000" // "governance" in hex
  },
  {
    id: "cat_memes",
    name: "Base Memes & Fun",
    description: "A collection of high-quality memes about Base L2, low gas fees, and degen culture.",
    icon: "Laugh",
    communityId: "0x6d656d6573000000000000000000000000000000000000000000000000000000" // "memes" in hex
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: "post_1",
    title: "Building Social dApp Architecture Based on On-Chain Reputation on Base",
    content: "Welcome to the Web3 Social Forum dApp! This forum uses the ForumIdentityRegistry, ForumReputation, and SoulboundReputationTokens smart contracts to manage on-chain user reputation in real-time. Every contribution (post, upvote, comment) can increase your XP and Level, and earn Soulbound verification Badges. Let's discuss how to improve decentralized reputation systems to be resistant to sybil attacks.",
    category: "cat_dev",
    authorAddress: "0x08a1D669F33c6591f0bf0CCA49D6d98eb9050b20",
    authorUsername: "DeployerAdmin",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=admin",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    upvotes: 42,
    downvotes: 1,
    commentsCount: 3,
    onChainReputation: 1200,
    onChainLevel: 5,
    isVerified: true
  },
  {
    id: "post_2",
    title: "Contract Parameter Proposal: Reducing XP Requirements to Reach Level 10",
    content: "As part of the community inclusion initiative, I propose adjusting the minimumXPForLevel parameter on the ForumReputation smart contract. The current LevelMath formula is quite steep for high levels. What do you think about this new level transition? Do we need to submit a DAO vote next week?",
    category: "cat_gov",
    authorAddress: "0x20D902Adc3c7956C0aE06E685e773C9d26d76372",
    authorUsername: "ReputationManager",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=rep",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    upvotes: 18,
    downvotes: 3,
    commentsCount: 2,
    onChainReputation: 450,
    onChainLevel: 3,
    isVerified: false
  },
  {
    id: "post_3",
    title: "Why Base L2 is the Best Layer for Decentralized Social Applications",
    content: "With ultra-low transaction costs (<$0.01) and lightning-fast finality, Base provides a seamless social dApp experience for Web2 users. Users do not need to worry about expensive gas fees when registering their on-chain profiles or placing upvotes that are recorded on the blockchain. This opens the gate for mass adoption!",
    category: "cat_general",
    authorAddress: "0x1eF070954192D53df4b4cc9c2941aeC315B3e6F7",
    authorUsername: "IdentityRegistrar",
    authorAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=identity",
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    upvotes: 28,
    downvotes: 0,
    commentsCount: 0,
    onChainReputation: 320,
    onChainLevel: 7,
    isVerified: true
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c1",
    postId: "1",
    authorAddress: "0x1eF070954192D53df4b4cc9c2941aeC315B3e6F7",
    content: "I completely agree with this proposal. Integrating on-chain reputation in this forum dApp provides a great incentive to contribute high-quality content.",
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    upvotes: 12
  },
  {
    id: "c2",
    postId: "1",
    authorAddress: "0x5b41CD272C6cd5D2EcdE02771d0aD62962378b1A",
    content: "The Soulbound Badge system for verification (Badge ID 1) works very efficiently in reducing spam posts.",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    upvotes: 7
  }
];

// Helper to write to local storage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const value = localStorage.getItem(key);
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const ForumBackendService = {
  // --- Category Operations ---
  async getCategories(): Promise<Category[]> {
    return INITIAL_CATEGORIES;
  },

  // --- Post Operations ---
  async getPosts(category?: string, search?: string): Promise<Post[]> {
    if (supabaseClient) {
      try {
        let query = supabaseClient.from("posts").select("*");
        if (category) query = query.eq("category", category);
        if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        const { data, error } = await query.order("created_at", { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn("Supabase query failed, falling back to LocalStorage posts.", err);
      }
    }

    // LocalStorage failover
    let posts = getStorageItem<Post[]>("forum_posts", INITIAL_POSTS);
    if (category) {
      posts = posts.filter(p => p.category === category);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(lowerSearch) || 
        p.content.toLowerCase().includes(lowerSearch)
      );
    }
    return posts;
  },

  async getPostById(id: string): Promise<Post | null> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from("posts").select("*").eq("id", id).single();
        if (!error && data) return data;
      } catch {}
    }
    const posts = getStorageItem<Post[]>("forum_posts", INITIAL_POSTS);
    return posts.find(p => p.id === id) || null;
  },

  async createPost(title: string, content: string, category: string, authorAddress: string, authorUsername?: string, imageUrl?: string): Promise<Post> {
    const newPost: Post = {
      id: "post_" + Math.random().toString(36).substr(2, 9),
      title,
      content,
      category,
      authorAddress,
      authorUsername: authorUsername || `${authorAddress.substring(0, 6)}...${authorAddress.substring(38)}`,
      authorAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${authorAddress}`,
      imageUrl: imageUrl || undefined,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      downvotes: 0,
      commentsCount: 0,
      onChainReputation: 0,
      onChainLevel: 1,
      isVerified: false
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from("posts").insert([newPost]).select().single();
        if (!error && data) return data;
      } catch {}
    }

    const posts = getStorageItem<Post[]>("forum_posts", INITIAL_POSTS);
    posts.unshift(newPost);
    setStorageItem("forum_posts", posts);
    return newPost;
  },

  async votePost(postId: string, voteType: "up" | "down", userAddress: string): Promise<Post | null> {
    const posts = getStorageItem<Post[]>("forum_posts", INITIAL_POSTS);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return null;

    const post = posts[postIndex];
    if (post.voted === voteType) {
      // Undo vote
      if (voteType === "up") post.upvotes--;
      else post.downvotes--;
      post.voted = null;
    } else {
      // Change or add vote
      if (post.voted === "up") post.upvotes--;
      if (post.voted === "down") post.downvotes--;

      if (voteType === "up") post.upvotes++;
      else post.downvotes++;
      post.voted = voteType;
    }

    posts[postIndex] = post;
    setStorageItem("forum_posts", posts);
    return post;
  },

  // --- Comment Operations ---
  async getComments(postId: string): Promise<Comment[]> {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from("comments").select("*").eq("post_id", postId);
        if (!error && data && data.length > 0) return data;
      } catch {}
    }

    const comments = getStorageItem<Comment[]>("forum_comments", INITIAL_COMMENTS);
    return comments.filter(c => c.postId === postId);
  },

  async addComment(postId: string, content: string, authorAddress: string, authorUsername?: string): Promise<Comment> {
    const newComment: Comment = {
      id: "comment_" + Math.random().toString(36).substr(2, 9),
      postId,
      content,
      authorAddress,
      authorUsername: authorUsername || `${authorAddress.substring(0, 6)}...${authorAddress.substring(38)}`,
      authorAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${authorAddress}`,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      onChainReputation: 0
    };

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from("comments").insert([newComment]).select().single();
        // update comment count on post
        await supabaseClient.rpc("increment_comment_count", { post_id: postId });
        if (!error && data) return data;
      } catch {}
    }

    // LocalStorage persistence
    const comments = getStorageItem<Comment[]>("forum_comments", INITIAL_COMMENTS);
    comments.push(newComment);
    setStorageItem("forum_comments", comments);

    // Update comments count on post in storage
    const posts = getStorageItem<Post[]>("forum_posts", INITIAL_POSTS);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      posts[postIndex].commentsCount++;
      setStorageItem("forum_posts", posts);
    }

    return newComment;
  },

  // --- Bookmark Operations ---
  async getBookmarks(userAddress: string): Promise<Post[]> {
    const bookmarks = getStorageItem<Bookmark[]>("forum_bookmarks", []);
    const userBookmarks = bookmarks.filter(b => b.userAddress.toLowerCase() === userAddress.toLowerCase());
    const bookmarkedPostIds = userBookmarks.map(b => b.postId);
    const posts = getStorageItem<Post[]>("forum_posts", INITIAL_POSTS);
    return posts.filter(p => bookmarkedPostIds.includes(p.id));
  },

  async toggleBookmark(postId: string, userAddress: string): Promise<boolean> {
    const bookmarks = getStorageItem<Bookmark[]>("forum_bookmarks", []);
    const idx = bookmarks.findIndex(
      b => b.postId === postId && b.userAddress.toLowerCase() === userAddress.toLowerCase()
    );

    if (idx !== -1) {
      bookmarks.splice(idx, 1);
      setStorageItem("forum_bookmarks", bookmarks);
      return false; // Removed
    } else {
      bookmarks.push({
        id: "bookmark_" + Math.random().toString(36).substr(2, 9),
        postId,
        userAddress,
        bookmarkedAt: new Date().toISOString()
      });
      setStorageItem("forum_bookmarks", bookmarks);
      return true; // Added
    }
  },

  async isBookmarked(postId: string, userAddress: string): Promise<boolean> {
    const bookmarks = getStorageItem<Bookmark[]>("forum_bookmarks", []);
    return bookmarks.some(
      b => b.postId === postId && b.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  },

  // --- Notification Operations ---
  async getNotifications(userAddress: string): Promise<Notification[]> {
    const notifications = getStorageItem<Notification[]>("forum_notifications", []);
    return notifications
      .filter(n => n.recipientAddress.toLowerCase() === userAddress.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addNotification(
    recipientAddress: string,
    senderAddress: string,
    type: Notification["type"],
    message: string,
    postId?: string,
    txHash?: string,
    senderUsername?: string
  ): Promise<Notification> {
    const newNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      recipientAddress,
      senderAddress,
      senderUsername: senderUsername || `${senderAddress.substring(0, 6)}...${senderAddress.substring(38)}`,
      senderAvatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${senderAddress}`,
      type,
      message,
      postId,
      read: false,
      createdAt: new Date().toISOString(),
      onChainTx: txHash
    };

    const notifications = getStorageItem<Notification[]>("forum_notifications", []);
    notifications.unshift(newNotif);
    setStorageItem("forum_notifications", notifications);
    return newNotif;
  },

  async markAllNotificationsAsRead(userAddress: string): Promise<void> {
    const notifications = getStorageItem<Notification[]>("forum_notifications", []);
    const updated = notifications.map(n => {
      if (n.recipientAddress.toLowerCase() === userAddress.toLowerCase()) {
        return { ...n, read: true };
      }
      return n;
    });
    setStorageItem("forum_notifications", updated);
  }
};
