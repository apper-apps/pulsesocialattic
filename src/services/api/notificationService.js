import { toast } from 'react-toastify';

export const NotificationService = {
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
          { field: { Name: "userId" } },
          { field: { Name: "fromUserId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "type" } },
          { field: { Name: "postId" } },
          { field: { Name: "commentId" } },
          { field: { Name: "message" } },
          { field: { Name: "isRead" } },
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

      const response = await apperClient.fetchRecords('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(notification => ({
        ...notification,
        id: notification.Id.toString(),
        fromUser: notification.fromUserId ? {
          id: notification.fromUserId.Id?.toString(),
          Name: notification.fromUserId.Name
        } : null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching notifications:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getUnreadCount(userId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Id" }, Function: "Count" }
        ],
        where: [
          {
            FieldName: "userId",
            Operator: "EqualTo",
            Values: [parseInt(userId)]
          },
          {
            FieldName: "isRead",
            Operator: "EqualTo",
            Values: [false]
          }
        ]
      };

      const response = await apperClient.fetchRecords('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        return 0;
      }

      return response.data.length;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching unread count:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return 0;
    }
  },

  async markAsRead(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Id: parseInt(id),
            isRead: true
          }
        ]
      };

      const response = await apperClient.updateRecord('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to mark notification as read ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const updatedNotification = successfulUpdates[0].data;
          return {
            ...updatedNotification,
            id: updatedNotification.Id.toString()
          };
        }
      }

      throw new Error("Mark as read failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error marking notification as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async markAllAsRead(userId) {
    try {
      // First get all unread notifications for the user
      const notifications = await this.getByUserId(userId);
      const unreadNotifications = notifications.filter(n => !n.isRead);

      if (unreadNotifications.length === 0) {
        return [];
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: unreadNotifications.map(notification => ({
          Id: parseInt(notification.id),
          isRead: true
        }))
      };

      const response = await apperClient.updateRecord('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to mark all notifications as read ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        return successfulUpdates.map(result => ({
          ...result.data,
          id: result.data.Id.toString()
        }));
      }

      return [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error marking all notifications as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async create(notificationData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: notificationData.message || "New Notification",
            userId: parseInt(notificationData.userId),
            fromUserId: parseInt(notificationData.fromUserId),
            type: notificationData.type,
            postId: notificationData.postId ? parseInt(notificationData.postId) : null,
            commentId: notificationData.commentId ? parseInt(notificationData.commentId) : null,
            message: notificationData.message,
            isRead: false,
            createdAt: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulCreations = response.results.filter(result => result.success);
        const failedCreations = response.results.filter(result => !result.success);
        
        if (failedCreations.length > 0) {
          console.error(`Failed to create notification ${failedCreations.length} records:${JSON.stringify(failedCreations)}`);
          
          failedCreations.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulCreations.length > 0) {
          const newNotification = successfulCreations[0].data;
          return {
            ...newNotification,
            id: newNotification.Id.toString()
          };
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating notification:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
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

      const response = await apperClient.deleteRecord('app_Notification', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete notification ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting notification:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
};