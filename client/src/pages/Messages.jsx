import { useState, useEffect, useRef } from 'react';
import { Mail, Send, Search, MoreVertical, X, Trash2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { DEFAULT_AVATAR } from '../lib/constants';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { getSocket } from '../lib/socket';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Setup Socket.IO listeners
    const socket = getSocket();
    if (socket) {
      socket.on('new-message', handleNewMessage);
      socket.on('user-typing', handleUserTyping);
      socket.on('user-stop-typing', handleUserStopTyping);
    }

    return () => {
      if (socket) {
        socket.off('new-message', handleNewMessage);
        socket.off('user-typing', handleUserTyping);
        socket.off('user-stop-typing', handleUserStopTyping);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      // Debounce search by 500ms
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers();
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = (data) => {
    const { conversationId, message } = data;
    
    // Update messages if this conversation is currently selected
    if (selectedConversation?._id === conversationId) {
      setMessages(prev => [...prev, message]);
    }
    
    // Update conversations list to show new message
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv._id === conversationId) {
          return { ...conv, lastMessage: message, updatedAt: message.createdAt };
        }
        return conv;
      });
      // Sort by most recent
      return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const handleUserTyping = (data) => {
    const { userId, conversationId } = data;
    if (selectedConversation?._id === conversationId) {
      setTypingUsers(prev => new Set(prev).add(userId));
    }
  };

  const handleUserStopTyping = (data) => {
    const { userId, conversationId } = data;
    if (selectedConversation?._id === conversationId) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !selectedConversation) return;

    const otherParticipant = selectedConversation.participants.find(
      p => p._id !== selectedConversation.currentUserId
    );

    socket.emit('typing', {
      recipientId: otherParticipant._id,
      conversationId: selectedConversation._id
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', {
        recipientId: otherParticipant._id,
        conversationId: selectedConversation._id
      });
    }, 2000);
  };

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const searchUsers = async () => {
    setIsSearching(true);
    try {
      const { data } = await api.get(`/search/users?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      const { data } = await api.post('/messages/conversations', {
        participantId: userId
      });
      
      // Add to conversations list if it's new
      const existingConv = conversations.find(c => c._id === data.conversation._id);
      if (!existingConv) {
        setConversations([data.conversation, ...conversations]);
      }
      
      // Select the conversation
      setSelectedConversation(data.conversation);
      setShowNewMessageModal(false);
      setSearchQuery('');
      setSearchResults([]);
      toast.success('Conversation started!');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { data } = await api.post(
        `/messages/conversations/${selectedConversation._id}/messages`,
        { content: newMessage }
      );
      setMessages([...messages, data.message]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await api.delete(`/messages/conversations/${conversationToDelete._id}`);
      
      // Remove from conversations list
      setConversations(conversations.filter(c => c._id !== conversationToDelete._id));
      
      // Clear selection if deleted conversation was selected
      if (selectedConversation?._id === conversationToDelete._id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
      setShowDeleteModal(false);
      setConversationToDelete(null);
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const confirmDelete = (conversation, e) => {
    e.stopPropagation(); // Prevent selecting the conversation
    setConversationToDelete(conversation);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div className="w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              title="New message"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Direct Messages"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Mail className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="btn-primary mt-4"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(
                p => p._id !== conversation.currentUserId
              );
              return (
                <div
                  key={conversation._id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${
                    selectedConversation?._id === conversation._id ? 'bg-gray-50 dark:bg-gray-900' : ''
                  }`}
                >
                  <div 
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="relative">
                      <img
                        src={otherParticipant?.avatar?.url || DEFAULT_AVATAR}
                        alt={otherParticipant?.displayName}
                        className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                      {/* Online status indicator - can be enhanced with real online status */}
                      {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full"></div> */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold truncate">{otherParticipant?.displayName}</span>
                          {otherParticipant?.isVerified && (
                            <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {conversation.lastMessage && formatDate(conversation.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage?.content || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => confirmDelete(conversation, e)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.participants
                  .filter(p => p._id !== selectedConversation.currentUserId)
                  .map(participant => (
                    <div key={participant._id} className="flex items-center gap-3">
                      <img
                        src={participant.avatar?.url || DEFAULT_AVATAR}
                        alt={participant.displayName}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div>
                        <h2 className="font-bold">{participant.displayName}</h2>
                        <p className="text-sm text-gray-500">@{participant.username}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender._id === selectedConversation.currentUserId;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      <img
                        src={message.sender.avatar?.url || DEFAULT_AVATAR}
                        alt={message.sender.displayName}
                        className="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span>typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Start a new message"
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Mail className="w-24 h-24 text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Select a message</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              Choose from your existing conversations or start a new one
            </p>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold">New Message</h2>
              <button
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search people"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleStartConversation(user._id)}
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-800"
                    >
                      <img
                        src={user.avatar?.url || DEFAULT_AVATAR}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold truncate">{user.displayName}</span>
                          {user.isVerified && (
                            <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                        {user.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Search for people to start a conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Delete Conversation</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this conversation with{' '}
              <span className="font-bold">
                {conversationToDelete?.participants.find(
                  p => p._id !== conversationToDelete.currentUserId
                )?.displayName}
              </span>
              ? All messages will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConversationToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
