import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Typography, Modal } from 'antd';
import { 
  LogoutOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import chatService from '../../services/chatService';
import ChatWindow from '../../features/Chat/ChatWindow';
import ChatSidebar from '../ChatSidebar';
import '../../assets/user.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const UserLayout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(localStorage.getItem('selectedChatId') || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem('selectedChatId', selectedChatId);
      handleSelectChat(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);

  const loadChats = async () => {
    setLoading(true);
    const res = await chatService.fetchAllChats();
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
    setSelectedChatId(chatId.toString());
    setMessages([]);
    loadChats();
  };

  // Helper to map backend history to ChatMessage[]
  const mapHistoryToChatMessages = (history: any, chatId: string): any[] => {
    const allMsgs: any[] = [];
    if (history && Array.isArray(history.messages)) {
      history.messages.forEach((msg: any, idx: number) => {
        allMsgs.push({
          id: `${msg.created_at}-user-${idx}`,
          chat_id: chatId,
          sender: 'user',
          content: msg.query,
          timestamp: msg.created_at,
        });
        allMsgs.push({
          id: `${msg.created_at}-bot-${idx}`,
          chat_id: chatId,
          sender: 'bot',
          content: msg.answer,
          timestamp: msg.created_at,
          citations: msg.citations,
        });
      });
    }
    return allMsgs;
  };

  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    const history = await chatService.getChatHistory(Number(chatId));
    const mappedMessages = mapHistoryToChatMessages(history, chatId);
    setMessages(mappedMessages);
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
        if (selectedChatId === chatId) setSelectedChatId('');
      }
    });
  };

  const handleFileUpload = (info: any) => {
    setFileList(info.fileList);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Layout className="user-layout" style={{ height: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="user-sider"
        width={260}
      >
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onRenameChat={handleRename}
          onDeleteChat={handleDelete}
          loading={loading}
          editingId={editingId}
          editTitle={editTitle}
          setEditingId={setEditingId}
          setEditTitle={setEditTitle}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          navigate={navigate}
          fileList={fileList}
          handleFileUpload={handleFileUpload}
          handleLogout={handleLogout}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s', height: '100%' }}>
        <Header 
          className="user-header"
          style={{ width: `calc(100% - ${collapsed ? 80 : 260}px)` }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          />
          <Text strong className="user-header-title">DocChat</Text>
          <div style={{ width: '32px' }} /> {/* Spacer for alignment */}
        </Header>

        <Content className="user-content" style={{ height: '100%', overflow: 'hidden' }}>
          <div className="user-content-inner" style={{ height: '100%' }}>
            {/* Only render ChatWindow here for chat route, otherwise use <Outlet /> */}
            <ChatWindow chatId={selectedChatId} messages={messages} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout; 