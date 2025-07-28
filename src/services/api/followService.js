import follows from "@/services/mockData/follows.json";
import users from "@/services/mockData/users.json";
import { NotificationService } from "./notificationService";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const FollowService = {
  async getFollowers(userId) {
    await delay(300);
    const userFollows = follows.filter(f => f.followingId === parseInt(userId));
    const followerUsers = userFollows.map(follow => {
      const user = users.find(u => u.Id === follow.followerId);
      return user ? {
        ...user,
        id: user.Id.toString(),
        followedAt: follow.createdAt
      } : null;
    }).filter(Boolean);
    
    return followerUsers;
  },

  async getFollowing(userId) {
    await delay(300);
    const userFollows = follows.filter(f => f.followerId === parseInt(userId));
    const followingUsers = userFollows.map(follow => {
      const user = users.find(u => u.Id === follow.followingId);
      return user ? {
        ...user,
        id: user.Id.toString(),
        followedAt: follow.createdAt
      } : null;
    }).filter(Boolean);
    
    return followingUsers;
  },

  async isFollowing(followerId, followingId) {
    await delay(200);
    return follows.some(f => 
      f.followerId === parseInt(followerId) && 
      f.followingId === parseInt(followingId)
    );
  },

async follow(followerId, followingId) {
    await delay(350);
    
    // Check if already following
    const existingFollow = follows.find(f => 
      f.followerId === parseInt(followerId) && 
      f.followingId === parseInt(followingId)
    );
    
    if (existingFollow) {
      throw new Error("Already following this user");
    }
    
    const newFollow = {
      Id: Math.max(...follows.map(f => f.Id)) + 1,
      followerId: parseInt(followerId),
      followingId: parseInt(followingId),
      createdAt: new Date().toISOString()
    };
    
    follows.push(newFollow);
    
    // Update user follower counts
    const followerUser = users.find(u => u.Id === parseInt(followerId));
    const followingUser = users.find(u => u.Id === parseInt(followingId));
    
    if (followerUser) followerUser.followingCount++;
    if (followingUser) followingUser.followerCount++;
    
    // Create notification for follow
    if (followerId !== followingId) { // Don't notify self
      try {
        await NotificationService.create({
          userId: parseInt(followingId),
          fromUserId: parseInt(followerId),
          type: 'follow',
          message: `${followerUser.displayName} started following you`
        });
      } catch (error) {
        console.error('Failed to create follow notification:', error);
      }
    }
    
    return {
      ...newFollow,
      id: newFollow.Id.toString()
    };
  },

  async unfollow(followerId, followingId) {
    await delay(300);
    
    const followIndex = follows.findIndex(f => 
      f.followerId === parseInt(followerId) && 
      f.followingId === parseInt(followingId)
    );
    
    if (followIndex === -1) {
      throw new Error("Not following this user");
    }
    
    follows.splice(followIndex, 1);
    
    // Update user follower counts
    const followerUser = users.find(u => u.Id === parseInt(followerId));
    const followingUser = users.find(u => u.Id === parseInt(followingId));
    
    if (followerUser) followerUser.followingCount = Math.max(0, followerUser.followingCount - 1);
    if (followingUser) followingUser.followerCount = Math.max(0, followingUser.followerCount - 1);
    
    return { success: true };
  },

  async getMutualFollows(userId1, userId2) {
    await delay(300);
    const user1Following = await this.getFollowing(userId1);
    const user2Following = await this.getFollowing(userId2);
    
    const mutualFollows = user1Following.filter(user1Follow =>
      user2Following.some(user2Follow => user2Follow.id === user1Follow.id)
    );
    
    return mutualFollows;
  },

  async getSuggestions(userId) {
    await delay(400);
    const currentUserFollowing = await this.getFollowing(userId);
    const followingIds = currentUserFollowing.map(u => u.id);
    
    // Get users not currently followed
    const suggestions = users
      .filter(user => 
        user.Id !== parseInt(userId) && 
        !followingIds.includes(user.Id.toString())
      )
      .slice(0, 5)
      .map(user => ({
        ...user,
        id: user.Id.toString()
      }));
    
    return suggestions;
  }
};