'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  PieChart,
  ChevronDown,
  ChevronRight,Wallet,Utensils,ChefHat ,Box   
} from 'lucide-react';

const menu = [
  { name: 'Dashboard', icon: <Home size={20} />, path: '/admin/dashboard' },
  { name: 'Tarbiyalanuvchi', icon: <Users size={20} />, path: '/admin/tarbiyalanuvchi' },
  { name: 'Guruhlar', icon: <PieChart size={20} />, path: '/admin/guruhlar' },
  { name: 'Davomat', icon: <Calendar size={20} />, path: '/admin/DavomatPage' },
  { name: 'Bola Kuni', icon: <Calendar size={20} />, path: '/admin/DarslarPage' },
  { name: 'Tolovlar', icon: <DollarSign size={20} />, path: '/admin/tolovlar' },
  { name: 'Hodimlar', icon: <Briefcase size={20} />, path: '/admin/hodimlar' },
  { name: 'Oyliklar', icon: <FileText size={20} />, path: '/admin/oyliklar' },
  { name: 'Lavozim', icon: <Briefcase size={20} />, path: '/admin/lavozim' },
  { name: 'Maxsus taomnoma', icon: <Utensils  size={20} />, path: '/admin/taomnoma' },
  { name: 'Qo`shimcha', icon: <Wallet size={20} />, path: '/admin/qoshimcha' },
]

const oshxonaMenu = [
  { name: 'Kirimlar', path: '/admin/kirimlar' },
  { name: 'Chiqimlar', path: '/admin/chiqimlar' },
  { name: 'Ombor', path: '/admin/SkladProductPage' },
];

const maishiyMenu = [
  { name: 'Kirimlar', path: '/admin/maishiy-kirim' },
  { name: 'Chiqimlar', path: '/admin/maishiy-chiqim' },
  { name: 'Ombor', path: '/admin/maishiy-ombor' },
];

export default function Sidebar() {
  const router = useRouter();
  const [oshxonaOpen, setOshxonaOpen] = useState(false);
  const [maishiyOpen, setMaishiyOpen] = useState(false);

 const renderSubmenu = (open, menuList) => {
  return open && (
    <ul className={styles.submenu}>
      {menuList.map((sub, idx) => {
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

        {/* Oshxona Accordion */}
        <li
          onClick={() => setOshxonaOpen(!oshxonaOpen)}
          className={`${styles.item} ${oshxonaOpen ? styles.active : ''}`}
        >
          <ChefHat  size={20} />
          <span>Oshxona</span>
          {oshxonaOpen ? <ChevronDown size={16} className={styles.arrow} /> : <ChevronRight size={16} className={styles.arrow} />}
        </li>
        {renderSubmenu(oshxonaOpen, oshxonaMenu)}

        {/* Maishiy Buyumlar Accordion */}
        <li
          onClick={() => setMaishiyOpen(!maishiyOpen)}
          className={`${styles.item} ${maishiyOpen ? styles.active : ''}`}
        >
          <Box   size={20} />
          <span>Maishiy buyumlar</span>
          {maishiyOpen ? <ChevronDown size={16} className={styles.arrow} /> : <ChevronRight size={16} className={styles.arrow} />}
        </li>
        {renderSubmenu(maishiyOpen, maishiyMenu)}
      </ul>
    </div>
  );
}
