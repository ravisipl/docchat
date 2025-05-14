import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Space, 
  message, 
  Row, 
  Col, 
  Dropdown, 
  Menu,
  Modal,
  Upload
} from 'antd';
import { 
  DownloadOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UploadOutlined,
  FolderAddOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  MoreOutlined,
  FileOutlined,
  FolderOutlined
} from '@ant-design/icons';
import api from '../../shared/axios';
import type { UploadProps } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { bytesToSize } from '../../shared/format';
import { useNavigate, useParams } from 'react-router-dom';
import '../../assets/Documents.css';
import UploadModal from '../../components/UploadModal';

interface FileSystemItem {
  id: number;
  name: string;
  type: 'file' | 'folder';
  created_at: string;
  updated_at: string;
  size?: number;
  file_type?: string;
  parent_id?: number;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [currentFolderMeta, setCurrentFolderMeta] = useState<FileSystemItem | null>(null);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileSystemItem | null>(null);

  useEffect(() => {
    if (folderId) {
      setCurrentFolder(parseInt(folderId));
    } else {
      setCurrentFolder(null);
      setCurrentFolderMeta(null);
    }
  }, [folderId]);

  useEffect(() => {
    fetchItems();
    if (currentFolder !== null) {
      fetchCurrentFolderMeta(currentFolder);
    } else {
      setCurrentFolderMeta(null);
    }
  }, [currentFolder]);

  const fetchItems = async () => {
    try {
      const response = await api.get('/files/browse', {
        params: { folder_id: currentFolder }
      });
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('Failed to load files and folders');
      setLoading(false);
    }
  };

  const fetchCurrentFolderMeta = async (folderId: number) => {
    try {
      const response = await api.get(`/files/folders/${folderId}`);
      setCurrentFolderMeta(response.data);
    } catch (error) {
      setCurrentFolderMeta(null);
    }
  };

  const handleDelete = async (item: FileSystemItem) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await api.delete(`/files/${itemToDelete.type}s/${itemToDelete.id}`);
      setItems(items.filter(i => i.id !== itemToDelete.id));
      message.success(`${itemToDelete.type === 'file' ? 'File' : 'Folder'} deleted successfully`);
    } catch (error) {
      message.error(`Error deleting ${itemToDelete.type}`);
      console.error(`Error deleting ${itemToDelete.type}:`, error);
    } finally {
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const handleDownload = async (item: FileSystemItem) => {
    if (item.type !== 'file') return;
    
    try {
      const response = await api.get(
        `/files/download/${item.id}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', item.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Download started');
    } catch (error) {
      message.error('Error downloading file');
      console.error('Error downloading file:', error);
    }
  };

  const handleCreateFolder = async () => {
    try {
      await api.post('/files/folders', {
        name: newFolderName,
        parent_id: currentFolder
      });
      setNewFolderModalVisible(false);
      setNewFolderName('');
      fetchItems();
      message.success('Folder created successfully');
    } catch (error) {
      message.error('Error creating folder');
      console.error('Error creating folder:', error);
    }
  };

  const handleNavigate = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigate(`/admin/documents/${item.id}`);
    }
  };

  const handleBack = () => {
    if (currentFolderMeta && currentFolderMeta.parent_id) {
      navigate(`/admin/documents/${currentFolderMeta.parent_id}`);
    } else {
      navigate('/admin/documents');
    }
  };

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {items.map(item => (
        <Col key={`${item.type}-${item.id}`} xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            hoverable
            className="file-card"
            onClick={() => handleNavigate(item)}
            actions={[
              item.type === 'file' && <DownloadOutlined key="download" onClick={(e) => {
                e.stopPropagation();
                handleDownload(item);
              }} />,
              <DeleteOutlined key="delete" onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }} />
            ].filter(Boolean)}
          >
            <Card.Meta
              avatar={item.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
              title={item.name}
              description={
                item.type === 'folder' 
                  ? `Created ${formatDistanceToNow(new Date(item.created_at))} ago`
                  : `${formatDistanceToNow(new Date(item.updated_at))} ago · ${item.size ? bytesToSize(item.size) : '0 B'}`
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <table className="files-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Last Modified</th>
          <th>Size</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredItems.map((item) => (
          <tr key={item.id} onClick={() => item.type === 'folder' && handleNavigate(item)}>
            <td>
              <Space>
                {item.type === 'folder' ? (
                  <FolderOutlined className="file-icon" />
                ) : (
                  <FileOutlined className="file-icon" />
                )}
                {item.name}
              </Space>
            </td>
            <td>{formatDistanceToNow(new Date(item.updated_at))} ago</td>
            <td>{item.type === 'folder' ? '-' : (item.size ? bytesToSize(item.size) : '0 B')}</td>
            <td>
              <Space>
                {item.type === 'file' && (
                  <Button type="text" icon={<DownloadOutlined />} onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item);
                  }} />
                )}
                <Button type="text" icon={<DeleteOutlined />} onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }} />
              </Space>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="documents-page">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="documents-header">
          <Space>
            {currentFolder && (
              <Button onClick={handleBack}>
                Back
              </Button>
            )}
            <Input.Search
              placeholder="Search files and folders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
          </Space>
          
          <Space>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              Upload
            </Button>
            <Button 
              icon={<FolderAddOutlined />}
              onClick={() => setNewFolderModalVisible(true)}
            >
              New Folder
            </Button>
            <Button.Group>
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              />
              <Button
                icon={<UnorderedListOutlined />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              />
            </Button.Group>
          </Space>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </Space>

      <Modal
        title="Create New Folder"
        open={newFolderModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => {
          setNewFolderModalVisible(false);
          setNewFolderName('');
        }}
      >
        <Input
          placeholder="Folder name"
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
        />
      </Modal>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setItemToDelete(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete {itemToDelete?.type === 'file' ? 'file' : 'folder'} "{itemToDelete?.name}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>

      <UploadModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        currentFolder={currentFolder}
        onSuccess={fetchItems}
      />
    </div>
  );
};

export default Documents; 