'use client';

import { useState } from 'react';
import styles from '../styles/AdminTable.module.css';

export default function AdminTable({
  title,
  columns,
  columnTitles = {},
  data,
  onDelete,
  onEdit,
  customRenderers = {}  // ✅ Yangi prop: ustunlar uchun maxsus ko‘rinish
}) {
  const itemsPerPage = 20;
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
      <div className={styles.adminTable__wrapper}>
        <table className={styles.adminTable__table}>
          <thead className={styles.adminTable__thead}>
            <tr>   <th className={styles.adminTable__th}>Amallar</th>
              <th className={styles.adminTable__th}>№</th>
              {columns.map((col, idx) => (
                <th key={idx} className={styles.adminTable__th}>
                  {columnTitles[col] || col}
                </th>
              ))}
           
            </tr>
          </thead>
          <tbody className={styles.adminTable__tbody}>
            {currentData.map((row, i) => (
              <tr key={i} className={styles.adminTable__tr}>
                 <td style={{background:'rgba(0, 255, 255, 0.404)',width:'80px'}} className={styles.adminTable__td}>
                  <button className={styles.editBtn} onClick={() => onEdit(row)}>✏️</button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(row.id)}>🗑️</button>
                </td>
                <td className={styles.adminTable__td}>
                  {(startIndex + i + 1).toString()}
                </td>

                {columns.map((col, j) => {
                  // ✅ Custom renderer ishlatilsa, uni chiqarish
                  if (customRenderers[col]) {
                    return (
                      <td key={j} className={styles.adminTable__td}>
                        {customRenderers[col](row)}
                      </td>
                    );
                  }

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
