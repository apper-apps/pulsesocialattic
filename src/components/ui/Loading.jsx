import React from "react";
import { cn } from "@/utils/cn";

const Loading = ({ className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Post Creation Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <div className="flex space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-4">
            <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <div className="h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-8 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-10 w-20 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
          <div className="space-y-4">
            {/* User Info Skeleton */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
            </div>
            
            {/* Image Skeleton */}
            <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            
            {/* Actions Skeleton */}
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <div className="flex space-x-6">
                <div className="h-8 w-12 bg-gradient-to-r from-accent/20 to-accent/30 rounded animate-pulse"></div>
                <div className="h-8 w-12 bg-gradient-to-r from-primary/20 to-primary/30 rounded animate-pulse"></div>
                <div className="h-8 w-12 bg-gradient-to-r from-secondary/20 to-secondary/30 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loading;