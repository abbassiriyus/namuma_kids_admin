'use client';

import { useState } from 'react';
import styles from '../styles/AdminTable.module.css';

export default function AdminTable({ title, columns, columnTitles = {}, data, onDelete, onEdit }) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.adminTable}>
      {/* Jadval sarlavhasi */}
      {title && <h2 className={styles.adminTable__title}>{title}</h2>}

      <div className={styles.adminTable__wrapper}>
        <table className={styles.adminTable__table}>
          <thead className={styles.adminTable__thead}>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={styles.adminTable__th}>
                  {columnTitles[col] || col}
                </th>
              ))}
              <th className={styles.adminTable__th}>Amallar</th>
            </tr>
          </thead>
          <tbody className={styles.adminTable__tbody}>
            {currentData.map((row, i) => (
              <tr key={i} className={styles.adminTable__tr}>
                {columns.map((col, j) => {
                  let value = row[col];

                  // Sana ustunini formatlash
                  if (col === 'sana' && value) {
                    const dateObj = new Date(value);
                    const day = dateObj.getDate().toString().padStart(2, '0');
                    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                    const year = dateObj.getFullYear();
                    value = `${day}.${month}.${year}`;
                  }

                  return (
                    <td key={j} className={styles.adminTable__td}>
                      {value}
                    </td>
                  );
                })}
                <td className={styles.adminTable__td}>
                  <button className={styles.editBtn} onClick={() => onEdit(row)}>✏️</button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(row.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          ⬅️ Oldingi
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Keyingi ➡️
        </button>
      </div>
    </div>
  );
}
