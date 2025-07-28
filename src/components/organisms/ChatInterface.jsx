import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { MessageService } from '@/services/api/messageService';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import MessageBubble from '@/components/atoms/MessageBubble';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';

const ChatInterface = ({ conversation, currentUserId, onSendMessage, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

useEffect(() => {
    if (conversation?.Id) {
      loadMessages();
    }
  }, [conversation?.Id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MessageService.getMessages(currentUserId, conversation.Id);
      setMessages(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) return;

    const content = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const newMessage = await MessageService.sendMessage(currentUserId, conversation.Id, content);
      setMessages(prev => [...prev, newMessage]);
      onSendMessage(content);
    } catch (err) {
      toast.error('Failed to send message');
      setMessageText(content); // Restore the message text
    } finally {
      setSending(false);
    }
  };

const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!sending && messageText.trim()) {
        handleSendMessage(e);
      }
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </button>
          
          <Avatar
            src={conversation.partner.avatarUrl}
            alt={conversation.partner.displayName}
            fallback={conversation.partner.displayName}
            size="md"
          />
          
          <div>
            <h2 className="font-semibold text-gray-900">
              {conversation.partner.displayName}
            </h2>
            <p className="text-sm text-gray-500">
              @{conversation.partner.username}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ApperIcon name="Phone" size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ApperIcon name="Video" size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ApperIcon name="MoreVertical" size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <Loading />
        ) : error ? (
          <Error message={error} onRetry={loadMessages} />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ApperIcon name="MessageCircle" className="text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No messages yet
            </h3>
            <p className="text-gray-500 text-sm">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.Id}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
                partner={conversation.partner}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              variant="message"
              className="resize-none"
            />
          </div>
          
          <Button
            type="submit"
            disabled={!messageText.trim() || sending}
            size="md"
            className="flex-shrink-0"
          >
            {sending ? (
              <ApperIcon name="Loader2" className="animate-spin" size={16} />
            ) : (
              <ApperIcon name="Send" size={16} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;