import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";
import UserCard from "@/components/molecules/UserCard";
import PostActions from "@/components/molecules/PostActions";
import ApperIcon from "@/components/ApperIcon";

const PostCard = ({
  post,
  user,
  currentUser,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  className
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = currentUser && post.userId === currentUser.Id;

  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === post.content) {
      setIsEditing(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      await onEdit(post.id, { content: editContent.trim() });
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(post.id);
    setShowMenu(false);
  };
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
            {isOwner && (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <ApperIcon name="MoreHorizontal" className="w-5 h-5" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[120px] z-10">
                    <button
                      onClick={handleEditClick}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <ApperIcon name="Edit3" className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
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
        
{/* Post Content */}
        {isEditing ? (
          <div className="mt-4 space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
              disabled={isUpdating}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating || editContent.trim() === ''}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isUpdating && <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </article>
  );
};

export default PostCard;