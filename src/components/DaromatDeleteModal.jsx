'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/BolaModal.module.css';
import axios from 'axios';
import url from '@/host/host';

export default function DaromatDeleteModal({ open, onClose, bolaId, month, onDeleted }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!open || !bolaId || !month) return;

    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get(`${url}/daromat_type/bola/${bolaId}/${month}`, { headers });
        setItems(res.data || []);
      } catch (err) {
        console.error("Yuklashda xatolik:", err);
      }
    };

    fetch();
  }, [open, bolaId, month]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`${url}/daromat_type/${id}`, { headers });

      setItems(items.filter(item => item.id !== id));
      onDeleted?.(); // sahifani yangilash uchun
    } catch (err) {
      console.error('O‘chirishda xatolik:', err);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Daromad yozuvlari ({month})</h3>
        {items.length === 0 ? (
          <p>Hech narsa topilmadi</p>
        ) : (
          <ul style={{ maxHeight: '300px', overflowY: 'auto', padding: 0 }}>
            {items.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>
                  Sana: {item.sana} | Naqt: {item.naqt} | Karta: {item.karta} | Prichislena: {item.prichislena}
                </span>
                <button onClick={() => handleDelete(item.id)} style={{ marginLeft: 10, color: 'red' }}>🗑️</button>
              </li>
            ))}
          </ul>
        )}
        <div className={styles.modal__buttons}>
          <button onClick={onClose}>Yopish</button>
        </div>
      </div>
    </div>
  );
}
