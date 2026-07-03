import React, { useState } from "react";
import { useWeb3 } from "../providers/Web3Provider";
import { 
  Users, 
  ShieldAlert, 
  Send, 
  Shield, 
  UserPlus, 
  Clock, 
  Check, 
  AlertCircle,
  HelpCircle,
  Globe
} from "lucide-react";

export const CommunityView: React.FC = () => {
  const { 
    account, 
    userStats, 
    isTxPending, 
    currentTxHash, 
    txError, 
    txSuccessMessage,
    assignCommunityRoleOnChain 
  } = useWeb3();

  const [communityId, setCommunityId] = useState<string>("0x67656e6572616c00000000000000000000000000000000000000000000000000"); // "general" in hex
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<number>(3); // Default to Member

  const handleRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientAddress || !ethersValidateAddress(recipientAddress)) {
      return;
    }

    // Call on-chain assignCommunityRole
    await assignCommunityRoleOnChain(communityId, recipientAddress, selectedRole);
    setRecipientAddress("");
  };

  const ethersValidateAddress = (address: string) => {
    try {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } catch {
      return false;
    }
  };

  const communities = [
    {
      id: "0x67656e6572616c00000000000000000000000000000000000000000000000000",
      name: "General Discussion Community",
      members: "2,410",
      postsCount: 145
    },
    {
      id: "0x646576656c6f7065720000000000000000000000000000000000000000000000",
      name: "Developer Hub Community",
      members: "852",
      postsCount: 78
    },
    {
      id: "0x676f7665726e616e636500000000000000000000000000000000000000000000",
      name: "Governance & Proposals Community",
      members: "420",
      postsCount: 42
    }
  ];

  const roleDefinitions = [
    { id: 1, name: "Community Admin", description: "Full authority within the community to approve moderators, edit rules, and configure on-chain parameters." },
    { id: 2, name: "Moderator", description: "Rule enforcer role, reviews disputes, tidies content, and handles spam posts." },
    { id: 3, name: "Member", description: "Fully verified user with unlimited posting rights, discussion upvoting, and commenting privileges." },
    { id: 4, name: "Observer", description: "Passive observer without full on-chain rights, only allowed to read topics." }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Introduction */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
          <Users className="text-indigo-400 w-7 h-7" />
          On-Chain Communities & Roles
        </h2>
        <p className="text-slate-400 text-sm">
          All forum citizen roles are managed through an on-chain role system in the <code className="text-indigo-400 font-mono text-xs">ForumIdentityRegistry</code> smart contract. This ensures fully transparent and independent moderation.
        </p>
      </div>

      {/* Transaction Notifications Banner */}
      {isTxPending && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <Clock className="w-5 h-5 text-indigo-400 animate-spin" />
          <div>
            <h4 className="font-bold text-sm">Transaction in Progress</h4>
            <p className="text-xs text-indigo-400/80 mt-1">Submitting your on-chain role status update to Base...</p>
          </div>
        </div>
      )}

      {txSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          <div>
            <h4 className="font-bold text-sm">Role Updated Successfully!</h4>
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

        {/* Communities Table & Role Definitions */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Registered Community List
            </h3>
            
            <div className="space-y-3">
              {communities.map((comm) => (
                <div key={comm.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5 font-display">
                      <Globe className="w-4 h-4 text-slate-500" />
                      {comm.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-none">
                      Hex ID: {comm.id}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-300">{comm.members} Citizens</p>
                    <p className="text-[10px] text-slate-500">{comm.postsCount} Topics</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              On-Chain Role Level Definitions
            </h3>
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4">
              {roleDefinitions.map((role) => (
                <div key={role.id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs">{role.name} (Role ID: {role.id})</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Role Assignment Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Community Authority Management
          </h3>

          {account && (userStats?.hasAdminRole || userStats?.hasVerifierRole) ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 p-3.5 rounded-2xl flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <p className="text-xs">
                  On-Chain Admin Authorization Detected. You have authority to manage member roles on any community in this dApp.
                </p>
              </div>

              <form onSubmit={handleRoleAssignment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase font-display">
                    Select Community
                  </label>
                  <select
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/80 font-mono"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase font-display">
                    Member Wallet Address (0x...)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallet address 0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-indigo-500/80 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase font-display">
                    Select New Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(Number(e.target.value))}
                    className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/80"
                  >
                    <option value={1}>Role ID: 1 - Community Admin</option>
                    <option value={2}>Role ID: 2 - Moderator</option>
                    <option value={3}>Role ID: 3 - Member</option>
                    <option value={4}>Role ID: 4 - Observer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isTxPending || !recipientAddress || !ethersValidateAddress(recipientAddress)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Role Assignment Transaction
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center text-slate-500 space-y-4">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm font-display">Operator Access Locked</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Only wallets holding the <code className="text-indigo-400 font-mono">DEFAULT_ADMIN_ROLE</code> or registered community owners are authorized to modify on-chain role assignments.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
