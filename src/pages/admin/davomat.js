'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import url from '@/host/host';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
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
    const res = await axios.get(`${url}/bola_kuni_all?month=${month}`, authHeader);
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
    const apiUrl = editId ? `${url}/bola_kuni_all/${editId}` : `${url}/bola_kuni_all`;

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
    await axios.delete(`${url}/bola_kuni_all/${id}`, authHeader);
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

  const handleCheckboxChange = async (bola, dars) => {
    const existing = davomatlar.find(d => d.bola_id === bola.id && d.darssana_id === dars.id);
    const holati = existing?.holati === 1 ? 2 : 1;

    const payload = {
      bola_id: bola.id,
      darssana_id: dars.id,
      holati
    };

    const endpoint = existing ? `${url}/bola_kun/${existing.id}` : `${url}/bola_kun`;
    const method = existing ? 'put' : 'post';

    await axios[method](endpoint, payload, authHeader);
    await fetchDavomatlar();
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
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flexGrow: 1 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
            Bog‘cha Dars Kunlari Jurnali
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '160px' }}>
          <label style={{ marginBottom: '6px', fontWeight: '600', color: '#555' }}>Oy tanlang:</label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1.5px solid #ccc',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: '#fff'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
          <label style={{ marginBottom: '6px', fontWeight: '600', color: '#555' }}>Guruh bo‘yicha filter:</label>
          <select
            value={selectedGuruh}
            onChange={handleGuruhChange}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1.5px solid #ccc',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#fff'
            }}
          >
            <option value="">Barchasi</option>
            {guruhlar.map(guruh => (
              <option key={guruh.id} value={guruh.id}>{guruh.name}</option>
            ))}
          </select>
        </div>
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
                    const checked = entry?.holati === 1;

                    return (
                      <td key={d.id} style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCheckboxChange(bola, d)}
                        />
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
    </LayoutComponent>
  );
}
