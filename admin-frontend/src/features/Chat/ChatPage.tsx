import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';

const ChatPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    localStorage.getItem('selectedChatId') || null
  );
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem('selectedChatId', selectedChatId);
    }
  }, [selectedChatId]);

  return (
    <div style={{ height: '100vh' }}>
      <ChatWindow chatId={selectedChatId} messages={messages} />
    </div>
  );
};

export default ChatPage; 