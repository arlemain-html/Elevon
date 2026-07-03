/**
 * Data types for Web3 Forum
 * Sourced for both off-chain backend data and on-chain attributes
 */

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorAddress: string;
  authorUsername?: string;
  authorAvatar?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  voted?: "up" | "down" | null;
  commentsCount: number;
  onChainReputation?: number;
  onChainLevel?: number;
  isVerified?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorAddress: string;
  authorUsername?: string;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  onChainReputation?: number;
}

export interface Bookmark {
  id: string;
  postId: string;
  userAddress: string;
  bookmarkedAt: string;
}

export interface Notification {
  id: string;
  recipientAddress: string;
  senderAddress: string;
  senderUsername?: string;
  senderAvatar?: string;
  type: "upvote" | "comment" | "reputation_delta" | "level_up" | "badge_granted" | "mention";
  message: string;
  postId?: string;
  read: boolean;
  createdAt: string;
  onChainTx?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  communityId: string; // bytes32 hex corresponding to smart contract community
}

export interface ReputationHistory {
  id: string;
  account: string;
  delta: number;
  newReputation: number;
  reason: string;
  txHash: string;
  timestamp: string;
}

export interface UserStats {
  xp: number;
  reputation: number;
  level: number;
  actionCount: number;
  isRegistered: boolean;
  isVerified: boolean;
  profileHash: string;
  registeredAt: number;
  updatedAt: number;
  isGlobalModerator: boolean;
  hasVerifierRole: boolean;
  hasAdminRole: boolean;
}

export interface BadgeType {
  id: number;
  name: string;
  description: string;
  image: string;
  uri: string;
  isOwned: boolean;
  kind: "Badge" | "Achievement" | "Unknown";
  active: boolean;
}

export interface AchievementType {
  id: number;
  name: string;
  description: string;
  points: number;
  isUnlocked: boolean;
  active: boolean;
}
