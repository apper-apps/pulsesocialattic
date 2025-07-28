import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Avatar from "@/components/atoms/Avatar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
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
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: ""
  });
  const [saveLoading, setSaveLoading] = useState(false);
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

  const toggleEditMode = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditForm({
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || ""
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      const updatedUser = await UserService.update(user.id, {
        displayName: editForm.displayName.trim(),
        bio: editForm.bio.trim(),
        location: editForm.location.trim(),
        website: editForm.website.trim()
      });
      
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
};

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDropdownAction = (action) => {
    setShowDropdown(false);
    
    switch (action) {
      case 'settings':
        toast.info('Settings feature coming soon');
        break;
      case 'privacy':
        toast.info('Privacy settings feature coming soon');
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: `${user.displayName} (@${user.username})`,
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          toast.success('Profile link copied to clipboard');
        }
        break;
      case 'report':
        toast.info('Report feature coming soon');
        break;
      case 'block':
        toast.info('Block feature coming soon');
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

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
              <div className="relative dropdown-container">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleDropdownToggle}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ApperIcon name="MoreHorizontal" className="w-5 h-5" />
                </Button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {isOwnProfile ? (
                      <>
                        <button
                          onClick={() => handleDropdownAction('settings')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ApperIcon name="Settings" className="w-4 h-4 mr-3" />
                          Settings
                        </button>
                        <button
                          onClick={() => handleDropdownAction('privacy')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ApperIcon name="Shield" className="w-4 h-4 mr-3" />
                          Privacy
                        </button>
                        <button
                          onClick={() => handleDropdownAction('share')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ApperIcon name="Share" className="w-4 h-4 mr-3" />
                          Share Profile
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDropdownAction('share')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ApperIcon name="Share" className="w-4 h-4 mr-3" />
                          Share Profile
                        </button>
                        <button
                          onClick={() => handleDropdownAction('report')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <ApperIcon name="Flag" className="w-4 h-4 mr-3" />
                          Report User
                        </button>
                        <button
                          onClick={() => handleDropdownAction('block')}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <ApperIcon name="UserX" className="w-4 h-4 mr-3" />
                          Block User
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={toggleEditMode}
                    disabled={saveLoading}
                    className="px-4"
                  >
                    <ApperIcon name="X" className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    className="px-6"
                  >
                    {saveLoading ? (
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ApperIcon name="Check" className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={toggleEditMode}
                  className="px-6"
                >
                  <ApperIcon name="Edit3" className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          ) : currentUser && (
            <div className="flex items-center space-x-3 mt-16">
              <div className="relative dropdown-container">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleDropdownToggle}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ApperIcon name="MoreHorizontal" className="w-5 h-5" />
                </Button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => handleDropdownAction('share')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <ApperIcon name="Share" className="w-4 h-4 mr-3" />
                      Share Profile
                    </button>
                    <button
                      onClick={() => handleDropdownAction('report')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <ApperIcon name="Flag" className="w-4 h-4 mr-3" />
                      Report User
                    </button>
                    <button
                      onClick={() => handleDropdownAction('block')}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <ApperIcon name="UserX" className="w-4 h-4 mr-3" />
                      Block User
                    </button>
                  </div>
                )}
              </div>
              
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
{/* Edit Form */}
      {isOwnProfile && isEditing && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <Input
                value={editForm.displayName}
                onChange={(e) => handleFormChange("displayName", e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <TextArea
                value={editForm.bio}
                onChange={(e) => handleFormChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {editForm.bio.length}/160 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                value={editForm.location}
                onChange={(e) => handleFormChange("location", e.target.value)}
                placeholder="Where are you located?"
                maxLength={30}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <Input
                value={editForm.website}
                onChange={(e) => handleFormChange("website", e.target.value)}
                placeholder="https://your-website.com"
                type="url"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;