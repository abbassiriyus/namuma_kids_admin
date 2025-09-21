'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import url from '../../host/host';
import styles from '../../styles/Dashboard.module.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [bolalar, setBolalar] = useState([]);
  const [davomatlar, setDavomatlar] = useState([]);
  const [darsKunlar, setDarsKunlar] = useState([]);
  const [guruhlar, setGuruhlar] = useState([]);
  const [groupKPIData, setGroupKPIData] = useState([]);
  const [dailyDavomatData, setDailyDavomatData] = useState([]);
  const [topGroups, setTopGroups] = useState([]);
  const [topDays, setTopDays] = useState([]);

  const token = (typeof window !== "undefined") ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const colors = {
    holati1: '#22c55e',
    holati2: '#ef4444',
    kpi: '#3b82f6'
  };

  const formatDate = (isoDateStr) => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const fetchData = async () => {
    try {
      const [year, monthNum] = month.split('-');

      // API chaqiruvlari
      const [bolalarRes, davomatRes, darsKunlarRes, guruhlarRes] = await Promise.all([
        axios.get(`${url}/bola/all`, authHeader),
        axios.get(`${url}/bola_kun`, authHeader),
        axios.get(`${url}/bola_kun_all?year=${year}&month=${monthNum}`, authHeader),
        axios.get(`${url}/guruh`, authHeader)
      ]);

      // Shu oydagi dars kunlarini olish
      const darsFiltered = darsKunlarRes.data
        .filter(kun => kun.sana.startsWith(month))
        .sort((a, b) => new Date(a.sana) - new Date(b.sana));

      // Shu oydagi dars kunlari IDlari
      const thisMonthDarsIds = darsFiltered.map(d => d.id);

      // Shu oydagi davomat yozuvlari
      const monthDavomatlar = davomatRes.data.filter(d => thisMonthDarsIds.includes(d.darssana_id));

      setBolalar(bolalarRes.data);
      setDavomatlar(monthDavomatlar);
      setDarsKunlar(darsFiltered);
      setGuruhlar(guruhlarRes.data);
    } catch (err) {
      console.error("Xatolik ma'lumotlarni olishda:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  useEffect(() => {
    if (darsKunlar.length && davomatlar.length) {
      generateDailyDavomatData();
    }
  }, [darsKunlar, davomatlar]);

  useEffect(() => {
    if (darsKunlar.length && davomatlar.length && guruhlar.length && bolalar.length) {
      generateGroupKPIData();
    }
  }, [darsKunlar, davomatlar, guruhlar, bolalar, month]);

  const generateDailyDavomatData = () => {
    const data = darsKunlar.map(kun => {
      const kunDavomat = davomatlar.filter(d => d.darssana_id === kun.id);
      const holati1 = kunDavomat.filter(d => d.holati === 1).length;
      const holati2 = kunDavomat.filter(d => d.holati === 2).length;
      const total = holati1 + holati2;
      const kpi = total > 0 ? Math.round((holati1 / total) * 100) : 0;

      return {
        kun: formatDate(kun.sana),
        holati1,
        holati2,
        kpi,
        sana: kun.sana
      };
    });

    const top3Days = [...data].sort((a, b) => b.kpi - a.kpi).slice(0, 3);
    setDailyDavomatData(data);
    setTopDays(top3Days);
  };

  const generateGroupKPIData = () => {
    const result = guruhlar.map(guruh => {
      const groupBolalar = bolalar
        .filter(b => b.guruh_id === guruh.id)
        .map(b => b.id);

      let holati1 = 0;
      let holati2 = 0;

      darsKunlar.forEach(kun => {
        davomatlar.forEach(dav => {
          if (groupBolalar.includes(dav.bola_id) && dav.darssana_id === kun.id) {
            if (dav.holati === 1) holati1++;
            else if (dav.holati === 2) holati2++;
          }
        });
      });

      const total = holati1 + holati2;
      const kpi = total > 0 ? Math.round((holati1 / total) * 100) : 0;

      return {
        guruh: guruh.name,
        holati1,
        holati2,
        kpi,
      };
    });

    const topThree = [...result].sort((a, b) => b.kpi - a.kpi).slice(0, 3);
    setGroupKPIData(result);
    setTopGroups(topThree);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📊 Oy bo‘yicha Davomat Statistikasi</h2>

      <div className={styles.controls}>
        <label>Oy tanlang: </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={styles.monthInput}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>📅 Kunlik davomat</h2>
        {dailyDavomatData.length > 0 && (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyDavomatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kun" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="holati1" name="✅" fill={colors.holati1} />
              <Bar dataKey="holati2" name="❌" fill={colors.holati2} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 🗓 Top 3 Kunlar */}
      {topDays.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>🗓 Eng yaxshi 3 kun</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {topDays.map((day, index) => (
              <div key={index} style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '1rem',
                flex: '1 1 30%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <h4>📅 {formatDate(day.sana)}</h4>
                <p><strong>KPI:</strong> <span style={{ color: '#16a34a' }}>{day.kpi}%</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ gridColumn: '1 / -1' }}>
        <h2>🏫 Guruhlar KPI statistikasi</h2>

        {groupKPIData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupKPIData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="guruh" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="holati1" name="✅" fill={colors.holati1} />
              <Bar dataKey="holati2" name="❌" fill={colors.holati2} />
              <Bar dataKey="kpi" name="KPI (%)" fill={colors.kpi} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 🎖 Top 3 Guruhlar */}
        {topGroups.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3>🎖 Eng yaxshi 3 guruh</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {topGroups.map((group, index) => (
                <div key={index} style={{
                  background: '#f0f4ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: '12px',
                  padding: '1rem',
                  flex: '1 1 30%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ marginBottom: '4px' }}>🏅 {group.guruh}</h4>
                  <p><strong>KPI:</strong> <span style={{ color: '#2563eb' }}>{group.kpi}%</span></p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
