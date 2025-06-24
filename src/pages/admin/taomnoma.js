// TaomnomaPage.jsx
"use client";

import { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import axios from 'axios';
import url from '@/host/host';
import { Plus, Trash2, Pencil } from 'lucide-react';
import TaomModal from '@/components/TaomModal';
import IngredientList from '@/components/IngredientList';
import AdminHeader from '@/components/AdminHeader';
import styles from '@/styles/TaomnomaPage.module.css'
export default function TaomnomaPage() {
  const [taomlar, setTaomlar] = useState([]);
  const [selectedTaom, setSelectedTaom] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchTaomlar = async () => {
    const res = await axios.get(`${url}/taom`);
    setTaomlar(res.data);
  };

  useEffect(() => {
    fetchTaomlar();
  }, []);

  const handleDelete = async (id) => {
    await axios.delete(`${url}/taom/` + id);
    fetchTaomlar();
  };

  return (
    <LayoutComponent>
      <AdminHeader title="Taomnoma" onCreate={() => { setSelectedTaom(null); setOpenModal(true); }} />

      <div className="grid gap-4">
        {taomlar.map((taom) => (
          <div key={taom.id} className="p-4 border rounded shadow-sm">
          <div className={styles.taomCard}>
  <div className={styles.taomHeader}>
    <h2 className={styles.taomTitle}>{taom.nomi}</h2>
    <div className={styles.taomButtons}>
      <button className={styles.editButton}>Tahrirlash</button>
      <button className={styles.deleteButton}>O‘chirish</button>
    </div>
  </div>
</div>
            <IngredientList taomId={taom.id} />
          </div>
        ))}
      </div>

      <TaomModal open={openModal} setOpen={setOpenModal} taom={selectedTaom} onSaved={fetchTaomlar} />
    </LayoutComponent>
  );
}
