import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationDropdown = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return 'Heart';
      case 'comment':
        return 'MessageCircle';
      case 'follow':
        return 'UserPlus';
      default:
        return 'Bell';
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.postId) {
      return `/post/${notification.postId}`;
    }
    if (notification.type === 'follow' && notification.fromUser) {
      return `/profile/${notification.fromUser.username}`;
    }
    return '#';
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <ApperIcon name="Bell" className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs flex items-center justify-center p-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-primary hover:text-primary/80"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <ApperIcon name="Loader2" className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <ApperIcon name="Bell" className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={getNotificationLink(notification)}
                    onClick={() => {
                      handleNotificationClick(notification);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "block p-4 hover:bg-gray-50 transition-colors",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar
                          src={notification.fromUser?.avatarUrl}
                          alt={notification.fromUser?.displayName}
                          fallback={notification.fromUser?.displayName}
                          size="sm"
                        />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
                          notification.type === 'like' && "bg-red-100",
                          notification.type === 'comment' && "bg-blue-100",
                          notification.type === 'follow' && "bg-green-100"
                        )}>
                          <ApperIcon
                            name={getNotificationIcon(notification.type)}
                            className={cn(
                              "w-3 h-3",
                              notification.type === 'like' && "text-red-600",
                              notification.type === 'comment' && "text-blue-600",
                              notification.type === 'follow' && "text-green-600"
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          notification.isRead ? "text-gray-600" : "text-gray-900 font-medium"
                        )}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;