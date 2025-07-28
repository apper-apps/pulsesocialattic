import { toast } from 'react-toastify';
import { NotificationService } from "./notificationService";
import { PostService } from "./postService";
import { UserService } from "./userService";

export const CommentService = {
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
          { field: { Name: "postId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "userId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "parentId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "createdAt" } }
        ],
        orderBy: [
          {
            fieldName: "createdAt",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('app_Comment', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(comment => ({
        ...comment,
        id: comment.Id.toString(),
        user: comment.userId ? {
          id: comment.userId.Id?.toString(),
          Name: comment.userId.Name
        } : null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching comments:", error?.response?.data?.message);
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
          { field: { Name: "postId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "userId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "parentId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "createdAt" } }
        ]
      };

      const response = await apperClient.getRecordById('app_Comment', parseInt(id), params);

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
        console.error(`Error fetching comment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getByPostId(postId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "postId" } },
          { field: { Name: "userId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "parentId" } },
          { field: { Name: "createdAt" } }
        ],
        where: [
          {
            FieldName: "postId",
            Operator: "EqualTo",
            Values: [parseInt(postId)]
          }
        ],
        orderBy: [
          {
            fieldName: "createdAt",
            sorttype: "ASC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('app_Comment', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(comment => ({
        ...comment,
        id: comment.Id.toString(),
        user: comment.userId ? {
          id: comment.userId.Id?.toString(),
          Name: comment.userId.Name
        } : null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching comments by post ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(commentData) {
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
            Name: commentData.content?.substring(0, 50) || "New Comment",
            postId: parseInt(commentData.postId),
            userId: parseInt(currentUser.Id),
            content: commentData.content,
            parentId: commentData.parentId ? parseInt(commentData.parentId) : null,
            createdAt: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('app_Comment', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulCreations = response.results.filter(result => result.success);
        const failedCreations = response.results.filter(result => !result.success);
        
        if (failedCreations.length > 0) {
          console.error(`Failed to create comment ${failedCreations.length} records:${JSON.stringify(failedCreations)}`);
          
          failedCreations.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulCreations.length > 0) {
          const newComment = successfulCreations[0].data;

          // Create notification for comment
          try {
            const post = await PostService.getById(commentData.postId);
            if (post && post.userId !== currentUser.Id.toString()) { // Don't notify self
              if (currentUser) {
                await NotificationService.create({
                  userId: parseInt(post.userId),
                  fromUserId: parseInt(currentUser.Id),
                  type: 'comment',
                  postId: parseInt(commentData.postId),
                  commentId: newComment.Id,
                  message: `${currentUser.displayName} commented on your post`
                });
              }
            }
          } catch (error) {
            console.error('Failed to create comment notification:', error);
          }

          return {
            ...newComment,
            id: newComment.Id.toString(),
            user: currentUser
          };
        }
      }

      throw new Error("Comment creation failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating comment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, commentData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include updateable fields
      const updateData = {};
      if (commentData.Name !== undefined) updateData.Name = commentData.Name;
      if (commentData.content !== undefined) updateData.content = commentData.content;

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...updateData
          }
        ]
      };

      const response = await apperClient.updateRecord('app_Comment', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update comment ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const updatedComment = successfulUpdates[0].data;
          const commentWithUser = await this.getById(id);
          return commentWithUser;
        }
      }

      throw new Error("Comment update failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating comment:", error?.response?.data?.message);
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

      // First get all replies to this comment
      const replies = await this.getReplies(id);
      const allIdsToDelete = [parseInt(id), ...replies.map(reply => parseInt(reply.id))];

      const params = {
        RecordIds: allIdsToDelete
      };

      const response = await apperClient.deleteRecord('app_Comment', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete comment ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting comment:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  },

  async getReplies(parentId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "postId" } },
          { field: { Name: "userId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "parentId" } },
          { field: { Name: "createdAt" } }
        ],
        where: [
          {
            FieldName: "parentId",
            Operator: "EqualTo",
            Values: [parseInt(parentId)]
          }
        ],
        orderBy: [
          {
            fieldName: "createdAt",
            sorttype: "ASC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('app_Comment', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(comment => ({
        ...comment,
        id: comment.Id.toString(),
        user: comment.userId ? {
          id: comment.userId.Id?.toString(),
          Name: comment.userId.Name
        } : null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching comment replies:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
};