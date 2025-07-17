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
  const [darslarData, setDarslarData] = useState([]);
  const [davomatData, setDavomatData] = useState([]);
  const [dailyDavomatData, setDailyDavomatData] = useState([]);
  const [groupKPIData, setGroupKPIData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => (new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [todayAttendanceStats, setTodayAttendanceStats] = useState({ kelgan: 0, kelmagan: 0 });

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

      setBolaStats({ active, inactive });
      setXodimStats({ xodimlar: xodimRes.data.length, guruhlar: guruhRes.data.length });
    } catch (err) {
      console.error("Statistikani olishda xatolik:", err);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get(`${url}/bola_kun`, authHeader);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayRecords = res.data.filter(item => item.sana?.slice(0, 10) === todayStr);

      const kelgan = todayRecords.filter(item => item.holati === 1).length;
      const kelmagan = todayRecords.filter(item => item.holati === 2).length;

      setTodayAttendanceStats({ kelgan, kelmagan });
    } catch (err) {
      console.error("Bugungi davomatni olishda xatolik:", err);
    }
  };

  const fetchDaromad = async () => {
    try {
      const res = await axios.get(`${url}/daromat_type`, authHeader);
      const rawData = res.data.filter(item => {
        const sana = new Date(item.sana);
        return sana.getFullYear().toString() === year;
      });

      const monthlyTotals = {};
      rawData.forEach(item => {
        const date = new Date(item.sana);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        if (!monthlyTotals[month]) {
          monthlyTotals[month] = {
            naqt: 0,
            karta: 0,
            prichislena: 0,
            naqt_prichislena: 0,
          };
        }

        monthlyTotals[month].naqt += item.naqt || 0;
        monthlyTotals[month].karta += item.karta || 0;
        monthlyTotals[month].prichislena += item.prichislena || 0;
        monthlyTotals[month].naqt_prichislena += item.naqt_prichislena || 0;
      });

      const months = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
      ];

      const data = months.map((oy, idx) => {
        const monthKey = (idx + 1).toString().padStart(2, '0');
        const found = monthlyTotals[monthKey] || {
          naqt: 0,
          karta: 0,
          prichislena: 0,
          naqt_prichislena: 0,
        };
        const jami =
    found.naqt +
    found.karta +
    found.prichislena +
    found.naqt_prichislena;

  return { oy, ...found, jami };
      });

      setDaromadData(data);
    } catch (err) {
      console.error("Daromadni olishda xatolik:", err);
    }
  };

  const fetchDarslar = async () => {
    try {
      const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
      const responses = await Promise.all(
        months.map(m => axios.get(`${url}/bola_kun_all?month=${m}&year=${year}`, authHeader))
      );
      const data = responses.map((res, idx) => ({
        oy: [
          'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
          'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
        ][idx],
        darslar: res.data.length
      }));
      setDarslarData(data);
    } catch (err) {
      console.error("Darslar sonini olishda xatolik:", err);
    }
  };

  const fetchDavomatlar = async () => {
    try {
      const res = await axios.get(`${url}/bola_kun`, authHeader);
      const rawData = res.data.filter(item => {
        const sana = new Date(item.created_at);
        return sana.getFullYear().toString() === year;
      });

      const monthlyCounts = {};
      rawData.forEach(item => {
        const date = new Date(item.created_at);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        if (!monthlyCounts[month]) monthlyCounts[month] = { holati1: 0, holati2: 0 };
        if (item.holati === 1) monthlyCounts[month].holati1++;
        if (item.holati === 2) monthlyCounts[month].holati2++;
      });

      const months = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
      ];

      const data = months.map((oy, idx) => {
        const monthKey = (idx + 1).toString().padStart(2, '0');
        const found = monthlyCounts[monthKey] || { holati1: 0, holati2: 0 };
        return { oy, ...found };
      });

      setDavomatData(data);
    } catch (err) {
      console.error("Davomatlarni olishda xatolik:", err);
    }
  };

  const fetchDailyDavomat = async () => {
    try {
      const res = await axios.get(`${url}/bola_kun`, authHeader);
      const today = new Date();
      const month = today.getMonth();
      const yearNow = today.getFullYear();

      const rawData = res.data.filter(item => {
        const date = new Date(item.created_at);
        return date.getFullYear() === yearNow && date.getMonth() === month;
      });

      const daily = {};
      rawData.forEach(item => {
        const d = new Date(item.created_at).getDate().toString().padStart(2, '0');
        if (!daily[d]) daily[d] = { holati1: 0, holati2: 0 };
        if (item.holati === 1) daily[d].holati1++;
        if (item.holati === 2) daily[d].holati2++;
      });

      const daysInMonth = new Date(yearNow, month + 1, 0).getDate();
      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = (i + 1).toString().padStart(2, '0');
        return { kun: day, ...daily[day] || { holati1: 0, holati2: 0 } };
      });

      setDailyDavomatData(data);
    } catch (err) {
      console.error("Har kunlik davomatni olishda xatolik:", err);
    }
  };

  const fetchGroupKPIData = async () => {
    try {
      const [bolaRes, guruhRes, bolaKunRes] = await Promise.all([
        axios.get(`${url}/bola`, authHeader),
        axios.get(`${url}/guruh`, authHeader),
        axios.get(`${url}/bola_kun`, authHeader)
      ]);

      const currentYear = new Date().getFullYear();
      const month = selectedMonth;

      const bolalar = bolaRes.data;
      const guruhlar = guruhRes.data;
      const bolaKunlar = bolaKunRes.data;

      const guruhMap = {};
      bolalar.forEach(bola => {
        if (!bola.is_active) return;
        if (!guruhMap[bola.guruh_id]) guruhMap[bola.guruh_id] = [];
        guruhMap[bola.guruh_id].push(bola.id);
      });

      const result = guruhlar.map(guruh => {
        const bolalarInGuruh = guruhMap[guruh.id] || [];
        const bolaKuniInMonth = bolaKunlar.filter(bk => {
          const date = new Date(bk.created_at);
          const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
          const yearStr = date.getFullYear().toString();
          return monthStr === month && yearStr === currentYear.toString() && bolalarInGuruh.includes(bk.bola_id);
        });

        const holati1 = bolaKuniInMonth.filter(b => b.holati === 1).length;
        const holati2 = bolaKuniInMonth.filter(b => b.holati === 2).length;
        const jami = holati1 + holati2;
        const kpi = jami > 0 ? ((holati1 / jami) * 10).toFixed(2) : 0;

        return {
          guruh: guruh.name,
          holati1,
          holati2,
          kpi
        };
      });

      setGroupKPIData(result);
    } catch (err) {
      console.error("Guruh KPI'larini olishda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTodayAttendance();
    fetchDaromad();
    fetchDarslar();
    fetchDavomatlar();
    fetchDailyDavomat();
    fetchGroupKPIData();
  }, [year, selectedMonth]);

  const colors = {
    naqt: '#4CAF50',
    karta: '#2196F3',
    prichislena: '#FF9800',
    naqt_prichislena: '#9C27B0',
    darslar: '#607D8B',
    holati1: '#00BCD4',
    holati2: '#FF5722',
    kpi: '#607D8B'
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
          <div className={`${styles.card} ${styles.green}`}><h2>Faol bolalar</h2><p>{bolaStats.active} ta</p></div>
          <div className={`${styles.card} ${styles.red}`}><h2>Faol bo‘lmagan bolalar</h2><p>{bolaStats.inactive} ta</p></div>
          <div className={`${styles.card} ${styles.blue}`}><h2>Jami xodimlar</h2><p>{xodimStats.xodimlar} ta</p></div>
          <div className={`${styles.card} ${styles.purple}`}><h2>Jami guruhlar</h2><p>{xodimStats.guruhlar} ta</p></div>
          <div className={`${styles.card} ${styles.green}`}><h2>Bugun kelgan</h2><p>{todayAttendanceStats.kelgan} ta</p></div>
          <div className={`${styles.card} ${styles.red}`}><h2>Bugun kelmagan</h2><p>{todayAttendanceStats.kelmagan} ta</p></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',marginTop:'30px' }}>
  <div>
      <h2 style={{ marginBottom: '0.5rem' }}>
        📊 Oylar bo‘yicha daromadlar statistikasi ({year})
      </h2>
   

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={daromadData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="oy" />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', borderColor: '#ddd' }}
            labelStyle={{ fontWeight: 'bold' }}
            formatter={(value, name) => {
              const labels = {
                naqt: 'Naqd',
                karta: 'Karta',
                prichislena: 'O‘tkazma',
                naqt_prichislena: 'Naqd o‘tkazma'
              };
              return [value, labels[name] || name];
            }}
          />
          <Legend
            formatter={(value) => {
              const labels = {
                naqt: 'Naqd',
                karta: 'Karta',
                prichislena: 'O‘tkazma',
                naqt_prichislena: 'Naqd o‘tkazma'
              };
              return labels[value] || value;
            }}
          />
          <Bar dataKey="naqt" name="Naqd" fill="#81c784" radius={[5, 5, 0, 0]} />
          <Bar dataKey="karta" name="Karta" fill="#64b5f6" radius={[5, 5, 0, 0]} />
          <Bar dataKey="prichislena" name="O‘tkazma" fill="#ffb74d" radius={[5, 5, 0, 0]} />
          <Bar dataKey="naqt_prichislena" name="Naqd o‘tkazma" fill="#ba68c8" radius={[5, 5, 0, 0]} />
       <Bar dataKey="jami" name="Jami" fill="#000" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Darslar soni</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={darslarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="oy" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="darslar" fill={colors.darslar} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Davomat statistikasi</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={davomatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="oy" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="holati1" name="✅" fill={colors.holati1} />
                <Bar dataKey="holati2" name="❌" fill={colors.holati2} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Hozirgi oy kunlik davomat</h2>
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
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <h2>Guruhlar KPI statistikasi</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label>Oy tanlang: </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ padding: '4px 8px' }}
              >
                {[
                  '01','02','03','04','05','06',
                  '07','08','09','10','11','12'
                ].map((m, idx) => (
                  <option key={m} value={m}>
                    {['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentyabr','Oktyabr','Noyabr','Dekabr'][idx]}
                  </option>
                ))}
              </select>
            </div>

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
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}
