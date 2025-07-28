import React from "react";
import PostFeed from "@/components/organisms/PostFeed";

const HomePage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold gradient-text font-display mb-2">
          Welcome to Pulse
        </h1>
        <p className="text-gray-600 text-lg">
          Share your moments and connect with friends
        </p>
      </div>
      
      <PostFeed />
    </div>
  );
};

export default HomePage;