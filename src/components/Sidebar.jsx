'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/Sidebar.module.css';
import {
  Home, Users, Calendar, DollarSign, FileText, Briefcase,
  PieChart, ChevronDown, ChevronRight, Wallet, Utensils,
  ChefHat, Box, ShieldCheck
} from 'lucide-react';
import url from '@/host/host';

export default function Sidebar() {
  const router = useRouter();
  const [oshxonaOpen, setOshxonaOpen] = useState(false);
  const [maishiyOpen, setMaishiyOpen] = useState(false);
  const [visiblePermissions, setVisiblePermissions] = useState({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // 🔵 Loading holati

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const adminStr = localStorage.getItem('admin');
        if (!adminStr) return;

        const admin = JSON.parse(adminStr);
        setIsSuperAdmin(admin?.type === 1);

        if (admin?.type !== 1) {
          const token = localStorage.getItem('token');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get(`${url}/permissions/${admin.id}`);
          setVisiblePermissions(res.data.permissions || {});
        }
      } catch (err) {
        console.error('Ruxsatlarni yuklashda xatolik:', err);
      } finally {
        setLoading(false); // 🔵 Loading tugadi
      }
    };

    loadPermissions();
  }, []);

  const hasPermission = (key) => isSuperAdmin || visiblePermissions[`view_${key}`];

  const menu = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/admin/dashboard', key: 'dashboard' },
    { name: 'Adminlar', icon: <ShieldCheck size={20} />, path: '/admin/adminlar', key: 'admins' },
    { name: 'Tarbiyalanuvchi', icon: <Users size={20} />, path: '/admin/tarbiyalanuvchi', key: 'students' },
    { name: 'Sinov bola', icon: <Users size={20} />, path: '/admin/sinov', key: 'prp' },
  
    { name: 'Guruhlar', icon: <PieChart size={20} />, path: '/admin/guruhlar', key: 'groups' },
    { name: 'Sinov davomat', icon: <Calendar size={20} />, path: '/admin/sinovDavomat', key: 'sinovdavomat' },
   
    { name: 'Davomat', icon: <Calendar size={20} />, path: '/admin/DavomatPage', key: 'attendance' },
    { name: 'Xodim Davomat', icon: <Calendar size={20} />, path: '/admin/XodimDavomat', key: 'attendance' }, 
    { name: 'Bola Kuni', icon: <Calendar size={20} />, path: '/admin/DarslarPage', key: 'lessons' },
    { name: 'Tolovlar', icon: <DollarSign size={20} />, path: '/admin/tolovlar', key: 'payments' },
    { name: 'Hodimlar', icon: <Briefcase size={20} />, path: '/admin/hodimlar', key: 'employees' },
    { name: 'Oyliklar', icon: <FileText size={20} />, path: '/admin/oyliklar', key: 'salaries' },
    { name: 'Lavozim', icon: <Briefcase size={20} />, path: '/admin/lavozim', key: 'positions' },
    { name: 'Maxsus taomnoma', icon: <Utensils size={20} />, path: '/admin/taomnoma', key: 'meals' },
    { name: 'Xarajat', icon: <Wallet size={20} />, path: '/admin/qoshimcha', key: 'extras' },
  ];

  const oshxonaMenu = [
    { name: 'Kirimlar', path: '/admin/kirimlar', key: 'kitchen_incomes' },
    { name: 'Chiqimlar', path: '/admin/chiqimlar', key: 'kitchen_expenses' },
    { name: 'Ombor', path: '/admin/SkladProductPage', key: 'kitchen_storage' },
  ];

  const maishiyMenu = [
    { name: 'Kirimlar', path: '/admin/maishiy-kirim', key: 'household_incomes' },
    { name: 'Chiqimlar', path: '/admin/maishiy-chiqim', key: 'household_expenses' },
    { name: 'Ombor', path: '/admin/maishiy-ombor', key: 'household_storage' },
  ];

  const renderSubmenu = (open, menuList) => {
    return open && (
      <ul className={styles.submenu}>
        {menuList.filter((m) => hasPermission(m.key)).map((sub, idx) => {
          const isSubActive = router.pathname === sub.path;
          return (
            <li
              key={idx}
              onClick={() => router.push(sub.path)}
              className={`${styles.subitem} ${isSubActive ? styles.active : ''}`}
            >
              {sub.name}
            </li>
          );
        })}
      </ul>
    );
  };

  // 🔵 LOADING ko‘rinishi
  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.loading}>⏳ Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.title}>Bog'cha Admin</h2>
      <ul className={styles.menu}>
        {menu.filter((m) => hasPermission(m.key)).map((item, i) => {
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

        {oshxonaMenu.some((m) => hasPermission(m.key)) && (
          <>
            <li onClick={() => setOshxonaOpen(!oshxonaOpen)} className={styles.item}>
              <ChefHat size={20} />
              <span>Oshxona</span>
              {oshxonaOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </li>
            {renderSubmenu(oshxonaOpen, oshxonaMenu)}
          </>
        )}

        {maishiyMenu.some((m) => hasPermission(m.key)) && (
          <>
            <li onClick={() => setMaishiyOpen(!maishiyOpen)} className={styles.item}>
              <Box size={20} />
              <span>Maishiy buyumlar</span>
              {maishiyOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </li>
            {renderSubmenu(maishiyOpen, maishiyMenu)}
          </>
        )}
      </ul>
    </div>
  );
}
