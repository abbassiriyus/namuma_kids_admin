import { useState, useEffect } from 'react';
import styles from '@/styles/BolaModal.module.css';
import axios from 'axios';
import url from '@/host/host';

export default function ChiqimModal({ isOpen, onClose, onSave, products = [], initialData = null }) {
  const [rows, setRows] = useState([{ sklad_product_id: '', hajm: '', description: '' }]);
  const [chiqimSana, setChiqimSana] = useState('');
  const [availableHajm, setAvailableHajm] = useState({}); // id -> hajm
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (initialData) {
      setRows([{ ...initialData }]);
      setChiqimSana(initialData.chiqim_sana?.slice(0, 10) || '');
    } else {
      setRows([{ sklad_product_id: '', hajm: '', description: '' }]);
      setChiqimSana('');
    }
  }, [initialData]);

  const fetchAvailableHajm = async (productId) => {
    try {
      const res = await axios.get(`${url}/sklad_product/${productId}/hajm`, authHeader);
      setAvailableHajm(prev => ({ ...prev, [productId]: res.data.mavjud }));
    } catch (err) {
      console.error('Mavjud hajmni olishda xatolik:', err);
    }
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newRows = [...rows];
    newRows[index][name] = value;

    if (name === 'sklad_product_id') {
      fetchAvailableHajm(value);
    }

    setRows(newRows);
  };

  const handleSubmit = () => {
    if (!chiqimSana) return alert("Sana tanlanmagan");

    // Validatsiya
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
     
      
      const max = products[row.sklad_product_id] || 0;
      const entered = parseFloat(row.hajm || '0');
      if (entered > max) {
        return alert(`❌ ${i + 1}-qator: Omborda faqat ${max} birlik mavjud. Kamroq miqdor kiriting.`);
      }
    }

    const processed = rows.map((r) => ({ ...r, chiqim_sana: chiqimSana }));
    onSave(processed.length === 1 && initialData ? processed[0] : processed);
    onClose();
    setRows([{ sklad_product_id: '', hajm: '', description: '' }]);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modal__content}>
        <h3 className={styles.modal__title}>
          {initialData ? 'Chiqimni tahrirlash' : 'Yangi chiqim(lar) qo‘shish'}
        </h3>

        <label>Chiqim sanasi:</label>
        <input
          type="date"
          value={chiqimSana}
          onChange={(e) => setChiqimSana(e.target.value)}
          className={styles.input}
        />

        {rows.map((row, index) => {
          const product = products.find(p => p.id == row.sklad_product_id);
          console.log(product);
          
          const mavjud = product?product.available_hajm:0
console.log(mavjud);
          return (
            <div key={index} className={styles.modal__form} style={{ marginBottom: '12px' }}>
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

                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((_, i) => i !== index))}
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

              {mavjud !== undefined && (
                <p style={{ marginTop: '4px', color: 'gray' }}>
                  <strong>Mavjud hajm:</strong> {mavjud} {product?.hajm_birlik || ''}
                </p>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setRows([...rows, { sklad_product_id: '', hajm: '', description: '' }])}
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

        <div className={styles.modal__buttons}>
          <button onClick={handleSubmit}>✅ Saqlash</button>
          <button onClick={onClose}>❌ Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}
