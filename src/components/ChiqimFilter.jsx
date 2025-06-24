// components/ChiqimFilter.js
import React from 'react';
import styles from '@/styles/ChiqimFilter.module.css';

export default function ChiqimFilter({ filter, onChange, onSubmit, onExport }) {
  return (
    <div className={styles.filterContainer}>
      <input
        type="date"
        name="startDate"
        value={filter.startDate}
        onChange={onChange}
        className={styles.input}
      />

      <input
        type="date"
        name="endDate"
        value={filter.endDate}
        onChange={onChange}
        className={styles.input}
      />

      <select
        name="productId"
        value={filter.productId}
        onChange={onChange}
        className={styles.input}
      >
        <option value="">Barcha mahsulotlar</option>
     {(filter.products || []).map(p => (
  <option key={p.id} value={p.id}>{p.nomi}</option>
))}

      </select>

      <button onClick={onSubmit} className={styles.button}>🔍 Filterlash</button>
      <button onClick={onExport} className={styles.button} style={{ backgroundColor: '#2ecc71' }}>📁 Filega aylantirish</button>
    </div>
  );
}
