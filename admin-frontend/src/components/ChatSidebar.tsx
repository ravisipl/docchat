import React, { useState } from 'react';
import { List, Button, Input, Modal, Tooltip, Spin, Upload, Typography } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, SmileOutlined, DownOutlined, FileTextOutlined, UploadOutlined, LogoutOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Text } = Typography;

interface ChatSidebarProps {
  chats: Array<{
    id: string;
    title?: string;
    preview?: string;
    created_at: string;
    updated_at: string;
  }>;
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  loading: boolean;
  editingId: string | null;
  editTitle: string;
  setEditingId: (id: string | null) => void;
  setEditTitle: (title: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  navigate: (path: string) => void;
  fileList: any[];
  handleFileUpload: (info: any) => void;
  handleLogout: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  loading,
  editingId,
  editTitle,
  setEditingId,
  setEditTitle,
  collapsed,
  setCollapsed,
  navigate,
  fileList,
  handleFileUpload,
  handleLogout
}) => {
  const [search, setSearch] = useState('');
  const filteredChats = chats.filter(chat =>
    (chat.title || 'New Chat').toLowerCase().includes(search.toLowerCase()) ||
    (chat.preview || '').toLowerCase().includes(search.toLowerCase())
  );
  console.log(filteredChats);
  return (
    <div className="user-sider-inner">
      <div className="user-sider-top">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={onNewChat}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {!collapsed && 'New Chat S'}
        </Button>
      </div>
      <div className="user-sider-menu">
        <Input.Search
          placeholder="Search chats"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Button onClick={() => setCollapsed(!collapsed)} block icon={<SmileOutlined />} style={{ marginBottom: 0 }}>
          Recent Chats <DownOutlined />
        </Button>
        {loading ? (
          <Spin style={{ margin: 16 }} />
        ) : (
          <List
            dataSource={filteredChats.slice(0, 5)}
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
                onClick={() => onSelectChat(chat.id)}
                actions={[
                  editingId === chat.id ? (
                    <>
                      <Tooltip title="Save"><CheckOutlined onClick={e => { e.stopPropagation(); onRenameChat(chat.id); }} style={{ color: '#1677ff' }} /></Tooltip>
                      <Tooltip title="Cancel"><CloseOutlined onClick={e => { e.stopPropagation(); setEditingId(null); setEditTitle(''); }} /></Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Rename"><EditOutlined onClick={e => { e.stopPropagation(); setEditingId(chat.id); setEditTitle(chat.title || ''); }} /></Tooltip>
                      <Tooltip title="Delete"><DeleteOutlined onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }} style={{ color: '#ff4d4f' }} /></Tooltip>
                    </>
                  )
                ]}
              >
                {editingId === chat.id ? (
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onPressEnter={e => { e.stopPropagation(); onRenameChat(chat.id); }}
                    style={{ width: 140 }}
                    size="small"
                    autoFocus
                  />
                ) : (
                  <div style={{ width: 180, overflow: 'hidden' }}>
                    <Text strong ellipsis style={{ width: 180, display: 'block' }}>
                      {chat.title || chat.preview || 'New Chat'}
                    </Text>
                    <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                      {chat.preview || ''}
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
      <div className="user-sider-bottom">
        <Upload
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          showUploadList={false}
          multiple={true}
        >
          <Button 
            icon={<UploadOutlined />} 
            style={{ width: '100%', marginBottom: '8px' }}
          >
            {!collapsed && 'Upload Documents'}
          </Button>
        </Upload>
        <Button 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          danger
          style={{ width: '100%' }}
        >
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar; 