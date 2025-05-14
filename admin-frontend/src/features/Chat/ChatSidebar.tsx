import React, { useEffect, useState } from 'react';
import { List, Button, Typography, Spin, Input, Modal, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, SmileOutlined, DownOutlined, FileTextOutlined } from '@ant-design/icons';
import chatService from '../../services/chatService';
import { ChatSession } from './chatTypes';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface Props {
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: (id: string) => void;
  setMessages: (msgs: any[]) => void;
}

const ChatSidebar: React.FC<Props> = ({ selectedChatId, onSelectChat, onNewChat, setMessages }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showRecent, setShowRecent] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    alert('Chats loading');
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    const res = await chatService.fetchAllChats();
    console.log('Sidebar chat API result:', res);
    alert('Chats loaded');
    setChats(res.map((chat: any) => ({
      id: chat.id.toString(),
      title: chat.title || '',
      preview: chat.messages && chat.messages.length > 0 ? chat.messages[0].content : '',
      created_at: chat.created_at,
      updated_at: chat.updated_at || chat.created_at
    })));
    setLoading(false);
  };

  const handleNewChat = async () => {
    const chatId = await chatService.createChat();
    onNewChat(chatId.toString());
    setMessages([]);
    loadChats();
  };

  const handleSelectChat = async (chatId: number | string) => {
    onSelectChat(chatId.toString());
    const msgs = await chatService.getChatHistory(Number(chatId));
    const formattedMessages: any[] = [];
    msgs.messages.forEach((msg: any) => {
      formattedMessages.push({
        id: `${msg.created_at}-user`,
        sender: 'user',
        content: msg.query,
        timestamp: msg.created_at,
      });
      formattedMessages.push({
        id: `${msg.created_at}-bot`,
        sender: 'bot',
        content: msg.answer,
        timestamp: msg.created_at,
        citations: msg.citations,
      });
    });
    setMessages(formattedMessages);
  };

  const handleRename = async (chatId: string) => {
    await chatService.updateChatTitle(chatId, editTitle);
    setEditingId(null);
    setEditTitle('');
    loadChats();
  };

  const handleDelete = async (chatId: string) => {
    Modal.confirm({
      title: 'Delete this chat?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        await chatService.deleteChat(chatId);
        setChats(chats.filter(c => c.id !== chatId));
        if (selectedChatId === chatId) onSelectChat('');
      }
    });
  };

  return (
    <div style={{
      width: 300,
      borderRight: '1px solid #eee',
      height: '100vh',
      overflowY: 'auto',
      background: '#f7f7f8',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Button type="primary" block style={{ margin: 16 }} icon={<PlusOutlined />} onClick={handleNewChat}>
        + New Chat
      </Button>
      <div>
        <Button onClick={() => setShowRecent(!showRecent)} block icon={<SmileOutlined />} style={{ marginBottom: 0 }}>
          Recent Chats <DownOutlined />
        </Button>
        {showRecent && (
          <List
            dataSource={chats.slice(0, 5)}
            renderItem={chat => (
              <List.Item
                style={{
                  background: chat.id === selectedChatId ? '#e6f7ff' : undefined,
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderLeft: chat.id === selectedChatId ? '4px solid #1677ff' : '4px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onClick={() => handleSelectChat(chat.id)}
                actions={[
                  editingId === chat.id ? (
                    <>
                      <Tooltip title="Save"><CheckOutlined onClick={e => { e.stopPropagation(); handleRename(chat.id); }} style={{ color: '#1677ff' }} /></Tooltip>
                      <Tooltip title="Cancel"><CloseOutlined onClick={e => { e.stopPropagation(); setEditingId(null); setEditTitle(''); }} /></Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Rename"><EditOutlined onClick={e => { e.stopPropagation(); setEditingId(chat.id); setEditTitle(chat.title || ''); }} /></Tooltip>
                      <Tooltip title="Delete"><DeleteOutlined onClick={e => { e.stopPropagation(); handleDelete(chat.id); }} style={{ color: '#ff4d4f' }} /></Tooltip>
                    </>
                  )
                ]}
              >
                {editingId === chat.id ? (
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onPressEnter={e => { e.stopPropagation(); handleRename(chat.id); }}
                    style={{ width: 140 }}
                    size="small"
                    autoFocus
                  />
                ) : (
                  <div style={{ width: 180, overflow: 'hidden' }}>
                    <Text strong ellipsis style={{ width: 180, display: 'block' }}>
                      {chat.title || chat.preview || 'New Chat'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(chat.updated_at).toLocaleString()}
                    </Text>
                  </div>
                )}
              </List.Item>
            )}
          />
        )}
      </div>
      <Button
        type="text"
        icon={<FileTextOutlined />}
        block
        style={{ marginTop: 16 }}
        onClick={() => navigate('/user/documents')}
      >
        Documents
      </Button>
    </div>
  );
};

export default ChatSidebar; 