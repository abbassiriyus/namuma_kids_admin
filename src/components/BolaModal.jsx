import { useState, useEffect } from 'react';
import styles from '@/styles/BolaModal.module.css';

export default function BolaModal({ bola, onClose, onSave, guruhlar = [] }) {
  const [formData, setFormData] = useState(bola || {});

  useEffect(() => {
    for (let j = 0; j < guruhlar.length; j++) {
      if (typeof formData.guruh_id === 'string' && formData.guruh_id.includes(guruhlar[j].name)) {
        formData.guruh_id = guruhlar[j].id
      }
    }
    setFormData(bola || {});
  }, [bola]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modal__content}>
        <h3 className={styles.modal__title}>Tarbiyalanuvchini tahrirlash</h3>
        <div className={styles.modal__form}>
          <input name="username" value={formData.username || ''} onChange={handleChange} placeholder="F.I.Sh" />
          <input name="metrka" value={formData.metrka || ''} onChange={handleChange} placeholder="Metirka raqami" />
          <select name="guruh_id" value={formData.guruh_id1 || ''} onChange={handleChange}>
            <option value="">Guruhni tanlang</option>
            {guruhlar.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <input name="tugilgan_kun" type="date" value={formData.tugilgan_kun?.slice(0, 10) || ''} onChange={handleChange} />
          <input name="oylik_toliv" type="number" value={formData.oylik_toliv || ''} onChange={handleChange} placeholder="Oylik to‘lov" />
          <input name="balans" type="number" value={formData.balans || ''} onChange={handleChange} placeholder="Balans" />
          <input name="holati" value={formData.holati || ''} onChange={handleChange} placeholder="Holati" />

          <h4>Otasining ma'lumotlari</h4>
          <input name="ota_fish" value={formData.ota_fish || ''} onChange={handleChange} placeholder="Ota F.I.Sh" />
          <input name="ota_phone" value={formData.ota_phone || ''} onChange={handleChange} placeholder="Ota tel" />
          <input name="ota_pasport" value={formData.ota_pasport || ''} onChange={handleChange} placeholder="Ota pasport" />

          <h4>Onasining ma'lumotlari</h4>
          <input name="ona_fish" value={formData.ona_fish || ''} onChange={handleChange} placeholder="Ona F.I.Sh" />
          <input name="ona_phone" value={formData.ona_phone || ''} onChange={handleChange} placeholder="Ona tel" />
          <input name="ona_pasport" value={formData.ona_pasport || ''} onChange={handleChange} placeholder="Ona pasport" />

          <input name="qoshimcha_phone" value={formData.qoshimcha_phone || ''} onChange={handleChange} placeholder="Qo‘shimcha telefon" />
          <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Manzil" />
          <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Izoh" />
        </div>
        <div className={styles.modal__buttons}>
          <button onClick={handleSubmit}>✅ Saqlash</button>
          <button onClick={onClose}>❌ Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}
