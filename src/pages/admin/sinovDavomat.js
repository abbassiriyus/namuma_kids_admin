// DavomatPage.jsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import url from '@/host/host';
import LayoutComponent from '@/components/LayoutComponent';
import DavomatModal from '@/components/DavomatModal';
import styles from '@/styles/DavomatPage.module.css';

export default function DavomatPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [bolalar, setBolalar] = useState([]);
  const [filteredBolalar, setFilteredBolalar] = useState([]);
  const [darsKunlar, setDarsKunlar] = useState([]);
  const [davomatlar, setDavomatlar] = useState([]);
  const [guruhlar, setGuruhlar] = useState([]);
  const [selectedGuruh, setSelectedGuruh] = useState('');
  const [selected, setSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnmarkedOnly, setFilterUnmarkedOnly] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchGuruhlar = async () => {
    const res = await axios.get(`${url}/guruh`, authHeader);
    setGuruhlar(res.data);
  };

  const fetchDarsKunlar = async () => {
    const [year, monthNum] = month.split('-');
    const res = await axios.get(`${url}/bola_kun_all?year=${year}&month=${monthNum}`, authHeader);
    const sorted = res.data
      .filter(d => d.sana.startsWith(month))
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));
    setDarsKunlar(sorted);
  };

  const fetchDavomatlar = async () => {
    const res = await axios.get(`${url}/bola_kun_prp`, authHeader);
    setDavomatlar(res.data);
  };

  const fetchBolalar = async (selectedMonth) => {
    try {
      const [year, monthNum] = selectedMonth.split('-');
      const [bolalarRes, davomatRes, darsSanaRes] = await Promise.all([
        axios.get(`${url}/bola_prp`, authHeader),
        axios.get(`${url}/bola_kun_prp`, authHeader),
        axios.get(`${url}/bola_kun_all?year=${year}&month=${monthNum}`, authHeader),
      ]);

      const allBolalar = bolalarRes.data;
      const allDavomat = davomatRes.data;
      const allDarsSana = darsSanaRes.data;

      const thisMonthDarsIds = allDarsSana
        .filter(d => d.sana.startsWith(selectedMonth))
        .map(d => d.id);

      const monthBolaIds = allDavomat
        .filter(bk => thisMonthDarsIds.includes(bk.darssana_id))
        .map(bk => bk.bola_id);

      const visibleBolalar = allBolalar.filter(bola =>
        bola.is_active || monthBolaIds.includes(bola.id)
      );

      setBolalar(visibleBolalar);
      filterBolalar(visibleBolalar, selectedGuruh, searchQuery, filterUnmarkedOnly);
    } catch (err) {
      console.error('Xatolik bolalarni olishda:', err);
    }
  };

  const filterBolalar = (list, guruhId, search, unmarkedOnly) => {
    let result = list;

    if (guruhId) {
      result = result.filter(bola => bola.guruh_id == guruhId);
    }

    if (search) {
      result = result.filter(bola =>
        bola.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (unmarkedOnly) {
      const today = new Date().toISOString().slice(0, 10);
      const todayLesson = darsKunlar.find(d => d.sana.slice(0, 10) === today);
      if (todayLesson) {
        result = result.filter(bola => {
          return !davomatlar.find(
            d => d.bola_id === bola.id && d.darssana_id === todayLesson.id
          );
        });
      }
    }

    result = result.sort((a, b) =>
      a.username.localeCompare(b.username, 'uz', { sensitivity: 'base' })
    );

    setFilteredBolalar(result);
  };

  const updateBolaStage = async (bolaId, newStage) => {
    try {
      await axios.put(`${url}/bola_prp/${bolaId}/next-stage`, {
        holati: newStage,
      }, authHeader);
      fetchBolalar(month);
    } catch (err) {
      console.error('Bosqichni yangilashda xatolik:', err);
    }
  };

  useEffect(() => {
    fetchGuruhlar();
    fetchDavomatlar();
  }, []);

  useEffect(() => {
    fetchDarsKunlar();
    fetchBolalar(month);
  }, [month]);

  return (
    <LayoutComponent>
      <div className={styles.header}>
        <h2 className={styles.title}>Bog‘cha Dars Kunlari Davomat</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={styles.monthInput}
        />
        <input
          type="text"
          placeholder="Ism yoki familiya..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedGuruh}
          onChange={(e) => setSelectedGuruh(e.target.value)}
          className={styles.select}
        >
          <option value="">Barcha guruhlar</option>
          {guruhlar.map(guruh => (
            <option key={guruh.id} value={guruh.id}>{guruh.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
            <th  style={{ textAlign: 'center',position:'sticky',left:'0px',zIndex:222 }}>№</th>
              <th style={{position:'sticky',left:'40px',zIndex:22222}}>Ism Familiya</th>
              <th>Bosqich</th>
              {darsKunlar.map(d => (
                <th key={d.id}>{d.sana.slice(8, 10)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredBolalar.map((bola, index) => (
              <tr key={bola.id}>
                <td style={{ textAlign: 'center',position:'sticky',left:'0px',background:"aqua",zIndex:222 }}>{index + 1}</td>
                  <td style={{position:'sticky',left:'40px',background:"aqua",zIndex:22222}}>{bola.username}</td>
                  
                <td>
                  <select
                  className={styles.selectStage}
                    value={bola.holati || ''}
                    onChange={(e) => updateBolaStage(bola.id, e.target.value)}
                  >
                    <option value="">Tanlang</option>
                    <option value="boshlangich">Boshlang‘ich</option>
                    <option value="qabul_qilindi">Qabul qilindi</option>
                    <option value="kelmay_qoydi">Kelmay qo‘ydi</option>
                  </select>
                </td>
                {darsKunlar.map(d => {
                  const entry = davomatlar.find(
                    v => v.bola_id === bola.id && v.darssana_id === d.id
                  );
                  const mark = entry?.holati === 1 ? '✅' : entry?.holati === 2 ? '❌' : '';
                  return (
                    <td
                      key={d.id}
                      style={{ cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => setSelected({ bola, dars: d })}
                    >
                      {mark}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DavomatModal
          bola={selected.bola}
          sana={selected.dars.sana}
          onClose={() => setSelected(null)}
          onSelect={async (holati) => {
            const existing = davomatlar.find(d => d.bola_id === selected.bola.id && d.darssana_id === selected.dars.id);
            const endpoint = existing ? `${url}/bola_kun_prp/${existing.id}` : `${url}/bola_kun_prp`;
            const method = existing ? 'put' : 'post';

            try {
              await axios[method](endpoint, {
                bola_id: selected.bola.id,
                darssana_id: selected.dars.id,
                holati,
              }, authHeader);
              await fetchDavomatlar();
              setSelected(null);
            } catch (err) {
              console.error('Davomat xatolik:', err);
            }
          }}
        />
      )}
    </LayoutComponent>
  );
}
