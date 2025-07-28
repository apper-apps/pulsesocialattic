import notifications from "@/services/mockData/notifications.json";
import users from "@/services/mockData/users.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function enrichNotificationWithUser(notification) {
  const fromUser = users.find(u => u.Id === notification.fromUserId);
  return {
    ...notification,
    id: notification.Id.toString(),
    fromUser: fromUser ? {
      ...fromUser,
      id: fromUser.Id.toString()
    } : null
  };
}

export const NotificationService = {
  async getByUserId(userId) {
    await delay(300);
    const userNotifications = notifications
      .filter(n => n.userId === parseInt(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return userNotifications.map(enrichNotificationWithUser);
  },

  async getUnreadCount(userId) {
    await delay(200);
    const unreadCount = notifications.filter(n => 
      n.userId === parseInt(userId) && !n.isRead
    ).length;
    
    return unreadCount;
  },

  async markAsRead(id) {
    await delay(200);
    const notificationIndex = notifications.findIndex(n => n.Id === parseInt(id));
    if (notificationIndex === -1) {
      throw new Error("Notification not found");
    }
    
    notifications[notificationIndex].isRead = true;
    return enrichNotificationWithUser(notifications[notificationIndex]);
  },

  async markAllAsRead(userId) {
    await delay(300);
    const userNotifications = notifications.filter(n => n.userId === parseInt(userId));
    userNotifications.forEach(notification => {
      notification.isRead = true;
    });
    
    return userNotifications.map(enrichNotificationWithUser);
  },

  async create(notificationData) {
    await delay(200);
    
    const newNotification = {
      Id: Math.max(...notifications.map(n => n.Id)) + 1,
      userId: parseInt(notificationData.userId),
      fromUserId: parseInt(notificationData.fromUserId),
      type: notificationData.type,
      postId: notificationData.postId ? parseInt(notificationData.postId) : null,
      commentId: notificationData.commentId ? parseInt(notificationData.commentId) : null,
      message: notificationData.message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    return enrichNotificationWithUser(newNotification);
  },

  async delete(id) {
    await delay(200);
    const notificationIndex = notifications.findIndex(n => n.Id === parseInt(id));
    if (notificationIndex === -1) {
      throw new Error("Notification not found");
    }
    
    const deletedNotification = notifications.splice(notificationIndex, 1)[0];
    return enrichNotificationWithUser(deletedNotification);
  }
};