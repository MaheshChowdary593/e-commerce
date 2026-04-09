import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

const Analytics = () => {
  const data = [
    { name: 'Mon', sales: 4000, users: 2400 },
    { name: 'Tue', sales: 3000, users: 1398 },
    { name: 'Wed', sales: 2000, users: 9800 },
    { name: 'Thu', sales: 2780, users: 3908 },
    { name: 'Fri', sales: 1890, users: 4800 },
    { name: 'Sat', sales: 2390, users: 3800 },
    { name: 'Sun', sales: 3490, users: 4300 },
  ];

  const pieData = [
    { name: 'Shirts', value: 400 },
    { name: 'Jeans', value: 300 },
    { name: 'Footwear', value: 300 },
    { name: 'Accessories', value: 200 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="admin-analytics p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold shadow-md">
          <Download size={20} /> Export Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="admin-card p-6">
          <h3 className="text-xl font-bold mb-6 text-slate-800">Revenue vs User Growth</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card p-6">
          <h3 className="text-xl font-bold mb-6 text-slate-800">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
