'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import url from '@/host/host';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import DarsModal from '@/components/DarsModal'; // yangi modal import
import styles from '@/styles/DavomatPage.module.css';

export default function DarslarPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [darsKunlar, setDarsKunlar] = useState([]);
  const [newSana, setNewSana] = useState('');
  const [newMavzu, setNewMavzu] = useState('');
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDarsKunlar = async () => {
    const res = await axios.get(`${url}/darssana?month=${month}`, authHeader);
    const sorted = res.data
      .filter(d => d.sana.startsWith(month))
      .sort((a, b) => new Date(a.sana) - new Date(b.sana));
    setDarsKunlar(sorted);
  };

  const handleSave = async () => {
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
    setShowModal(false);
    fetchDarsKunlar();
  };

  const handleEdit = (d) => {
    setNewSana(d.sana.slice(0, 10));
    setNewMavzu(d.mavzu);
    setEditId(d.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Rostdan ham o‘chirmoqchimisiz?")) return;
    await axios.delete(`${url}/darssana/${id}`, authHeader);
    fetchDarsKunlar();
  };

  useEffect(() => {
    fetchDarsKunlar();
  }, [month]);

  return (
    <LayoutComponent>
   <div className={styles.header}>
    <div className={styles.headerLeft}>
      <h2 className={styles.title}>📚 Darslar ro‘yxati</h2>
    </div>
    <div className={styles.headerRight}>
      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
        className={styles.monthInput}
      />
      <button
        className={styles.addButton}
        onClick={() => {
          setNewSana('');
          setNewMavzu('');
          setEditId(null);
          setShowModal(true);
        }}
      >
        ➕ Yangi dars
      </button>
    </div>
  </div>

      <AdminTable
        title=""
        columns={['sana', 'mavzu']}
        columnTitles={{ sana: 'Sana', mavzu: 'Mavzu' }}
        data={darsKunlar}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {showModal && (
        <DarsModal
          sana={newSana}
          mavzu={newMavzu}
          setSana={setNewSana}
          setMavzu={setNewMavzu}
          isEdit={!!editId}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditId(null);
            setNewSana('');
            setNewMavzu('');
          }}
        />
      )}
    </LayoutComponent>
  );
}
