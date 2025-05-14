import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, FileOutlined, DatabaseOutlined } from '@ant-design/icons';
import api from '../../shared/axios';
import '../../assets/admin.css';

interface DashboardStats {
  totalUsers: number;
  totalDocuments: number;
  totalStorage: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDocuments: 0,
    totalStorage: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <h2>Dashboard Overview</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Documents"
              value={stats.totalDocuments}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Storage"
              value={`${(stats.totalStorage / (1024 * 1024)).toFixed(2)} MB`}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 