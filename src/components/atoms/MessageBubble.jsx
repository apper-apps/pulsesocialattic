import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import Avatar from '@/components/atoms/Avatar';
import { cn } from '@/utils/cn';

const MessageBubble = ({ message, isOwnMessage, partner }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  return (
    <div className={cn(
      "flex items-end space-x-2 max-w-[80%]",
      isOwnMessage ? "ml-auto flex-row-reverse space-x-reverse" : ""
    )}>
      {!isOwnMessage && (
        <Avatar
          src={partner?.avatarUrl}
          alt={partner?.displayName}
          fallback={partner?.displayName}
          size="sm"
          className="flex-shrink-0"
        />
      )}
      
      <div className={cn(
        "flex flex-col",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2 rounded-2xl max-w-md break-words",
          isOwnMessage
            ? "bg-primary text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        
        <div className={cn(
          "flex items-center mt-1 text-xs text-gray-500",
          isOwnMessage ? "flex-row-reverse" : ""
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {isOwnMessage && (
            <span className="ml-2">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;