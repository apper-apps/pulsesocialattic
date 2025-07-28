import { toast } from 'react-toastify';
import { UserService } from './userService';

export const MessageService = {
  // Get all conversations for a user
  async getConversations(userId) {
    try {
      if (!userId || typeof userId !== 'number') {
        throw new Error('Valid user ID is required');
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "senderId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "receiverId" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "senderId",
                    operator: "EqualTo",
                    values: [userId]
                  }
                ],
                operator: "OR"
              },
              {
                conditions: [
                  {
                    fieldName: "receiverId",
                    operator: "EqualTo",
                    values: [userId]
                  }
                ],
                operator: "OR"
              }
            ]
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('message', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const messages = response.data;

      // Group messages by conversation partner
      const conversationMap = new Map();
      
      messages.forEach(message => {
        const senderId = message.senderId?.Id || message.senderId;
        const receiverId = message.receiverId?.Id || message.receiverId;
        const partnerId = senderId === userId ? receiverId : senderId;
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          });
        }
        
        const conversation = conversationMap.get(partnerId);
        conversation.messages.push(message);
        
        // Update last message
        if (!conversation.lastMessage || new Date(message.timestamp) > new Date(conversation.lastMessage.timestamp)) {
          conversation.lastMessage = message;
        }
        
        // Count unread messages from partner
        if (receiverId === userId && !message.read) {
          conversation.unreadCount++;
        }
      });

      // Convert to array and add user details
      const conversations = [];
      
      for (const [partnerId, conversation] of conversationMap) {
        try {
          const partner = await UserService.getById(partnerId);
          conversations.push({
            Id: partnerId,
            partner,
            lastMessage: conversation.lastMessage,
            unreadCount: conversation.unreadCount,
            timestamp: conversation.lastMessage.timestamp
          });
        } catch (error) {
          console.warn(`Failed to load user ${partnerId}:`, error);
        }
      }

      // Sort by most recent message
      conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return conversations;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching conversations:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  // Get messages between two users
  async getMessages(userId, partnerId) {
    try {
      if (!userId || !partnerId || typeof userId !== 'number' || typeof partnerId !== 'number') {
        throw new Error('Valid user IDs are required');
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "senderId" } },
          { field: { Name: "receiverId" } },
          { field: { Name: "content" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "read" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "senderId",
                    operator: "EqualTo",
                    values: [userId]
                  },
                  {
                    fieldName: "receiverId",
                    operator: "EqualTo",
                    values: [partnerId]
                  }
                ],
                operator: "AND"
              },
              {
                conditions: [
                  {
                    fieldName: "senderId",
                    operator: "EqualTo",
                    values: [partnerId]
                  },
                  {
                    fieldName: "receiverId",
                    operator: "EqualTo",
                    values: [userId]
                  }
                ],
                operator: "AND"
              }
            ]
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "ASC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('message', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data.map(msg => ({ ...msg }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching messages:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  // Send a new message
  async sendMessage(senderId, receiverId, content) {
    try {
      if (!senderId || !receiverId || typeof senderId !== 'number' || typeof receiverId !== 'number') {
        throw new Error('Valid sender and receiver IDs are required');
      }
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('Message content is required');
      }

      // Verify users exist
      await UserService.getById(senderId);
      await UserService.getById(receiverId);

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: `Message from ${senderId} to ${receiverId}`,
            senderId: parseInt(senderId),
            receiverId: parseInt(receiverId),
            content: content.trim(),
            timestamp: new Date().toISOString(),
            read: false
          }
        ]
      };

      const response = await apperClient.createRecord('message', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulCreations = response.results.filter(result => result.success);
        const failedCreations = response.results.filter(result => !result.success);
        
        if (failedCreations.length > 0) {
          console.error(`Failed to send message ${failedCreations.length} records:${JSON.stringify(failedCreations)}`);
          
          failedCreations.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulCreations.length > 0) {
          const newMessage = successfulCreations[0].data;
          toast.success('Message sent successfully');
          return { ...newMessage };
        }
      }

      throw new Error("Send message failed");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error sending message:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(userId, partnerId) {
    try {
      if (!userId || !partnerId || typeof userId !== 'number' || typeof partnerId !== 'number') {
        throw new Error('Valid user IDs are required');
      }

      // First get unread messages from partner to current user
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const fetchParams = {
        fields: [
          { field: { Name: "Id" } }
        ],
        where: [
          {
            FieldName: "senderId",
            Operator: "EqualTo",
            Values: [partnerId]
          },
          {
            FieldName: "receiverId",
            Operator: "EqualTo",
            Values: [userId]
          },
          {
            FieldName: "read",
            Operator: "EqualTo",
            Values: [false]
          }
        ]
      };

      const fetchResponse = await apperClient.fetchRecords('message', fetchParams);

      if (!fetchResponse.success) {
        console.error(fetchResponse.message);
        return 0;
      }

      const unreadMessages = fetchResponse.data;
      
      if (unreadMessages.length === 0) {
        return 0;
      }

      // Update all unread messages to read
      const updateParams = {
        records: unreadMessages.map(message => ({
          Id: message.Id,
          read: true
        }))
      };

      const updateResponse = await apperClient.updateRecord('message', updateParams);

      if (!updateResponse.success) {
        console.error(updateResponse.message);
        return 0;
      }

      if (updateResponse.results) {
        const successfulUpdates = updateResponse.results.filter(result => result.success);
        const failedUpdates = updateResponse.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to mark messages as read ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }

        return successfulUpdates.length;
      }

      return 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error marking messages as read:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return 0;
    }
  },

  // Search conversations
  async searchConversations(userId, query) {
    try {
      const conversations = await this.getConversations(userId);
      
      if (!query || query.trim().length === 0) {
        return conversations;
      }

      const searchTerm = query.toLowerCase().trim();
      
      return conversations.filter(conversation =>
        conversation.partner.displayName.toLowerCase().includes(searchTerm) ||
        conversation.partner.username.toLowerCase().includes(searchTerm) ||
        (conversation.lastMessage && conversation.lastMessage.content.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching conversations:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
};