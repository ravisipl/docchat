import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Spin, Space, message } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import chatService, { ChatMessage, Citation } from '../../services/chatService';
import './ChatInterface.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Message {
  id: string | number;
  text: string;
  isUser: boolean;
  citations?: Citation[];
  isLoading?: boolean;
  timestamp?: string;
}

interface ChatInterfaceProps {
  chatId?: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | undefined>(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<TextAreaRef>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts or chatId changes
  useEffect(() => {
    if (currentChatId) {
      loadChatHistory(currentChatId);
    }
  }, [currentChatId]);

  const loadChatHistory = async (chatId: number) => {
    try {
      const history = await chatService.getChatHistory(chatId);
      const formattedMessages: any[] = [];
      history.messages.forEach((msg: any, idx: number) => {
        formattedMessages.push({
          id: `${msg.created_at}-user-${idx}`,
          text: msg.query,
          isUser: true,
          timestamp: msg.created_at,
        });
        formattedMessages.push({
          id: `${msg.created_at}-bot-${idx}`,
          text: msg.answer,
          isUser: false,
          timestamp: msg.created_at,
          citations: msg.citations,
        });
      });
      console.log('Formatted messages:', formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      message.error('Failed to load chat history');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const loadingMessage: Message = {
      id: 'loading',
      text: '',
      isUser: false,
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await chatService.createChat();
        setCurrentChatId(chatId);
      }
      const response = await chatService.sendMessage(chatId, input);
      
      // Remove loading message and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'loading');
        return [...filtered, {
          id: response.message_id || Date.now(),
          text: response.answer,
          isUser: false,
          citations: response.citations,
          timestamp: new Date().toISOString()
        }];
      });

      // Update current chat ID if this is a new chat
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
      
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'loading');
        return [...filtered, {
          id: Date.now(),
          text: "Sorry, there was an error processing your request. Please try again.",
          isUser: false,
          timestamp: new Date().toISOString()
        }];
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatCitations = (citations: Citation[]) => {
    return citations.map(citation => 
      `${citation.source} (Page ${citation.page})`
    ).join(', ');
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="welcome-container">
          <Title level={2}>Welcome to DocChat</Title>
          <Text type="secondary">Ask questions about your uploaded documents</Text>
        </div>
      ) : (
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.isUser ? 'user' : 'assistant'}`}
            >
              <div className="message-content">
                {message.isLoading ? (
                  <Space size="middle">
                    <Spin indicator={<LoadingOutlined spin />} />
                    <Text type="secondary">Processing your request...</Text>
                  </Space>
                ) : (
                  <>
                    <Text className="message-text">
                      {message.text}
                    </Text>
                    {message.citations && message.citations.length > 0 && (
                      <div className="message-citations">
                        Sources: {formatCitations(message.citations)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-container">
        <div className="input-wrapper">
          <TextArea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="chat-input"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="send-button"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 