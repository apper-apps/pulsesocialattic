import React, { useState } from "react";
import { useParams } from "react-router-dom";
import UserProfile from "@/components/organisms/UserProfile";
import PostFeed from "@/components/organisms/PostFeed";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ProfilePage = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);

  const tabs = [
    { id: "posts", label: "Posts", icon: "Grid3X3" },
    { id: "media", label: "Media", icon: "Image" },
    { id: "likes", label: "Likes", icon: "Heart" }
  ];

  const handleFollowUpdate = (userId, isFollowing) => {
    // Handle follow status update
    console.log("Follow updated:", userId, isFollowing);
  };

  return (
    <div className="space-y-6">
      <UserProfile
        username={username}
        onFollowUpdate={handleFollowUpdate}
      />
      
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <ApperIcon name={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === "posts" && (
            <PostFeed userId={user?.id} />
          )}
          
          {activeTab === "media" && (
            <div className="text-center py-12">
              <ApperIcon name="Image" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No media posts yet
              </h3>
              <p className="text-gray-500">
                Photos and videos will appear here
              </p>
            </div>
          )}
          
          {activeTab === "likes" && (
            <div className="text-center py-12">
              <ApperIcon name="Heart" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No liked posts yet
              </h3>
              <p className="text-gray-500">
                Liked posts will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;