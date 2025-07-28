import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MessageService } from '@/services/api/messageService';
import MessageInbox from '@/components/molecules/MessageInbox';
import ChatInterface from '@/components/organisms/ChatInterface';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentUserId = 1; // In a real app, this would come from auth context

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.Id === parseInt(conversationId));
      if (conversation) {
        setSelectedConversation(conversation);
        markConversationAsRead(conversation.Id);
      }
    }
  }, [conversationId, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MessageService.getConversations(currentUserId);
      setConversations(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messages/${conversation.Id}`);
    markConversationAsRead(conversation.Id);
  };

  const markConversationAsRead = async (partnerId) => {
    try {
      await MessageService.markAsRead(currentUserId, partnerId);
      // Update local conversation state
      setConversations(prev => prev.map(conv => 
        conv.Id === partnerId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedConversation) return;
    
    try {
      await MessageService.sendMessage(currentUserId, selectedConversation.Id, content);
      // Refresh conversations to update last message
      loadConversations();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleBackToInbox = () => {
    setSelectedConversation(null);
    navigate('/messages');
  };

  if (loading) return <Loading />;
if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadConversations} />;

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Inbox Sidebar - Hidden on mobile when conversation is selected */}
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-72 border-r border-gray-200`}>
        <MessageInbox
          selectedConversation={selectedConversation}
          onConversationSelect={handleConversationSelect}
          currentUserId={currentUserId}
        />
      </div>

      {/* Chat Interface */}
      <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
            onBack={handleBackToInbox}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <Empty
              title="No conversation selected"
              description="Choose a conversation from the inbox to start chatting"
              icon="MessageCircle"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;