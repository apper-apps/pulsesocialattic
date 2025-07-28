import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { UserService } from "@/services/api/userService";
import { FollowService } from "@/services/api/followService";
import { cn } from "@/utils/cn";

const UserProfile = ({ username, onFollowUpdate, className }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadUserProfile = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [userData, currentUserData] = await Promise.all([
        UserService.getByUsername(username),
        UserService.getCurrentUser()
      ]);
      
      setUser(userData);
      setCurrentUser(currentUserData);
      
      if (currentUserData && userData.id !== currentUserData.id) {
        const followStatus = await FollowService.isFollowing(currentUserData.id, userData.id);
        setIsFollowing(followStatus);
      }
    } catch (err) {
      setError("Failed to load user profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

const handleFollowToggle = async () => {
    if (!currentUser || !user) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await FollowService.unfollow(currentUser.id, user.id);
        setIsFollowing(false);
        setUser(prev => ({
          ...prev,
          followerCount: prev.followerCount - 1
        }));
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await FollowService.follow(currentUser.id, user.id);
        setIsFollowing(true);
        setUser(prev => ({
          ...prev,
          followerCount: prev.followerCount + 1
        }));
        toast.success(`Now following @${user.username}`);
      }
      
      onFollowUpdate?.(user.id, !isFollowing);
    } catch (err) {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadUserProfile} />;
  if (!user) return null;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-card", className)}>
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-t-xl"></div>
      
      {/* Profile Info */}
      <div className="px-6 pb-6">
<div className="flex items-end justify-between -mt-16">
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName}
            fallback={user.displayName}
            size="2xl"
            className="border-4 border-white shadow-lg"
          />
          
          {isOwnProfile ? (
            <div className="flex items-center space-x-3 mt-16">
              <Button
                variant="secondary"
                size="icon"
                className="text-gray-600 hover:text-gray-900"
              >
                <ApperIcon name="MoreHorizontal" className="w-5 h-5" />
              </Button>
              
              <Button
                variant="primary"
                onClick={() => toast.success("Edit profile feature coming soon!")}
                className="px-6"
              >
                <ApperIcon name="Edit3" className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          ) : currentUser && (
            <div className="flex items-center space-x-3 mt-16">
              <Button
                variant="secondary"
                size="icon"
                className="text-gray-600 hover:text-gray-900"
              >
                <ApperIcon name="MoreHorizontal" className="w-5 h-5" />
              </Button>
              
              <Button
                variant={isFollowing ? "secondary" : "primary"}
                onClick={handleFollowToggle}
                loading={followLoading}
                className="px-6"
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-4">
          {/* Name and Username */}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.displayName}
              </h1>
              {user.isPrivate && (
                <Badge variant="secondary" size="sm">
                  <ApperIcon name="Lock" className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <p className="text-gray-500">@{user.username}</p>
          </div>
          
          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 leading-relaxed">
              {user.bio}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {user.postCount || 0}
              </p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            
            <button className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <p className="text-xl font-bold text-gray-900">
                {user.followerCount}
              </p>
              <p className="text-sm text-gray-500">Followers</p>
            </button>
            
            <button className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <p className="text-xl font-bold text-gray-900">
                {user.followingCount}
              </p>
              <p className="text-sm text-gray-500">Following</p>
            </button>
          </div>
          
          {/* Join Date */}
          <div className="flex items-center text-gray-500 text-sm">
            <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString("en-US", { 
              month: "long", 
              year: "numeric" 
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;