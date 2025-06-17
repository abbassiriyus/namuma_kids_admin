'use client';

import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';
import { Home, Users, Calendar, Warehouse, DollarSign, FileText, Briefcase, PieChart, ClipboardList } from 'lucide-react';

const menu = [
  { name: 'Dashboard', icon: <Home size={20} />, path: '/admin/dashboard' },
  { name: 'Tarbiyalanuvchi', icon: <Users size={20} />, path: '/admin/tarbiyalanuvchi' },
  { name: 'Guruhlar', icon: <PieChart size={20} />, path: '/admin/guruhlar' },
  { name: 'Davomat', icon: <Calendar size={20} />, path: '/admin/davomat' },
  { name: 'Tolovlar', icon: <DollarSign size={20} />, path: '/admin/tolovlar' },
  { name: 'Hodimlar', icon: <Briefcase size={20} />, path: '/admin/hodimlar' },
  { name: 'Oyliklar', icon: <FileText size={20} />, path: '/admin/oyliklar' },
  { name: 'Lavozim', icon: <Briefcase size={20} />, path: '/admin/lavozim' },
  { name: 'Kirimlar', icon: <ClipboardList size={20} />, path: '/admin/kirimlar' },
  { name: 'Chiqimlar', icon: <ClipboardList size={20} />, path: '/admin/chiqimlar' },
  { name: 'Ombor', icon: <Warehouse size={20} />, path: '/admin/harajatlar' },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>Bog'cha Admin</h2>
      <ul className={styles.menu}>
        {menu.map((item, i) => {
          const isActive = router.pathname === item.path;
          return (
            <li
              key={i}
              onClick={() => router.push(item.path)}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
