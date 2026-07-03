/**
 * Smart Contract ABIs
 * Sourced directly from verified contract deployment metadata.
 */

export const FORUM_IDENTITY_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "identityOf",
    "outputs": [
      {
        "components": [
          { "internalType": "bool", "name": "registered", "type": "bool" },
          { "internalType": "bool", "name": "verified", "type": "bool" },
          { "internalType": "bytes32", "name": "profileHash", "type": "bytes32" },
          { "internalType": "uint64", "name": "registeredAt", "type": "uint64" },
          { "internalType": "uint64", "name": "updatedAt", "type": "uint64" }
        ],
        "internalType": "struct ForumIdentityRegistry.Identity",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "isGlobalModerator",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "communityId", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "communityRoleOf",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "profileHash", "type": "bytes32" }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "newProfileHash", "type": "bytes32" }
    ],
    "name": "updateProfileHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "bool", "name": "verified", "type": "bool" }
    ],
    "name": "setVerification",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "communityId", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint8", "name": "newRole", "type": "uint8" }
    ],
    "name": "assignCommunityRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "bool", "name": "active", "type": "bool" }
    ],
    "name": "assignGlobalModerator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "xpAmount", "type": "uint256" },
      { "internalType": "int256", "name": "reputationDelta", "type": "int256" },
      { "internalType": "bytes32", "name": "reason", "type": "bytes32" }
    ],
    "name": "recordContribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "hasRole",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "VERIFIER_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PROFILE_MANAGER_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REPUTATION_MANAGER_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BADGE_MANAGER_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ACHIEVEMENT_MANAGER_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const FORUM_REPUTATION_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "accountStats",
    "outputs": [
      { "internalType": "uint256", "name": "xp", "type": "uint256" },
      { "internalType": "int256", "name": "reputation", "type": "int256" },
      { "internalType": "uint64", "name": "level", "type": "uint64" },
      { "internalType": "uint64", "name": "actionCount", "type": "uint64" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint64", "name": "level", "type": "uint64" }
    ],
    "name": "minimumXPForLevel",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bytes32", "name": "reason", "type": "bytes32" }
    ],
    "name": "addXP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "int256", "name": "delta", "type": "int256" },
      { "internalType": "bytes32", "name": "reason", "type": "bytes32" }
    ],
    "name": "updateReputation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "xpAmount", "type": "uint256" },
      { "internalType": "int256", "name": "reputationDelta", "type": "int256" },
      { "internalType": "bytes32", "name": "reason", "type": "bytes32" }
    ],
    "name": "applyEngagement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const SOULBOUND_REPUTATION_TOKENS_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "tokenDefinition",
    "outputs": [
      { "internalType": "enum SoulboundReputationTokens.TokenKind", "name": "kind", "type": "uint8" },
      { "internalType": "bool", "name": "active", "type": "bool" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "exists",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "badgeId", "type": "uint256" }
    ],
    "name": "grantBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "badgeId", "type": "uint256" }
    ],
    "name": "revokeBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "achievementId", "type": "uint256" }
    ],
    "name": "unlockAchievement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "achievementId", "type": "uint256" }
    ],
    "name": "revokeAchievement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "createBadgeType",
    "outputs": [{ "internalType": "uint256", "name": "badgeId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "createAchievementType",
    "outputs": [{ "internalType": "uint256", "name": "achievementId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "uri",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];
