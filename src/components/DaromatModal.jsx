'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/BolaModal.module.css';
import axios from 'axios';
import url from '@/host/host';

export default function DaromatModal({ open, onClose, bola, month, onSaved }) {
  const [formData, setFormData] = useState({
    naqt: '',
    karta: '',
    prichislena: '',
  });
  const getNextMonthDate = (monthStr) => {
    const [year, mon] = monthStr.split('-').map(Number);
    const nextMonth = new Date(year, mon); // misol: 2024-06 => 2024-07
    return nextMonth.toISOString().slice(0, 10); // YYYY-MM-01
  };
  const sana = getNextMonthDate(month); // bu oldin ishlatilgan function, pastda aniqlanadi

  useEffect(() => {
    if (bola && open) {
      const fetch = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${url}/daromat_type/bola/${bola.id}/${month}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.length > 0) {
            const { naqt, karta, prichislena } = res.data[0];
            setFormData({ naqt, karta, prichislena });
          } else {
            setFormData({ naqt: '', karta: '', prichislena: '' });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetch();
    }
  }, [open, bola, month]);



  const handleSave = async () => {
    const token = localStorage.getItem('token');

    try {
      const payload = {
        bola_id: bola.id,
        sana,
        naqt: parseInt(formData.naqt) || 0,
        karta: parseInt(formData.karta) || 0,
        prichislena: parseInt(formData.prichislena) || 0,
      };

      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${url}/daromat_type`, payload, { headers });

      onSaved();
      onClose();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
    }
  };

  if (!open || !bola) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>{bola.fish} — {month} oyi uchun to‘lov</h3>

        <input
          type="text"
          value={sana}
          readOnly
          className={styles.disabledInput}
          style={{ backgroundColor: '#eee', marginBottom: '12px' }}
        />

        <input
          type="number"
          placeholder="Naqt"
          value={formData.naqt}
          onChange={(e) => setFormData({ ...formData, naqt: e.target.value })}
        />
        <input
          type="number"
          placeholder="Karta"
          value={formData.karta}
          onChange={(e) => setFormData({ ...formData, karta: e.target.value })}
        />
        <input
          type="number"
          placeholder="Prichislena"
          value={formData.prichislena}
          onChange={(e) => setFormData({ ...formData, prichislena: e.target.value })}
        />
        <div className={styles.modal__buttons}>
          <button onClick={handleSave}>💾 Saqlash</button>
          <button onClick={onClose}>❌ Yopish</button>
        </div>
      </div>
    </div>
  );
}
