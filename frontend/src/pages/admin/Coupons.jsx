import React, { useState } from 'react';
import { Plus, Tag, Clock, Trash2 } from 'lucide-react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'WELCOME10', discount_percentage: 10, expiry_date: '2026-12-31', usage_limit: 100, used_count: 45, is_active: true },
    { id: '2', code: 'SUMMER25', discount_percentage: 25, expiry_date: '2026-06-30', usage_limit: 50, used_count: 50, is_active: false },
  ]);

  return (
    <div className="admin-coupons p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <button className="add-btn flex items-center gap-2"><Plus size={20} /> Create Coupon</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(coupon => (
          <div key={coupon.id} className="admin-card p-6 flex flex-col gap-4 relative">
            <div className={`status-badge absolute top-4 right-4 ${coupon.is_active ? 'active' : 'inactive'}`}>
              {coupon.is_active ? 'Active' : 'Expired'}
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 text-black rounded-lg">
                <Tag size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{coupon.code}</h3>
                <p className="text-sm text-gray-500">{coupon.discount_percentage}% Discount</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm border-t pt-4">
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={16} /> Ends {coupon.expiry_date}
              </div>
              <div className="font-semibold">
                {coupon.used_count}/{coupon.usage_limit} Used
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium">Edit</button>
              <button className="p-2 rounded-lg border border-gray-200 text-black hover:bg-gray-100"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coupons;
