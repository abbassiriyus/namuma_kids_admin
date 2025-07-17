import { useEffect, useState } from 'react';
import styles from '@/styles/BolaModal.module.css';
import axios from 'axios';
import url from '@/host/host';

export default function ChiqimModal({ isOpen, onClose, onSave, products = [], initialData = null }) {
  const [rows, setRows] = useState([{ sklad_product_id: '', hajm: '', description: '' }]);
  const [chiqimSana, setChiqimSana] = useState('');
  const [availableHajm, setAvailableHajm] = useState({}); // product_id => hajm

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

  useEffect(() => {
    if (isOpen) {
      calculateAvailableHajm(); // Modal ochilganda hisobla
    }
  }, [isOpen]);

  const calculateAvailableHajm = async () => {
    try {
      const [productsRes, kirimRes, chiqimRes] = await Promise.all([
        axios.get(`${url}/sklad_product`, authHeader),
        axios.get(`${url}/sklad_product_taktic`, authHeader),
        axios.get(`${url}/chiqim_ombor`, authHeader),
      ]);

      const productList = productsRes.data;
      const kirimlar = kirimRes.data;
      const chiqimlar = chiqimRes.data;

      const kirimMap = {};
      kirimlar.forEach(k => {
        const id = Number(k.sklad_product_id);
        kirimMap[id] = (kirimMap[id] || 0) + Number(k.hajm || 0);
      });

      const chiqimMap = {};
      chiqimlar.forEach(c => {
        const id = Number(c.sklad_product_id);
        chiqimMap[id] = (chiqimMap[id] || 0) + Number(c.hajm || 0);
      });

      const availableMap = {};
      productList.forEach(p => {
        const id = Number(p.id);
        const boshlangich = Number(p.hajm || 0);
        const kirim = kirimMap[id] || 0;
        const chiqim = chiqimMap[id] || 0;
        availableMap[id] = boshlangich + kirim - chiqim;
      });

      setAvailableHajm(availableMap);
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

  const handleSubmit = () => {
    if (!chiqimSana) return alert("❌ Sana tanlanmagan");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const entered = parseFloat(row.hajm || '0');
      const max = availableHajm[row.sklad_product_id] || 0;

      if (entered > max) {
        return alert(`❌ ${i + 1}-qator: Omborda faqat ${max} birlik mavjud`);
      }
    }

    // ✅ Sana ustiga 1 kun qo‘shamiz
    const sanaWithOffset = new Date(chiqimSana);
    sanaWithOffset.setDate(sanaWithOffset.getDate() + 1);
    const formattedSana = sanaWithOffset.toISOString().slice(0, 10);

    const payload = rows.map(r => ({
      ...r,
      chiqim_sana: formattedSana,
    }));

    onSave(payload.length === 1 && initialData ? payload[0] : payload);
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
          const productId = Number(row.sklad_product_id);
          const product = products.find(p => Number(p.id) === productId);
          const mavjud = availableHajm[productId];

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
                  {products.sort((a, b) => a.nomi.localeCompare(b.nomi)).map(p => (
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
