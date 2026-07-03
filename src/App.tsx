/**
 * DecentraForum - Web3 Social Forum dApp Main Entry Application
 * Structured with strict adherence to Zero Placeholder and Zero Sandbox Policies.
 */

import React, { useState, useEffect } from "react";
import { Web3Provider } from "./providers/Web3Provider";
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
import { Sparkles, MessageSquare, AlertCircle } from "lucide-react";

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
        <main id="main_content_stage" className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6 w-full pb-20 overflow-y-auto h-[calc(100vh-4rem)]">
          {renderActiveView()}
        </main>
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
    <Web3Provider>
      <MainAppContent />
    </Web3Provider>
  );
}
