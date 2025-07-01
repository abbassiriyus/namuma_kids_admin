'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import url from '@/host/host';
import LayoutComponent from '@/components/LayoutComponent';
import styles from '@/styles/Dashboard.module.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [bolaStats, setBolaStats] = useState({ active: 0, inactive: 0 });
  const [xodimStats, setXodimStats] = useState({ xodimlar: 0, guruhlar: 0 });
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [daromadData, setDaromadData] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchStats = async () => {
    try {
      const [bolaRes, xodimRes, guruhRes] = await Promise.all([
        axios.get(`${url}/bola`, authHeader),
        axios.get(`${url}/xodim`, authHeader),
        axios.get(`${url}/guruh`, authHeader),
      ]);

      const allBolalar = bolaRes.data;
      const active = allBolalar.filter(b => b.is_active).length;
      const inactive = allBolalar.length - active;

      const xodimlar = xodimRes.data || [];
      const guruhlar = guruhRes.data || [];

      setBolaStats({ active, inactive });
      setXodimStats({ xodimlar: xodimlar.length, guruhlar: guruhlar.length });
    } catch (err) {
      console.error("Statistikani olishda xatolik:", err);
    }
  };

  const fetchDaromad = async () => {
    try {
      const res = await axios.get(`${url}/daromat_type?year=${year}`, authHeader);
      const rawData = res.data;

      // 12 oyli bo‘sh array
      const months = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
      ];

      const data = months.map((oy, idx) => {
        const monthNum = (idx + 1).toString().padStart(2, '0');
        const found = rawData.find(d => d.month === monthNum);
        return {
          oy,
          naqt: found?.naqt || 0,
          karta: found?.karta || 0,
          prichislena: found?.prichislena || 0
        };
      });

      setDaromadData(data);
    } catch (err) {
      console.error("Daromadni olishda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDaromad();
  }, [year]);

  const colors = {
    naqt: '#4CAF50',
    karta: '#2196F3',
    prichislena: '#FF9800',
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: '#fff',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p><strong>{label}</strong></p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.fill }}>
              {item.name}: {item.value.toLocaleString()} so‘m
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <LayoutComponent>
      <div className={styles.container}>
        <h1 className={styles.title}>Dashboard</h1>

        <div className={styles.inputRow}>
          <label htmlFor="year">Yil tanlang: </label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2000"
            max="2100"
            className={styles.yearInput}
          />
        </div>

        <div className={styles.cardGrid}>
          <div className={`${styles.card} ${styles.green}`}>
            <h2>Faol bolalar</h2>
            <p>{bolaStats.active} ta</p>
          </div>

          <div className={`${styles.card} ${styles.red}`}>
            <h2>Faol bo‘lmagan bolalar</h2>
            <p>{bolaStats.inactive} ta</p>
          </div>

          <div className={`${styles.card} ${styles.blue}`}>
            <h2>Jami xodimlar</h2>
            <p>{xodimStats.xodimlar} ta</p>
          </div>

          <div className={`${styles.card} ${styles.purple}`}>
            <h2>Jami guruhlar</h2>
            <p>{xodimStats.guruhlar} ta</p>
          </div>
        </div>

        <h2 style={{ marginTop: '2rem' }}>Daromad statistikasi ({year})</h2>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={daromadData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              barCategoryGap={15}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="oy" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="naqt" name="Naqt" fill={colors.naqt} />
              <Bar dataKey="karta" name="Karta" fill={colors.karta} />
              <Bar dataKey="prichislena" name="Prichislena" fill={colors.prichislena} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </LayoutComponent>
  );
}
