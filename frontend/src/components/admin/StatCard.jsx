import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, trend, trendValue, color }) => {
  return (
    <div className="admin-stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
        <div className={`stat-card-trend ${trend}`}>
          {trend === 'up' ? '+' : '-'}{trendValue}%
        </div>
      </div>
      <div className="stat-card-body">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
