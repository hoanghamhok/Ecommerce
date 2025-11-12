'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faBox,
  faFileInvoice,
  faUsers,
  faStar,
  faFolder,
  faUser,
  faTags,
  faTag
} from '@fortawesome/free-solid-svg-icons';

export default function AdminSidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const mainItems = [
    { name: 'Dashboard', icon: faChartPie, color: 'text-blue-500', href: '/admin' },
    { name: 'Nhóm sản phẩm', icon: faFolder, color: 'text-indigo-500', href: '/admin/categories' },
    { name: 'Sản phẩm', icon: faBox, color: 'text-red-500', href: '/admin/products' },
    { name: 'Đơn hàng', icon: faFileInvoice, color: 'text-green-500', href: '/admin/orders' },
    { name: 'Người dùng', icon: faUsers, color: 'text-pink-500', href: '/admin/users' },
    { name: 'Khuyến mãi', icon: faStar, color: 'text-yellow-500', href: '/admin/discount' },
    { name: 'Phân tích', icon: faTag, color: 'text-yellow-500', href: '/admin/analytics' },
  ];

  const accountItems = [
    { name: 'Profile', icon: faUser, color: 'text-gray-600', href: '#' },
  ];

  return (
    <aside className="fixed top-20 left-0 w-72 h-screen bg-white shadow-xl   px-6 py-8 z-50 transition-all duration-500 ease-in-out animate-fade-in">
      

      {/* Menu Items */}
      <ul className="space-y-2 text-sm font-medium text-gray-700">
        {mainItems.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              onClick={() => setActiveItem(item.name)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out
                ${
                  activeItem === item.name
                    ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold shadow-md border-l-4 border-blue-500'
                    : 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow hover:scale-[1.02]'
                }`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-4 h-4 ${item.color} transition-transform duration-300 group-hover:animate-bounce`}
              />
              <span className="transition-transform group-hover:translate-x-1">{item.name}</span>
            </a>
          </li>
        ))}
      </ul>

      {/* Account Pages */}
      <div className="mt-8 mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
        Account Pages
      </div>

      <ul className="space-y-2 text-sm font-medium text-gray-700">
        {accountItems.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              onClick={() => setActiveItem(item.name)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out
                ${
                  activeItem === item.name
                    ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-semibold shadow-md border-l-4 border-blue-500'
                    : 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:shadow hover:scale-[1.02]'
                }`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-4 h-4 ${item.color} group-hover:animate-bounce transition-transform`}
              />
              <span className="transition-transform group-hover:translate-x-1">{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
