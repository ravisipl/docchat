import React from 'react';
import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import api from '../shared/axios';

const { Dragger } = Upload;

interface UploadModalProps {
  visible: boolean;
  onCancel: () => void;
  currentFolder: number | null;
  onSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onCancel,
  currentFolder,
  onSuccess
}) => {
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: `${api.defaults.baseURL}/files/upload`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    data: (file) => ({
      folder_id: currentFolder
    }),
    onChange(info) {
      const { status } = info.file;
      
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        if (info.fileList.every(file => file.status === 'done' || file.status === 'error')) {
          onSuccess();
          onCancel();
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent?: number) => percent ? `${parseFloat(percent.toFixed(2))}%` : '0%',
    },
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (currentFolder !== null) {
        formData.append('folder_id', currentFolder.toString());
      }

      try {
        const response = await api.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (event) => {
            if (event.total && onProgress) {
              onProgress({ percent: (event.loaded / event.total) * 100 });
            }
          }
        });

        if (onSuccess) {
          onSuccess(response.data);
        }
      } catch (error) {
        console.error('Upload error:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    }
  };

  return (
    <Modal
      title="Upload Files"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files to this area to upload</p>
        <p className="ant-upload-hint">
          Support for multiple file upload. Strictly prohibited from uploading company data or other
          banned files.
        </p>
      </Dragger>
    </Modal>
  );
};

export default UploadModal; 