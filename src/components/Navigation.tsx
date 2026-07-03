import React from "react";
import { 
  Home, 
  Compass, 
  Award, 
  CheckCircle, 
  Trophy, 
  Users, 
  Settings, 
  FileText, 
  Search,
  MessageSquare,
  Network
} from "lucide-react";

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  categories: Array<{ id: string; name: string; icon: string }>;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  selectedCategory,
  setSelectedCategory,
  categories
}) => {
  const mainNavItems = [
    { id: "feed", label: "Feeds & Discussion", icon: Home },
    { id: "reputation", label: "On-Chain Reputation", icon: Award },
    { id: "badges", label: "Soulbound Badges", icon: CheckCircle },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "communities", label: "Communities & Roles", icon: Users },
    { id: "settings", label: "Identity Settings", icon: Settings },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageSquare": return MessageSquare;
      case "Code": return FileText;
      case "ShieldAlert": return Network;
      default: return Compass;
    }
  };

  return (
    <aside id="sidebar_nav" className="w-64 bg-[#09090b] border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 p-6 overflow-y-auto">
      <div className="space-y-8">
        {/* Main Links */}
        <div>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-4">
            Main Menu
          </h2>
          <nav className="space-y-1.5">
            {mainNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    if (item.id === "feed") {
                      setSelectedCategory(null);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-800/50 text-white border border-slate-700/50 shadow-sm font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-4">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Forum Categories
            </h2>
          </div>
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setCurrentView("feed");
                setSelectedCategory(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentView === "feed" && selectedCategory === null
                  ? "bg-slate-800/50 text-white border border-slate-700/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              All Topics
            </button>
            {categories.map((cat) => {
              const CatIcon = getIcon(cat.icon);
              const isSelected = currentView === "feed" && selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCurrentView("feed");
                    setSelectedCategory(cat.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-slate-800/50 text-white border border-slate-700/50"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <CatIcon className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                  {cat.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Network Indicator and Deployer Info */}
      <div className="pt-6 border-t border-slate-800 space-y-3">
        <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Wallet Status</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-xs font-semibold text-slate-300">Base Mainnet</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono space-y-1 border-t border-slate-800/50 pt-2">
            <p className="truncate" title="0x1eF070954192D53df4b4cc9c2941aeC315B3e6F7">Registry: 0x1eF0...e6F7</p>
            <p className="truncate" title="0x5b41CD272C6cd5D2EcdE02771d0aD62962378b1A">Rep: 0x5b41...8b1A</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
