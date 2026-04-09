import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import { AuthContext } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Topbar title="Dashboard" userProfile={user} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
