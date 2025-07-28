import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import { MessageService } from '@/services/api/messageService';
import { cn } from '@/utils/cn';

const MessageInbox = ({ 
  conversations, 
  selectedConversation, 
  onConversationSelect, 
  currentUserId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await MessageService.searchConversations(currentUserId, query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const displayConversations = searchQuery.trim() ? searchResults : conversations;

  const formatLastMessage = (message, partnerId) => {
    if (!message) return '';
    
    const isFromCurrentUser = message.senderId === currentUserId;
    const prefix = isFromCurrentUser ? 'You: ' : '';
    const content = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;
    
    return prefix + content;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ApperIcon name="Edit" size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            variant="search"
          />
          <ApperIcon 
            name="Search" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={16} 
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin">
                <ApperIcon name="Loader2" size={16} />
              </div>
              <span className="text-sm">Searching...</span>
            </div>
          </div>
        ) : displayConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <ApperIcon name="MessageCircle" className="text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery 
                ? 'Try searching with different keywords' 
                : 'Start a conversation with someone to see your messages here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayConversations.map((conversation) => (
              <button
                key={conversation.Id}
                onClick={() => onConversationSelect(conversation)}
                className={cn(
                  "w-full p-4 hover:bg-gray-50 transition-colors text-left",
                  selectedConversation?.Id === conversation.Id && "bg-primary/5 border-r-2 border-primary"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={conversation.partner.avatarUrl}
                      alt={conversation.partner.displayName}
                      fallback={conversation.partner.displayName}
                      size="md"
                    />
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="error" size="sm">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={cn(
                        "text-sm font-medium truncate",
                        conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                      )}>
                        {conversation.partner.displayName}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {conversation.lastMessage && formatDistanceToNow(
                          new Date(conversation.timestamp), 
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "text-sm truncate",
                      conversation.unreadCount > 0 
                        ? "text-gray-900 font-medium" 
                        : "text-gray-500"
                    )}>
                      {formatLastMessage(conversation.lastMessage, conversation.Id)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInbox;