import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";
import UserCard from "@/components/molecules/UserCard";
import PostActions from "@/components/molecules/PostActions";
import ApperIcon from "@/components/ApperIcon";

const PostCard = ({
  post,
  user,
  onLike,
  onComment,
  onShare,
  className
}) => {
  return (
    <article className={cn(
      "bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover transition-all duration-200",
      className
    )}>
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center justify-between mb-4">
          <UserCard
            user={user}
            showTimestamp
            timestamp={post.createdAt}
          />
          
          <div className="flex items-center space-x-2">
            {post.privacy === "followers" && (
              <ApperIcon 
                name="Users" 
                className="w-4 h-4 text-gray-400" 
                title="Followers only"
              />
            )}
            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <ApperIcon name="MoreHorizontal" className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Post Content */}
        <Link to={`/post/${post.id}`} className="block group">
          <div className="space-y-4">
            {post.content && (
              <p className="text-gray-900 leading-relaxed group-hover:text-gray-700 transition-colors">
                {post.content}
              </p>
            )}
            
            {post.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-full h-auto max-h-96 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            )}
          </div>
        </Link>
        
        {/* Post Actions */}
        <PostActions
          postId={post.id}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          isLiked={post.isLiked}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          className="mt-4"
        />
      </div>
    </article>
  );
};

export default PostCard;