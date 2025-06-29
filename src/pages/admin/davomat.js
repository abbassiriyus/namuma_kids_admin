'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import url from '@/host/host';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import DavomatModal from '@/components/DavomatModal';
import styles from '@/styles/DavomatPage.module.css';

export default function JurnalPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [bolalar, setBolalar] = useState([]);
  const [filteredBolalar, setFilteredBolalar] = useState([]);
  const [darsKunlar, setDarsKunlar] = useState([]);
  const [davomatlar, setDavomatlar] = useState([]);
  const [guruhlar, setGuruhlar] = useState([]);
  const [selectedGuruh, setSelectedGuruh] = useState('');
  const [newSana, setNewSana] = useState('');
  const [newMavzu, setNewMavzu] = useState('');
  const [editId, setEditId] = useState(null);
  const [selected, setSelected] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBolalar = async () => {
    const res = await axios.get(`${url}/bola?is_active=true`, authHeader);
    setBolalar(res.data);
    setFilteredBolalar(res.data);
  };

  const fetchGuruhlar = async () => {
    const res = await axios.get(`${url}/guruh`, authHeader);
    setGuruhlar(res.data);
  };

  const fetchDarsKunlar = async () => {
    const res = await axios.get(`${url}/darssana?month=${month}`, authHeader);
    const sorted = res.data
      .filter(d => d.sana.startsWith(month))
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));
    setDarsKunlar(sorted);
  };

  const fetchDavomatlar = async () => {
    const res = await axios.get(`${url}/bola_kun`, authHeader);
    setDavomatlar(res.data);
  };

  const handleAddOrUpdate = async () => {
    if (!newSana || !newMavzu) return;

    const originalDate = new Date(newSana);
    originalDate.setDate(originalDate.getDate() + 1);
    const adjustedDate = originalDate.toISOString().slice(0, 10);

    const payload = { sana: adjustedDate, mavzu: newMavzu };
    const apiUrl = editId ? `${url}/darssana/${editId}` : `${url}/darssana`;

    await axios[editId ? 'put' : 'post'](apiUrl, payload, authHeader);

    setNewSana('');
    setNewMavzu('');
    setEditId(null);
    fetchDarsKunlar();
  };

  const handleEdit = (d) => {
    setNewSana(d.sana.slice(0, 10));
    setNewMavzu(d.mavzu);
    setEditId(d.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Rostdan ham o‘chirmoqchimisiz?")) return;
    await axios.delete(`${url}/darssana/${id}`, authHeader);
    fetchDarsKunlar();
  };

  const handleGuruhChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedGuruh(selectedValue);
    
    if (selectedValue) {
      const filtered = bolalar.filter(bola => bola.guruh_id == selectedValue);
      setFilteredBolalar(filtered);
    } else {
      setFilteredBolalar(bolalar);
    }
  };

  const openModal = (bola, dars) => {
    setSelected({ bola, dars });
  };

  const handleDavomatSelect = async (holati) => {
    if (!selected) return;

    const { bola, dars } = selected;
    const existing = davomatlar.find(d => d.bola_id === bola.id && d.darssana_id === dars.id);

    const payload = {
      bola_id: bola.id,
      darssana_id: dars.id,
      holati
    };
    const endpoint = existing ? `${url}/bola_kun/${existing.id}` : `${url}/bola_kun`;
    const method = existing ? 'put' : 'post';

    await axios[method](endpoint, payload, authHeader);
    await fetchDavomatlar();
    setSelected(null);
  };

  useEffect(() => {
    fetchGuruhlar();
    fetchBolalar();
    fetchDavomatlar();
  }, []);

  useEffect(() => {
    fetchDarsKunlar();
  }, [month]);

  return (
    <LayoutComponent>
      <div className={styles.header}>
        <h2 className={styles.title}>Bog‘cha Dars Kunlari Jurnali</h2>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className={styles.monthInput}
        />
        <select value={selectedGuruh} onChange={handleGuruhChange} className={styles.select}>
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
              <th>Ism Familiya</th>
              {darsKunlar.map(d => (
                <th key={d.id}>{d.sana.slice(8, 10)}</th>
              ))}
              <th>✅ Bor</th>
              <th>❌ Yo‘q</th>
            </tr>
          </thead>
          <tbody>
            {filteredBolalar.map(bola => {
              const bolaDavomat = davomatlar.filter(v =>
                v.bola_id == bola.id &&
                darsKunlar.some(d => d.id === v.darssana_id)
              );
              const bor = bolaDavomat.filter(v => v.holati === 1).length;
              const yoq = bolaDavomat.filter(v => v.holati === 2).length;

              return (
                <tr key={bola.id}>
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

      <div className={styles.form}>
        <h3>{editId ? "Darsni tahrirlash" : "Yangi dars qo‘shish"}</h3>
        <input
          type="date"
          value={newSana}
          onChange={e => setNewSana(e.target.value)}
        />
        <input
          type="text"
          value={newMavzu}
          onChange={e => setNewMavzu(e.target.value)}
          placeholder="Mavzu nomi"
        />
        <button onClick={handleAddOrUpdate}>
          {editId ? "Yangilash" : "Qo‘shish"}
        </button>
        {editId && (
          <button onClick={() => {
            setEditId(null);
            setNewSana('');
            setNewMavzu('');
          }}>
            Bekor qilish
          </button>
        )}
      </div>

      <AdminTable
        title="Darslar ro‘yxati"
        columns={['sana', 'mavzu']}
        columnTitles={{ sana: 'Sana', mavzu: 'Mavzu' }}
        data={darsKunlar}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {selected && (
        <DavomatModal
          bola={selected.bola}
          sana={selected.dars.sana}
          onClose={() => setSelected(null)}
          onSelect={handleDavomatSelect}
        />
      )}
    </LayoutComponent>
  );
}