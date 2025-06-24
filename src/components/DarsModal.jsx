'use client';
import styles from '@/styles/Modal.module.css';

export default function DarsModal({ onClose, onSave, sana, mavzu, setSana, setMavzu, isEdit }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>{isEdit ? 'Darsni tahrirlash' : 'Yangi dars qo‘shish'}</h3>
        <input
          type="date"
          value={sana}
          onChange={e => setSana(e.target.value)}
        />
        <input
          type="text"
          value={mavzu}
          onChange={e => setMavzu(e.target.value)}
          placeholder="Mavzu nomi"
        />
        <div className={styles.buttons}>
          <button className={styles.bor} onClick={onSave}>
            {isEdit ? 'Yangilash' : 'Qo‘shish'}
          </button>
          <button className={styles.cancel} onClick={onClose}>Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}
