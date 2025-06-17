'use client';

import { useState } from 'react';
import styles from '../styles/AdminTable.module.css';

export default function AdminTable({ title, columns, data }) {
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
      <h2 className={styles.adminTable__title}>{title}</h2>
      <div className={styles.adminTable__wrapper}>
        <table className={styles.adminTable__table}>
          <thead className={styles.adminTable__thead}>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={styles.adminTable__th}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.adminTable__tbody}>
            {currentData.map((row, i) => (
              <tr key={i} className={styles.adminTable__tr}>
                {columns.map((col, j) => (
                  <td key={j} className={styles.adminTable__td}>
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Oldingi
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Keyingi
        </button>
      </div>
    </div>
  );
}
