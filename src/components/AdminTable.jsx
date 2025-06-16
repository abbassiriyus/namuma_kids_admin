import styles from '../styles/AdminTable.module.css';

export default function AdminTable({ title, columns, data }) {
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
            {data.map((row, i) => (
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
    </div>
  );
}
