'use client';
import styles from '@/styles/Modal.module.css';

export default function DavomatModal({ onClose, onSelect, bola, sana }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>{bola.username} — {sana}</h3>
        <div className={styles.buttons}>
          <button className={styles.bor} onClick={() => onSelect(1)}>✅ Bor</button>
          <button className={styles.yoq} onClick={() => onSelect(2)}>❌ Yo‘q</button>
        </div>
        <button className={styles.cancel} onClick={onClose}>Bekor qilish</button>
      </div>
    </div>
  );
}
