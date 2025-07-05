import { useState, useEffect } from 'react';
import styles from '@/styles/BolaModal.module.css';
import axios from 'axios';
import url from '@/host/host';

export default function SkladKirimModal({ isOpen, onClose, onSave, products = [], initialData = null }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [rows, setRows] = useState([{ sklad_product_id: '', hajm: '', narx: '', description: '' }]);
  const [hajmMap, setHajmMap] = useState({}); // product_id => mavjud hajm

  // 🔁 initialData ni yuklash
  useEffect(() => {
    if (initialData) {
      setRows([{ ...initialData }]);
    } else {
      setRows([{ sklad_product_id: '', hajm: '', narx: '', description: '' }]);
    }
  }, [initialData]);

  // 🔁 Modal ochilganda hajm ma'lumotlarini yuklash
  useEffect(() => {
    if (isOpen) {
      calculateHajmlar();
    }
  }, [isOpen]);

  // ✅ Hajmlar hisoblash: Kirimlar - Chiqimlar
 const calculateHajmlar = async () => {
  try {
    const [productRes, kirimRes, chiqimRes] = await Promise.all([
      axios.get(`${url}/sklad_product`, authHeader),
      axios.get(`${url}/sklad_product_taktic`, authHeader),
      axios.get(`${url}/chiqim_ombor`, authHeader),
    ]);

    const kirimMap = {};
    kirimRes.data.forEach(k => {
      const id = Number(k.sklad_product_id);
      kirimMap[id] = (kirimMap[id] || 0) + Number(k.hajm || 0);
    });

    const chiqimMap = {};
    chiqimRes.data.forEach(c => {
      const id = Number(c.sklad_product_id);
      chiqimMap[id] = (chiqimMap[id] || 0) + Number(c.hajm || 0);
    });

    const mavjudMap = {};
    productRes.data.forEach(p => {
      const id = Number(p.id);
      const boshlangich = Number(p.hajm || 0); // ⬅️ boshlang‘ich hajm
      const kirim = kirimMap[id] || 0;
      const chiqim = chiqimMap[id] || 0;
      mavjudMap[id] = boshlangich + kirim - chiqim;
    });

    setHajmMap(mavjudMap);
  } catch (err) {
    console.error('Mavjud hajmni hisoblashda xatolik:', err);
  }
};


  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...rows];
    updatedRows[index][name] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { sklad_product_id: '', hajm: '', narx: '', description: '' }]);
  };

  const removeRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleSubmit = () => {
    const valid = rows.every(row => row.sklad_product_id && row.hajm && row.narx);
    if (!valid) return alert("Barcha qatorlar to‘liq to‘ldirilishi kerak");

    onSave(rows.length === 1 && initialData ? rows[0] : rows);
    onClose();
    setRows([{ sklad_product_id: '', hajm: '', narx: '', description: '' }]);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modal__content}>
        <h3 className={styles.modal__title}>
          {initialData ? 'Kirimni tahrirlash' : 'Yangi kirim(lar) qo‘shish'}
        </h3>

        {rows.map((row, index) => {
          const productId = Number(row.sklad_product_id);
          const product = products.find(p => Number(p.id) === productId);
          const mavjud = hajmMap[productId];

          return (
            <div key={index} className={styles.modal__form} style={{ marginBottom: '14px' }}>
              {mavjud !== undefined && (
                <p className={styles.modal__info}>
                  <strong>Omborda mavjud hajm:</strong> {mavjud} {product?.hajm_birlik || ''}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  name="sklad_product_id"
                  value={row.sklad_product_id}
                  onChange={(e) => handleChange(index, e)}
                  className={styles.input}
                  style={{ flex: 1 }}
                >
                  <option value="">Mahsulot tanlang</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nomi}</option>
                  ))}
                </select>

                <input
                  type="number"
                  name="hajm"
                  value={row.hajm}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Hajm"
                  className={styles.input}
                  style={{ flex: 1 }}
                />

                <input
                  type="number"
                  name="narx"
                  value={row.narx}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Narx"
                  className={styles.input}
                  style={{ flex: 1 }}
                />

                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '20px',
                      color: 'red',
                      cursor: 'pointer',
                    }}
                    title="O‘chirish"
                  >
                    🗑
                  </button>
                )}
              </div>

              <textarea
                name="description"
                value={row.description}
                onChange={(e) => handleChange(index, e)}
                placeholder="Izoh"
                className={styles.textarea}
                style={{ marginTop: '8px', width: '96%' }}
              />
            </div>
          );
        })}

        {!initialData && (
          <button
            onClick={addRow}
            className={styles.saveBtn}
            style={{
              marginBottom: '10px',
              padding: '8px 12px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ➕ Yana qator
          </button>
        )}

        <div className={styles.modal__buttons}>
          <button onClick={handleSubmit}>✅ Saqlash</button>
          <button onClick={onClose}>❌ Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}
