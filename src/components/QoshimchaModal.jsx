import { useEffect, useState } from 'react';
import styles from '../styles/BolaModal.module.css';

export default function QoshimchaModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({ price: '', description: '' });

  useEffect(() => {
    if (isOpen) {
      setForm(initialData || { price: '', description: '' });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (form.price) {
      onSave(form);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modal__content}>
        <h3 className={styles.modal__title}>Qo‘shimcha chiqim</h3>
        <div className={styles.modal__form}>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Narxi"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Izoh"
          />
        </div>
        <div className={styles.modal__buttons}>
          <button onClick={handleSubmit}>✅ Saqlash</button>
          <button onClick={onClose}>❌ Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}
