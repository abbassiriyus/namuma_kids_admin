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
    const res = await axios.get(`${url}/bola_kun`, authHeader);
    setDavomatlar(res.data);
  };

  const fetchBolalar = async (selectedMonth) => {
    try {
      const [year, monthNum] = selectedMonth.split('-');
      const [bolalarRes, davomatRes, darsSanaRes] = await Promise.all([
        axios.get(`${url}/bola`, authHeader),
        axios.get(`${url}/bola_kun`, authHeader),
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
      filterBolalar(visibleBolalar, selectedGuruh, searchQuery);
    } catch (err) {
      console.error('Xatolik bolalarni olishda:', err);
    }
  };

  const filterBolalar = (list, guruhId, search) => {
    let result = list;
    if (guruhId) {
      result = result.filter(bola => bola.guruh_id == guruhId);
    }
    if (search) {
      result = result.filter(bola =>
        bola.username.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredBolalar(result);
  };

  const handleGuruhChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedGuruh(selectedValue);
    filterBolalar(bolalar, selectedValue, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterBolalar(bolalar, selectedGuruh, query);
  };

  const openModal = (bola, dars) => {
    setErrorMessage('');
    setSelected({ bola, dars });
  };

  const handleDavomatSelect = async (holati) => {
    if (!selected) return;

    const { bola, dars } = selected;
    const existing = davomatlar.find(d => d.bola_id === bola.id && d.darssana_id === dars.id);

    const payload = { bola_id: bola.id, darssana_id: dars.id, holati };
    const endpoint = existing ? `${url}/bola_kun/${existing.id}` : `${url}/bola_kun`;
    const method = existing ? 'put' : 'post';

    try {
      setErrorMessage('');
      await axios[method](endpoint, payload, authHeader);
      await fetchDavomatlar();
      setSelected(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMessage("Bunday amalni bajarib bo‘lmaydi");
      } else {
        console.error('Xatolik:', err);
      }
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

  useEffect(() => {
    if (errorMessage) setSelected(null);
  }, [errorMessage]);

  return (
    <LayoutComponent>
      <div className={styles.header}>
        <h2 className={styles.title}>Bog‘cha Dars Kunlari Davomat</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => {
            const newMonth = e.target.value;
            setMonth(newMonth);
            fetchBolalar(newMonth);
          }}
          className={styles.monthInput}
        />
        <input
          type="text"
          placeholder="Ism yoki familiya..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <select
          value={selectedGuruh}
          onChange={handleGuruhChange}
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
              <th>№</th>
              <th>Ism Familiya</th>
              {darsKunlar.map(d => (
                <th key={d.id}>{d.sana.slice(8, 10)}</th>
              ))}
              <th>✅ Bor</th>
              <th>❌ Yo‘q</th>
            </tr>
          </thead>
          <tbody>
            {filteredBolalar.map((bola, index) => {
              const bolaDavomat = davomatlar.filter(
                v => v.bola_id === bola.id &&
                     darsKunlar.some(d => d.id === v.darssana_id)
              );

              const bor = bolaDavomat.filter(v => v.holati === 1).length;
              const yoq = bolaDavomat.filter(v => v.holati === 2).length;

              return (
                <tr key={bola.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>{bola.username}</td>
                  {darsKunlar.map(d => {
                    const entry = davomatlar.find(
                      v => v.bola_id === bola.id && v.darssana_id === d.id
                    );
                    const mark = entry?.holati === 1 ? '✅' : entry?.holati === 2 ? '❌' : '';
                    return (
                      <td
                        key={d.id}
                        style={{ cursor: 'pointer', textAlign: 'center' }}
                        onClick={() => openModal(bola, d)}
                      >
                        {mark}
                      </td>
                    );
                  })}
                  <td>{bor}</td>
                  <td>{yoq}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <DavomatModal
          bola={selected.bola}
          sana={selected.dars.sana}
          onClose={() => setSelected(null)}
          onSelect={handleDavomatSelect}
        />
      )}

      {errorMessage && (
        <div className={styles.errorModal}>
          <div className={styles.errorContent}>
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage('')}>Yopish</button>
          </div>
        </div>
      )}
    </LayoutComponent>
  );
}
