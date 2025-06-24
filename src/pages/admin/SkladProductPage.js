'use client';
import styles from '@/styles/SkladProduct.module.css';
import { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import SkladModal from '@/components/SkladModal';
import axios from 'axios';
import url from '@/host/host';

export default function SkladProductPage() {
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
      const [productRes, kirimRes, chiqimRes] = await Promise.all([
        axios.get(`${url}/sklad_product`, authHeader),
        axios.get(`${url}/sklad_product_taktic`, authHeader),
        axios.get(`${url}/chiqim_ombor`, authHeader),
      ]);

      const kirimMap = {};
      kirimRes.data.forEach(item => {
        const id = item.sklad_product_id;
        kirimMap[id] = (kirimMap[id] || 0) + Number(item.hajm || 0);
      });

      const chiqimMap = {};
      chiqimRes.data.forEach(item => {
        const id = item.sklad_product_id;
        chiqimMap[id] = (chiqimMap[id] || 0) + Number(item.hajm || 0);
      });

      const enriched = productRes.data.map(p => {
        const kirim = kirimMap[p.id] || 0;
        const chiqim = chiqimMap[p.id] || 0;
        const mavjudHajm = (p.hajm || 0) + kirim - chiqim;
        return {
          ...p,
          mavjud_hajm: mavjudHajm
        };
      });

      setData(enriched);
    } catch (err) {
      console.error("Ma'lumotlarni olishda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${url}/sklad_product/${id}`, authHeader);
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
        await axios.put(`${url}/sklad_product/${editingItem.id}`, form, authHeader);
      } else {
        await axios.post(`${url}/sklad_product`, form, authHeader);
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
        <h2 className={styles.title}>📦 Sklad mahsulotlari</h2>
        <button onClick={() => setModalOpen(true)} className={styles.addButton}>
          ➕ Yangi mahsulot
        </button>
      </div>

      <AdminTable
        title="Sklad"
        columns={['id', 'nomi', 'hajm', 'mavjud_hajm', 'hajm_birlik', 'created_at']}
        columnTitles={{
          id: 'ID',
          nomi: 'Nomi',
          hajm: 'Boshlang‘ich hajm',
          mavjud_hajm: 'Omborda mavjud',
          hajm_birlik: 'Birlik',
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
