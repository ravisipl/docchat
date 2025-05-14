import React from 'react';
import { Card, Tabs } from 'antd';
import { UserOutlined, SecurityScanOutlined, NotificationOutlined } from '@ant-design/icons';

const Settings: React.FC = () => {
  const items = [
    {
      key: 'profile',
      label: 'Profile Settings',
      icon: <UserOutlined />,
      children: (
        <div>
          <h3>Profile Settings</h3>
          <p>Profile settings content will go here</p>
        </div>
      ),
    },
    {
      key: 'security',
      label: 'Security',
      icon: <SecurityScanOutlined />,
      children: (
        <div>
          <h3>Security Settings</h3>
          <p>Security settings content will go here</p>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <NotificationOutlined />,
      children: (
        <div>
          <h3>Notification Settings</h3>
          <p>Notification settings content will go here</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2>Settings</h2>
      <Card>
        <Tabs
          defaultActiveKey="profile"
          items={items}
        />
      </Card>
    </div>
  );
};

export default Settings; 