import { toast } from 'react-toastify';
import { NotificationService } from "./notificationService";
import { UserService } from "./userService";

export const FollowService = {
  async getFollowers(userId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "followerId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "followingId" } },
          { field: { Name: "createdAt" } }
        ],
        where: [
          {
            FieldName: "followingId",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('follow', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const userFollows = response.data;
      const followerUsers = [];

      for (const follow of userFollows) {
        try {
          const followerId = follow.followerId?.Id || follow.followerId;
          const user = await UserService.getById(followerId);
          if (user) {
            followerUsers.push({
              ...user,
              followedAt: follow.createdAt
            });
          }
        } catch (error) {
          console.warn(`Failed to load follower user ${follow.followerId}:`, error);
        }
      }
      
      return followerUsers;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching followers:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getFollowing(userId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "followerId" } },
          { field: { Name: "followingId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "createdAt" } }
        ],
        where: [
          {
            FieldName: "followerId",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('follow', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const userFollows = response.data;
      const followingUsers = [];

      for (const follow of userFollows) {
        try {
          const followingId = follow.followingId?.Id || follow.followingId;
          const user = await UserService.getById(followingId);
          if (user) {
            followingUsers.push({
              ...user,
              followedAt: follow.createdAt
            });
          }
        } catch (error) {
          console.warn(`Failed to load following user ${follow.followingId}:`, error);
        }
      }
      
      return followingUsers;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching following:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async isFollowing(followerId, followingId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Id" } }
        ],
        where: [
          {
            FieldName: "followerId",
            Operator: "EqualTo",
            Values: [parseInt(followerId)]
          },
          {
            FieldName: "followingId",
            Operator: "EqualTo",
            Values: [parseInt(followingId)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('follow', params);

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      return response.data.length > 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error checking follow status:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  },

  async follow(followerId, followingId) {
    try {
      // Check if already following
      const isAlreadyFollowing = await this.isFollowing(followerId, followingId);
      
      if (isAlreadyFollowing) {
        throw new Error("Already following this user");
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: `Follow from ${followerId} to ${followingId}`,
            followerId: parseInt(followerId),
            followingId: parseInt(followingId),
            createdAt: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('follow', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulCreations = response.results.filter(result => result.success);
        const failedCreations = response.results.filter(result => !result.success);
        
        if (failedCreations.length > 0) {
          console.error(`Failed to create follow ${failedCreations.length} records:${JSON.stringify(failedCreations)}`);
          
          failedCreations.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulCreations.length > 0) {
          const newFollow = successfulCreations[0].data;

          // Update user follower counts
          try {
            const [followerUser, followingUser] = await Promise.all([
              UserService.getById(followerId),
              UserService.getById(followingId)
            ]);

            if (followerUser) {
              await UserService.update(followerId, {
                followingCount: followerUser.followingCount + 1
              });
            }

            if (followingUser) {
              await UserService.update(followingId, {
                followerCount: followingUser.followerCount + 1
              });
            }

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
          } catch (error) {
            console.error('Failed to update user counts or create notification:', error);
          }

          return {
            ...newFollow,
            id: newFollow.Id.toString()
          };
        }
      }

      throw new Error("Follow creation failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating follow:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async unfollow(followerId, followingId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // First find the follow record
      const fetchParams = {
        fields: [
          { field: { Name: "Id" } }
        ],
        where: [
          {
            FieldName: "followerId",
            Operator: "EqualTo",
            Values: [parseInt(followerId)]
          },
          {
            FieldName: "followingId",
            Operator: "EqualTo",
            Values: [parseInt(followingId)]
          }
        ]
      };

      const fetchResponse = await apperClient.fetchRecords('follow', fetchParams);

      if (!fetchResponse.success) {
        console.error(fetchResponse.message);
        throw new Error(fetchResponse.message);
      }

      if (fetchResponse.data.length === 0) {
        throw new Error("Not following this user");
      }

      const followRecord = fetchResponse.data[0];

      // Delete the follow record
      const deleteParams = {
        RecordIds: [followRecord.Id]
      };

      const deleteResponse = await apperClient.deleteRecord('follow', deleteParams);

      if (!deleteResponse.success) {
        console.error(deleteResponse.message);
        toast.error(deleteResponse.message);
        throw new Error(deleteResponse.message);
      }

      if (deleteResponse.results) {
        const successfulDeletions = deleteResponse.results.filter(result => result.success);
        const failedDeletions = deleteResponse.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete follow ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulDeletions.length > 0) {
          // Update user follower counts
          try {
            const [followerUser, followingUser] = await Promise.all([
              UserService.getById(followerId),
              UserService.getById(followingId)
            ]);

            if (followerUser) {
              await UserService.update(followerId, {
                followingCount: Math.max(0, followerUser.followingCount - 1)
              });
            }

            if (followingUser) {
              await UserService.update(followingId, {
                followerCount: Math.max(0, followingUser.followerCount - 1)
              });
            }
          } catch (error) {
            console.error('Failed to update user counts:', error);
          }

          return { success: true };
        }
      }

      return { success: false };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error unfollowing user:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getMutualFollows(userId1, userId2) {
    try {
      const [user1Following, user2Following] = await Promise.all([
        this.getFollowing(userId1),
        this.getFollowing(userId2)
      ]);
      
      const mutualFollows = user1Following.filter(user1Follow =>
        user2Following.some(user2Follow => user2Follow.id === user1Follow.id)
      );
      
      return mutualFollows;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching mutual follows:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getSuggestions(userId) {
    try {
      const [allUsers, currentUserFollowing] = await Promise.all([
        UserService.getAll(),
        this.getFollowing(userId)
      ]);

      const followingIds = currentUserFollowing.map(u => u.id);
      
      // Get users not currently followed
      const suggestions = allUsers
        .filter(user => 
          user.Id !== parseInt(userId) && 
          !followingIds.includes(user.Id.toString())
        )
        .slice(0, 5);
      
      return suggestions;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching follow suggestions:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
};