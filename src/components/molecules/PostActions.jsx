import React, { useState } from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const PostActions = ({
  postId,
  likeCount = 0,
  commentCount = 0,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  className
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : prev - 1);
    
    if (newLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    
    onLike?.(postId, newLiked);
  };

  return (
    <div className={cn("flex items-center justify-between pt-3 border-t border-gray-100", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn(
          "text-gray-500 hover:text-accent space-x-2",
          liked && "text-accent",
          isAnimating && "like-animation"
        )}
      >
        <ApperIcon 
          name={liked ? "Heart" : "Heart"} 
          className={cn(
            "w-5 h-5",
            liked && "fill-current"
          )}
        />
        <span className="font-medium">{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onComment?.(postId)}
        className="text-gray-500 hover:text-primary space-x-2"
      >
        <ApperIcon name="MessageCircle" className="w-5 h-5" />
        <span className="font-medium">{commentCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onShare?.(postId)}
        className="text-gray-500 hover:text-secondary space-x-2"
      >
        <ApperIcon name="Share" className="w-5 h-5" />
        <span className="font-medium">Share</span>
      </Button>
    </div>
  );
};

export default PostActions;