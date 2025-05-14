import React, { useEffect, useRef, useState } from 'react';
import { List, Input, Button, Typography, Spin, Empty } from 'antd';
import chatService from '../../services/chatService';
import { ChatMessage } from './chatTypes';
import './ChatWindow.css';

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  chatId: string | null;
  messages?: any[];
}

const ChatWindow: React.FC<Props> = ({ chatId, messages: propMessages }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(propMessages || []);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propMessages) {
      console.log('propMessages', propMessages);
      console.log('chatId', chatId);
      setMessages(propMessages);
    }
  }, [propMessages]);

  useEffect(() => {
    if (chatId && !propMessages) {
      setLoading(true);
      chatService.getChatHistory(Number(chatId)).then(res => {
        // Map backend history to UI messages
        const allMsgs: ChatMessage[] = [];
        if (res && Array.isArray(res.messages)) {
          console.log('res.messages', res.messages);
          res.messages.forEach(msg => {
            allMsgs.push({
              id: `${msg.created_at}-user`,
              chat_id: chatId,
              sender: "user",
              content: msg.query,
              timestamp: msg.created_at,
            });
            allMsgs.push({
              id: `${msg.created_at}-bot`,
              chat_id: chatId,
              sender: "bot",
              content: msg.answer,
              timestamp: msg.created_at,
              citations: msg.citations,
            });
          });
        }
        setMessages(allMsgs);
        setLoading(false);
      });
    } else if (!chatId) {
      setMessages([]);
    }
  }, [chatId, propMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const mapServiceMessageToUI = (msg: any): ChatMessage => ({
    id: msg.id.toString(),
    chat_id: msg.chat_id.toString(),
    sender: (msg.role === "assistant" ? "bot" : "user") as "user" | "bot",
    content: msg.content,
    timestamp: msg.created_at,
  });

  const handleSend = async () => {
    if (!input.trim() || !chatId) return;
    setSending(true);
    // Add user's message
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      chat_id: chatId,
      sender: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    // Send to backend and add bot's response
    const res = await chatService.sendMessage(Number(chatId), input);
    const botMessage: ChatMessage = {
      id: Date.now().toString() + '-bot',
      chat_id: chatId,
      sender: 'bot',
      content: res.answer,
      timestamp: new Date().toISOString(),
      citations: res.citations,
    };
    setMessages(prev => [...prev, botMessage]);
    setInput('');
    setSending(false);
  };

  if (!chatId) {
    return <div style={{ padding: 32, color: '#888' }}>Select or start a chat to begin.</div>;
  }
  console.log('messages', messages);
  return (
    <div className="chat-window-container">
      <div className="chat-messages-area">
        {loading ? (
          <Spin />
        ) : messages.length === 0 ? (
          <Empty description="No messages yet. Start the conversation!" />
        ) : (
          <List
            dataSource={messages}
            renderItem={msg => (
              <List.Item
                className={`chat-message-item${msg.sender === 'user' ? ' user' : ''}`}
              >
                <div className={`chat-bubble${msg.sender === 'user' ? ' user' : ''}`}>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                  <div className="chat-message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  {msg.sender === 'bot' && msg.citations && msg.citations.length > 0 && (
                    <div className="chat-citations">
                      <div><strong>Sources:</strong></div>
                      <ul className="chat-citations-list">
                        {msg.citations.map((c, idx) => (
                          <li key={idx}>
                            <span>
                              <strong>File:</strong> {c.content || c.filename || 'Unknown'}<br />
                              <strong>Source:</strong> {c.source}<br />
                              <strong>Page:</strong> {typeof c.page === 'number' ? c.page + 1 : 'N/A'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <TextArea
          rows={2}
          value={input}
          onChange={e => setInput(e.target.value)}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          disabled={sending}
        />
        <Button
          type="primary"
          onClick={handleSend}
          loading={sending}
          className="chat-send-button"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow; 