/**
 * DecentraForum - Web3 Social Forum dApp Main Entry Application
 * Structured with strict adherence to Zero Placeholder and Zero Sandbox Policies.
 */

import React, { useState, useEffect } from "react";
import { Web3Provider } from "./providers/Web3Provider";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./blockchain/wagmiConfig";

const queryClient = new QueryClient();
import { ForumBackendService } from "./services/supabase";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { CreatePostModal } from "./components/CreatePostModal";
import { FeedView } from "./views/FeedView";
import { ProfileView } from "./views/ProfileView";
import { ReputationView } from "./views/ReputationView";
import { BadgeView } from "./views/BadgeView";
import { AchievementView } from "./views/AchievementView";
import { CommunityView } from "./views/CommunityView";
import { SettingsView } from "./views/SettingsView";
import { Category, Post } from "./types/forum";
import { Sparkles, MessageSquare, AlertCircle, Home, Award, CheckCircle, Users, Settings } from "lucide-react";

function MainAppContent() {
  const [currentView, setCurrentView] = useState<string>("feed");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    ForumBackendService.getCategories().then(setCategories);
  }, []);

  const handlePostCreated = (newPost: Post) => {
    // Automatically transition to FeedView, reset query, and refresh post listing
    setCurrentView("feed");
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const handleNavigateToPost = (postId: string) => {
    // Handled internally in FeedView via activePost state, but we can reset and set view
    setCurrentView("feed");
  };

  const renderActiveView = () => {
    switch (currentView) {
      case "feed":
        return (
          <FeedView 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery} 
          />
        );
      case "reputation":
        return <ReputationView />;
      case "badges":
        return <BadgeView />;
      case "achievements":
        return <AchievementView />;
      case "communities":
        return <CommunityView />;
      case "settings":
        return <SettingsView />;
      default:
        return <FeedView selectedCategory={null} searchQuery="" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-slate-200 flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* App Header Bar */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onCreatePostClick={() => setIsCreateModalOpen(true)}
        setCurrentView={setCurrentView}
      />

      {/* App Shell Body (Sidebar + Content Stage) */}
      <div className="flex flex-1">
        {/* Left Side Navigation Rails */}
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {/* Center Main Stage Content */}
        <main id="main_content_stage" className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6 w-full pb-24 overflow-y-auto h-[calc(100vh-4rem)]">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#09090b]/95 border-t border-slate-800/80 backdrop-blur-md flex justify-around py-2.5 px-2 safe-bottom shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        {[
          { id: "feed", label: "Feed", icon: Home },
          { id: "reputation", label: "Reputation", icon: Award },
          { id: "badges", label: "Badges", icon: CheckCircle },
          { id: "communities", label: "Roles", icon: Users },
          { id: "settings", label: "Identity", icon: Settings },
        ].map((item) => {
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
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                isActive ? "text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <IconComponent className="w-4.5 h-4.5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Create New Post Modal Layer */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <MainAppContent />
        </Web3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
