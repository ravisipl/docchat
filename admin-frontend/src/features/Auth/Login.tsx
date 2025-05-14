import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../shared/axios';
import { AxiosError } from 'axios';
import '../../assets/user.css';

interface LoginForm {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  is_admin: boolean;
}

interface ApiErrorResponse {
  detail: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, check role and redirect
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.is_admin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
      return null;
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('username', values.email);
      formData.append('password', values.password);

      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.access_token) {
        // Store access token
        localStorage.setItem('token', response.data.access_token);
        
        // Get user data
        const userResponse = await api.get('/auth/me');
        const userData: User = userResponse.data;
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        message.success('Login successful!');
        
        // Redirect based on user role
        if (userData.is_admin) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user', { replace: true });
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.detail || 'Login failed. Please check your credentials.';
      message.error(errorMessage);
      // Clear token and user data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-container">
      <Card 
        title="DocChat Login" 
        className="user-card"
      >
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 