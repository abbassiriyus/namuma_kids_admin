'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/Sidebar.module.css';
import {
  Home, Users, Calendar, DollarSign, FileText, Briefcase,
  PieChart, ChevronDown, ChevronRight, Wallet, Utensils,
  ChefHat, Box, ShieldCheck, Menu,
  Clock
} from 'lucide-react';
import url from '../host/host.js';

export default function Sidebar() {
  const router = useRouter();
  const [oshxonaOpen, setOshxonaOpen] = useState(false);
  const [maishiyOpen, setMaishiyOpen] = useState(false);
  const [visiblePermissions, setVisiblePermissions] = useState({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Sidebar uchun mobil toggle
  const [calcOpen, setCalcOpen] = useState(false); // Kalkulyator uchun toggle
  const [calcInput, setCalcInput] = useState(''); // Oddiy kalkulyator uchun
  const [volumeInput, setVolumeInput] = useState({ weight: '', price: '' }); // Mahsulot hajmi kalkulyatori uchun
  const [volumeResult, setVolumeResult] = useState(null); // Mahsulot hajmi natijasi

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const adminStr = localStorage.getItem('admin');
        if (!adminStr) {
          setLoading(false);
          return;
        }

        const admin = JSON.parse(adminStr);
        setIsSuperAdmin(admin?.type === 1);

        let permissionsData = {};
        if (admin?.type !== 1) {
          const token = localStorage.getItem('token');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get(`${url}/permissions/${admin.id}`);
          permissionsData = res.data.permissions || {};
          setVisiblePermissions(permissionsData);
        }

        setLoading(false);

        // Birinchi ruxsatli sahifaga yo‘naltirish
        const allMenus = [
          ...menu,
          ...oshxonaMenu.map((item) => ({ ...item, isSubmenu: true })),
          ...maishiyMenu.map((item) => ({ ...item, isSubmenu: true })),
        ];

        const allowedMenu = allMenus.find((m) => isSuperAdmin || permissionsData[`view_${m.key}`]);
        const currentPath = router.pathname;

        if (allowedMenu && currentPath === '/' && !allowedMenu.isSubmenu) {
          router.push(allowedMenu.path);
        }
      } catch (err) {
        console.error('Ruxsatlarni yuklashda xatolik:', err);
        setLoading(false);
      }
    };

    loadPermissions();
  }, [router]);

  // faqat superadmin yoki permissioni bor foydalanuvchi ko'radi
  const hasPermission = (key) => isSuperAdmin || !!visiblePermissions[`view_${key}`];

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
    { name: 'Xarajat', icon: <Wallet size={20} />, path: '/admin/qoshimcha' },
    { name: 'Tarix', icon: <Clock size={20} />, path: '/admin/tarix', key: 'tarix' },

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

  // Oddiy kalkulyator logikasi
  const handleCalcButton = (value) => {
    setCalcInput((prev) => prev + value);
  };

  const handleCalcClear = () => {
    setCalcInput('');
  };

  const handleCalcResult = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(calcInput);
      setCalcInput(result.toString());
    } catch (error) {
      setCalcInput('Xato');
    }
  };

  // Mahsulot hajmi kalkulyatori logikasi
  const handleVolumeCalculate = () => {
    const weight = parseFloat(volumeInput.weight);
    const price = parseFloat(volumeInput.price);
    if (weight > 0 && price >= 0) {
      const pricePerKg = price / weight;
      setVolumeResult(pricePerKg.toFixed(2));
    } else {
      setVolumeResult('Iltimos, to‘g‘ri qiymatlar kiriting');
    }
  };

  const renderSubmenu = (open, menuList) =>
    open && (
      <ul className={styles.submenu}>
        {menuList.filter((m) => hasPermission(m.key)).map((sub, idx) => {
          const isSubActive = router.pathname === sub.path;
          return (
            <li
              key={idx}
              onClick={() => {
                router.push(sub.path);
                setIsOpen(false);
              }}
              className={`${styles.subitem} ${isSubActive ? styles.active : ''}`}
            >
              {sub.name}
            </li>
          );
        })}
      </ul>
    );

  if (loading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.loading}>⏳ Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar uchun mobil toggle tugmasi */}
      <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        <Menu size={24} />
      </button>

      {/* Kalkulyator uchun toggle tugmasi */}
     

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <h2 className={styles.title}>Bog'cha Admin</h2>
        <ul className={styles.menu}>
          {menu.filter((m) => hasPermission(m.key)).map((item, i) => {
            const isActive = router.pathname === item.path;
            return (
              <li
                key={i}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
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

      {/* Kalkulyatorlar qo‘shildi */}
      <div className={`${styles.calculatorSection} ${calcOpen ? styles.calcOpen : ''}`}>
        <h3 className={styles.calculatorTitle}>Kalkulyatorlar</h3>
        
        {/* Oddiy kalkulyator */}
        <div className={styles.calculator}>
          <h4>Oddiy kalkulyator</h4>
          <input
            type="text"
            value={calcInput}
            readOnly
            className={styles.calcInput}
            placeholder="Natija"
          />
          <div className={styles.calcButtons}>
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
              <button
                key={btn}
                onClick={() => btn === '=' ? handleCalcResult() : handleCalcButton(btn)}
                className={styles.calcButton}
              >
                {btn}
              </button>
            ))}
            <button onClick={handleCalcClear} className={`${styles.calcButton} ${styles.clearButton}`}>
              Tozalash
            </button>
          </div>
        </div>

        {/* Mahsulot hajmi kalkulyatori */}
        <div className={styles.calculator}>
          <h4>Mahsulot hajmi kalkulyatori</h4>
          <div className={styles.volumeInput}>
            <label>
              Og‘irlik (kg):
              <input
                type="number"
                value={volumeInput.weight}
                onChange={(e) => setVolumeInput({ ...volumeInput, weight: e.target.value })}
                placeholder="Og‘irlikni kiriting"
                className={styles.input}
              />
            </label>
            <label>
              Umumiy narx (so‘m):
              <input
                type="number"
                value={volumeInput.price}
                onChange={(e) => setVolumeInput({ ...volumeInput, price: e.target.value })}
                placeholder="Narxni kiriting"
                className={styles.input}
              />
            </label>
            <button onClick={handleVolumeCalculate} className={styles.calcButton}>
              Hisoblash
            </button>
          </div>
          {volumeResult && (
            <p className={styles.result}>
              1 kg narxi: {volumeResult} so‘m
            </p>
          )}
        </div>
      </div> 
      <button className={styles.calcToggleBtn} onClick={() => setCalcOpen(!calcOpen)}>
        {calcOpen ? '⬅️ Kalkulyatorni yopish' : '➡️ Kalkulyatorni ochish'}
      </button>
    </>
  );
}