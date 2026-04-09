import React, { useState, useEffect } from 'react';
import { Search, UserX, UserCheck, Trash2, Mail, Calendar } from 'lucide-react';
import axios from 'axios';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockToggle = async (userId, isBlocked) => {
    try {
      await axios.post(`http://localhost:8000/api/admin/users/${userId}/block?block=${!isBlocked}`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  return (
    <div className="admin-users p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="admin-search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search by name or email..." />
        </div>
      </div>

      <div className="admin-card p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center p-8">Loading users...</td></tr>
            ) : users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="admin-avatar">{user.name?.[0] || 'U'}</div>
                    <div className="flex flex-col">
                      <span className="font-bold">{user.name || 'Anonymous'}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                <td className="text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-text ${user.is_blocked ? 'blocked' : 'active'}`}>
                    {user.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className={`action-icon ${user.is_blocked ? 'unblock' : 'block'}`}
                      onClick={() => handleBlockToggle(user.id, user.is_blocked)}
                      title={user.is_blocked ? 'Unblock' : 'Block'}
                    >
                      {user.is_blocked ? <UserCheck size={18} /> : <UserX size={18} />}
                    </button>
                    <button className="action-icon delete" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
