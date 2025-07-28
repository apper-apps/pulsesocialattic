import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

export const UserService = {
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
          { field: { Name: "username" } },
          { field: { Name: "displayName" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatarUrl" } },
          { field: { Name: "followerCount" } },
          { field: { Name: "followingCount" } },
          { field: { Name: "postCount" } },
          { field: { Name: "isPrivate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "email" } }
        ]
      };

      const response = await apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data.map(user => ({
        ...user,
        id: user.Id.toString()
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching users:", error?.response?.data?.message);
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
          { field: { Name: "username" } },
          { field: { Name: "displayName" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatarUrl" } },
          { field: { Name: "followerCount" } },
          { field: { Name: "followingCount" } },
          { field: { Name: "postCount" } },
          { field: { Name: "isPrivate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "email" } }
        ]
      };

      const response = await apperClient.getRecordById('app_User', parseInt(id), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return {
        ...response.data,
        id: response.data.Id.toString()
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching user with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getByUsername(username) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "displayName" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatarUrl" } },
          { field: { Name: "followerCount" } },
          { field: { Name: "followingCount" } },
          { field: { Name: "postCount" } },
          { field: { Name: "isPrivate" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "email" } }
        ],
        where: [
          {
            FieldName: "username",
            Operator: "EqualTo",
            Values: [username]
          }
        ]
      };

      const response = await apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("User not found");
      }

      const user = response.data[0];
      return {
        ...user,
        id: user.Id.toString()
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user by username:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      // Get current user from ApperUI - this should be implemented when auth is ready
      // For now, return first user as mock
      const users = await this.getAll();
      if (users.length > 0) {
        return users[0];
      }
      throw new Error("No users found");
    } catch (error) {
      console.error("Error getting current user:", error.message);
      throw error;
    }
  },

  async update(id, userData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Only include updateable fields
      const updateData = {};
      if (userData.Name !== undefined) updateData.Name = userData.Name;
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.displayName !== undefined) updateData.displayName = userData.displayName;
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.avatarUrl !== undefined) updateData.avatarUrl = userData.avatarUrl;
      if (userData.followerCount !== undefined) updateData.followerCount = userData.followerCount;
      if (userData.followingCount !== undefined) updateData.followingCount = userData.followingCount;
      if (userData.postCount !== undefined) updateData.postCount = userData.postCount;
      if (userData.isPrivate !== undefined) updateData.isPrivate = userData.isPrivate;
      if (userData.email !== undefined) updateData.email = userData.email;

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...updateData
          }
        ]
      };

      const response = await apperClient.updateRecord('app_User', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update user ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const updatedUser = successfulUpdates[0].data;
          return {
            ...updatedUser,
            id: updatedUser.Id.toString()
          };
        }
      }

      throw new Error("Update failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating user:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async search(query) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "username" } },
          { field: { Name: "displayName" } },
          { field: { Name: "bio" } },
          { field: { Name: "avatarUrl" } },
          { field: { Name: "followerCount" } },
          { field: { Name: "followingCount" } },
          { field: { Name: "postCount" } },
          { field: { Name: "isPrivate" } },
          { field: { Name: "email" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "username",
                    operator: "Contains",
                    values: [query]
                  }
                ],
                operator: "OR"
              },
              {
                conditions: [
                  {
                    fieldName: "displayName",
                    operator: "Contains",
                    values: [query]
                  }
                ],
                operator: "OR"
              }
            ]
          }
        ]
      };

      const response = await apperClient.fetchRecords('app_User', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(user => ({
        ...user,
        id: user.Id.toString()
      }));
} catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching users:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
};