'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/SkladProduct.module.css';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import SkladModal from '@/components/SkladModal';
import axios from 'axios';
import url from '@/host/host';

export default function MaishiySkladPage() {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchData = async () => {
    try {
      const [skladRes, kirimRes, chiqimRes] = await Promise.all([
        axios.get(`${url}/sklad_maishiy`, authHeader),
        axios.get(`${url}/kirim_maishiy`, authHeader),
        axios.get(`${url}/chiqim_maishiy`, authHeader),
      ]);

      const kirimMap = {};
      kirimRes.data.forEach(k => {
        kirimMap[k.sklad_product_id] = (kirimMap[k.sklad_product_id] || 0) + +k.hajm;
      });

      const chiqimMap = {};
      chiqimRes.data.forEach(c => {
        chiqimMap[c.sklad_product_id] = (chiqimMap[c.sklad_product_id] || 0) + +c.hajm;
      });

      const finalData = skladRes.data.map(item => {
        const kirimHajm = kirimMap[item.id] || 0;
        const chiqimHajm = chiqimMap[item.id] || 0;
        const mavjud = item.hajm + kirimHajm - chiqimHajm;
        return {
          ...item,
          mavjud
        };
      });

      setData(finalData);
    } catch (err) {
      console.error("Ma'lumotlarni olishda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${url}/sklad_maishiy/${id}`, authHeader);
      fetchData();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    try {
      if (editingItem) {
        await axios.put(`${url}/sklad_maishiy/${editingItem.id}`, form, authHeader);
      } else {
        await axios.post(`${url}/sklad_maishiy`, form, authHeader);
      }
      setModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
    }
  };

  return (
    <LayoutComponent>
      <div className={styles.headerWrapper}>
        <h2 className={styles.title}>🏠 Maishiy mahsulotlar</h2>
        <button onClick={() => setModalOpen(true)} className={styles.addButton}>
          ➕ Yangi mahsulot
        </button>
      </div>

      <AdminTable
        title="Maishiy Ombor"
        columns={['id', 'nomi', 'hajm', 'hajm_birlik', 'mavjud', 'created_at']}
        columnTitles={{
          id: 'ID',
          nomi: 'Nomi',
          hajm: 'Boshlang‘ich hajm',
          hajm_birlik: 'Birlik',
          mavjud: 'Omborda mavjud',
          created_at: 'Qo‘shilgan sana'
        }}
        data={data}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <SkladModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem}
      />
    </LayoutComponent>
  );
}