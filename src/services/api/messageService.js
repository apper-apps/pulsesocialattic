import { toast } from 'react-toastify';
import { UserService } from './userService';
import messagesData from '../mockData/messages.json';

let messages = [...messagesData];
let nextId = Math.max(...messages.map(msg => msg.Id), 0) + 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const MessageService = {
  // Get all conversations for a user
  async getConversations(userId) {
    await delay(300);
    
    if (!userId || typeof userId !== 'number') {
      throw new Error('Valid user ID is required');
    }

    // Get all messages involving the user
    const userMessages = messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );

    // Group messages by conversation partner
    const conversationMap = new Map();
    
    userMessages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
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
      if (message.receiverId === userId && !message.read) {
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
  },

  // Get messages between two users
  async getMessages(userId, partnerId) {
    await delay(200);
    
    if (!userId || !partnerId || typeof userId !== 'number' || typeof partnerId !== 'number') {
      throw new Error('Valid user IDs are required');
    }

    const conversationMessages = messages
      .filter(msg => 
        (msg.senderId === userId && msg.receiverId === partnerId) ||
        (msg.senderId === partnerId && msg.receiverId === userId)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return conversationMessages.map(msg => ({ ...msg }));
  },

  // Send a new message
  async sendMessage(senderId, receiverId, content) {
    await delay(500);
    
    if (!senderId || !receiverId || typeof senderId !== 'number' || typeof receiverId !== 'number') {
      throw new Error('Valid sender and receiver IDs are required');
    }
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Message content is required');
    }

    // Verify users exist
    await UserService.getById(senderId);
    await UserService.getById(receiverId);

    const newMessage = {
      Id: nextId++,
      senderId,
      receiverId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    messages.push(newMessage);
    toast.success('Message sent successfully');
    return { ...newMessage };
  },

  // Mark messages as read
  async markAsRead(userId, partnerId) {
    await delay(100);
    
    if (!userId || !partnerId || typeof userId !== 'number' || typeof partnerId !== 'number') {
      throw new Error('Valid user IDs are required');
    }

    const updatedCount = messages.reduce((count, message) => {
      if (message.senderId === partnerId && message.receiverId === userId && !message.read) {
        message.read = true;
        return count + 1;
      }
      return count;
    }, 0);

    return updatedCount;
  },

  // Search conversations
  async searchConversations(userId, query) {
    await delay(200);
    
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
  }
};