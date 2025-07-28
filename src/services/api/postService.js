import { toast } from 'react-toastify';
import { NotificationService } from "./notificationService";
import { UserService } from "./userService";

export const PostService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "userId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "likeCount" } },
          { field: { Name: "commentCount" } },
          { field: { Name: "privacy" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "createdAt" } }
        ],
        orderBy: [
          {
            fieldName: "createdAt",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('post', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(post => ({
        ...post,
        id: post.Id.toString(),
        user: post.userId ? {
          id: post.userId.Id?.toString(),
          Name: post.userId.Name
        } : null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getFeed() {
    try {
      // For now, return all posts - in real app would filter by followed users
      return await this.getAll();
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching feed:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "userId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "likeCount" } },
          { field: { Name: "commentCount" } },
          { field: { Name: "privacy" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "createdAt" } }
        ]
      };

      const response = await apperClient.getRecordById('post', parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return {
        ...response.data,
        id: response.data.Id.toString(),
        user: response.data.userId ? {
          id: response.data.userId.Id?.toString(),
          Name: response.data.userId.Name
        } : null
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching post with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getByUserId(userId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "userId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "imageUrl" } },
          { field: { Name: "likeCount" } },
          { field: { Name: "commentCount" } },
          { field: { Name: "privacy" } },
          { field: { Name: "isLiked" } },
          { field: { Name: "createdAt" } }
        ],
        where: [
          {
            FieldName: "userId",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          }
        ],
        orderBy: [
          {
            fieldName: "createdAt",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('post', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(post => ({
        ...post,
        id: post.Id.toString(),
        user: post.userId ? {
          id: post.userId.Id?.toString(),
          Name: post.userId.Name
        } : null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user posts:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(postData) {
    try {
      const currentUser = await UserService.getCurrentUser();

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: postData.content?.substring(0, 50) || "New Post",
            userId: parseInt(currentUser.Id),
            content: postData.content,
            imageUrl: postData.imageUrl || null,
            likeCount: 0,
            commentCount: 0,
            privacy: postData.privacy || "public",
            isLiked: false,
            createdAt: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('post', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulCreations = response.results.filter(result => result.success);
        const failedCreations = response.results.filter(result => !result.success);
        
        if (failedCreations.length > 0) {
          console.error(`Failed to create post ${failedCreations.length} records:${JSON.stringify(failedCreations)}`);
          
          failedCreations.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulCreations.length > 0) {
          const newPost = successfulCreations[0].data;
          return {
            ...newPost,
            id: newPost.Id.toString(),
            user: currentUser
          };
        }
      }

      throw new Error("Post creation failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, postData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include updateable fields
      const updateData = {};
      if (postData.Name !== undefined) updateData.Name = postData.Name;
      if (postData.content !== undefined) updateData.content = postData.content;
      if (postData.imageUrl !== undefined) updateData.imageUrl = postData.imageUrl;
      if (postData.likeCount !== undefined) updateData.likeCount = postData.likeCount;
      if (postData.commentCount !== undefined) updateData.commentCount = postData.commentCount;
      if (postData.privacy !== undefined) updateData.privacy = postData.privacy;
      if (postData.isLiked !== undefined) updateData.isLiked = postData.isLiked;

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...updateData
          }
        ]
      };

      const response = await apperClient.updateRecord('post', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update post ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const updatedPost = successfulUpdates[0].data;
          const postWithUser = await this.getById(id);
          return postWithUser;
        }
      }

      throw new Error("Post update failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('post', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete post ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting post:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  },

  async toggleLike(id, isLiked) {
    try {
      // First get the current post to update the like count
      const currentPost = await this.getById(id);
      
      const newLikeCount = isLiked 
        ? currentPost.likeCount + 1 
        : Math.max(0, currentPost.likeCount - 1);

      // Update the post with new like status
      const updatedPost = await this.update(id, {
        likeCount: newLikeCount,
        isLiked: isLiked
      });

      // Create notification for like (only if liking, not unliking)
      if (isLiked && currentPost.userId && currentPost.userId !== '1') { // Don't notify self
        try {
          const currentUser = await UserService.getCurrentUser();
          
          if (currentUser) {
            await NotificationService.create({
              userId: parseInt(currentPost.userId),
              fromUserId: parseInt(currentUser.Id),
              type: 'like',
              postId: parseInt(id),
              message: `${currentUser.displayName} liked your post`
            });
          }
        } catch (error) {
          console.error('Failed to create like notification:', error);
        }
      }

      return updatedPost;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error toggling like:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};