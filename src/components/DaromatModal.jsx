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
    naqt_prichislena: '',
  });

  const getNextMonthDate = (monthStr) => {
    const [year, mon] = monthStr.split('-').map(Number);
    const nextMonth = new Date(year, mon);
    return nextMonth.toISOString().slice(0, 10);
  };

  const sana = getNextMonthDate(month);

  useEffect(() => {
    if (bola && open) {
      const fetch = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${url}/daromat_type/bola/${bola.id}/${month}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.length > 0) {
            const { naqt, karta, prichislena, naqt_prichislena } = res.data[0];
            setFormData({
              naqt,
              karta,
              prichislena,
              naqt_prichislena: naqt_prichislena || '',
            });
          } else {
            setFormData({
              naqt: '',
              karta: '',
              prichislena: '',
              naqt_prichislena: '',
            });
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
        naqt_prichislena: parseInt(formData.naqt_prichislena) || 0,
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

        <label>Sana (automatik):</label>
        <input
          type="text"
          value={sana}
          readOnly
          className={styles.disabledInput}
          style={{ backgroundColor: '#eee', marginBottom: '12px' }}
        />

        <label>Naqt to‘lov:</label>
        <input
          type="number"
          placeholder="Naqt"
          value={formData.naqt}
          onChange={(e) => setFormData({ ...formData, naqt: e.target.value })}
        />

        <label>Karta orqali to‘lov:</label>
        <input
          type="number"
          placeholder="Karta"
          value={formData.karta}
          onChange={(e) => setFormData({ ...formData, karta: e.target.value })}
        />

        <label>Bank orqali to‘lov:</label>
        <input
          type="number"
          placeholder="Bank to`lov"
          value={formData.prichislena}
          onChange={(e) => setFormData({ ...formData, prichislena: e.target.value })}
        />

        <label>Bank orqali naqt tarzda:</label>
        <input
          type="number"
          placeholder="Bank(Naqt) to`lov"
          value={formData.naqt_prichislena}
          onChange={(e) => setFormData({ ...formData, naqt_prichislena: e.target.value })}
        />

        <div className={styles.modal__buttons}>
          <button onClick={handleSave}>💾 Saqlash</button>
          <button onClick={onClose}>❌ Yopish</button>
        </div>
      </div>
    </div>
  );
}
