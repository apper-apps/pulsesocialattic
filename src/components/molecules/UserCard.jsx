import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import { formatDistanceToNow } from "date-fns";

const UserCard = ({
  user,
  showFollowButton = false,
  showTimestamp = false,
  timestamp,
  isFollowing = false,
  onFollowToggle,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Link to={`/profile/${user.username}`}>
        <Avatar
          src={user.avatarUrl}
          alt={user.displayName}
          fallback={user.displayName}
          className="hover:scale-105 transition-transform duration-200"
        />
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link 
          to={`/profile/${user.username}`}
          className="block hover:text-primary transition-colors"
        >
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.displayName}
          </p>
          <p className="text-sm text-gray-500 truncate">
            @{user.username}
          </p>
        </Link>
        {showTimestamp && timestamp && (
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </p>
        )}
      </div>
      
      {showFollowButton && (
        <Button
          variant={isFollowing ? "secondary" : "primary"}
          size="sm"
          onClick={() => onFollowToggle?.(user.id)}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
};

export default UserCard;