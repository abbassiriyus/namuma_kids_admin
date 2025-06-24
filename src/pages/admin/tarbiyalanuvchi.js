'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import url from '@/host/host';
import BolaModal from "../../components/BolaModal.jsx"
import AdminHeader from '@/components/AdminHeader.jsx';
export default function Tarbiyalanuvchilar() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [selectedBola, setSelectedBola] = useState(null); 
const fetchData = async () => {
   const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
      try {
        const [bolaRes, guruhRes] = await Promise.all([
          axios.get(`${url}/bola`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${url}/guruh`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const guruhMap = {};
        guruhRes.data.forEach((g) => {
          guruhMap[g.id] = g.name; // id => guruh nomi
        });

        const updatedData = bolaRes.data.map((b) => ({
          ...b,
          guruh_id: guruhMap[b.guruh_id] || b.guruh_id, // guruh nomini qo'yamiz
        }));

        setGroups(guruhRes.data);
        setData(updatedData);
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };
  const handleUpdate = async (updatedData) => {
  try {
    await axios.put(`${url}/bola/${updatedData.id}`, updatedData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchData(); // malumotlarni yangilash
  } catch (err) {
    console.error("Update xatolik:", err);
  }
};
const handleCreate = async (newData) => {
  try {
    await axios.post(`${url}/bola`, newData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchData(); // Ma’lumotlarni yangilash
  } catch (err) {
    console.error("Yaratishda xatolik:", err);
  }
}
const handleDelete = async (id) => {
  if (confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
    try {
      await axios.delete(`${url}/bola/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData(); // ma’lumotlarni yangilash
    } catch (err) {
      console.error("Delete xatolik:", err);
    }
  }
};

const handleSave = (formData) => {
  if (formData.id) {
    handleUpdate(formData); // mavjud bola – yangilash
  } else {
    handleCreate(formData); // yangi bola – yaratish
  }
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

   

    fetchData();
  }, [router]);

  const columnTitles = {
    id: 'ID',
    username: 'F.I.Sh',
    metrka: 'Metirka raqami',
    guruh_id: 'Guruh',
    tugilgan_kun: 'Tug‘ilgan sanasi',
    oylik_toliv: 'Oylik to‘lov',
    balans: 'Balans',
    holati: 'Holati',
    ota_fish: 'Ota F.I.Sh',
    ota_phone: 'Ota tel',
    ota_pasport: 'Ota pasport',
    ona_fish: 'Ona F.I.Sh',
    ona_phone: 'Ona tel',
    ona_pasport: 'Ona pasport',
    qoshimcha_phone: 'Qo‘shimcha tel',
    address: 'Manzil',
    description: 'Izoh',
    created_at: 'Yaratilgan vaqti',
    updated_at: 'Yangilangan vaqti'
  };

  return (
    <LayoutComponent>
  <AdminHeader
  title="Tarbiyalanuvchilar"
  onCreate={() => {
    setShowModal(true);
    setSelectedBola(null);
  }}
/>
      {loading ? (
        <p style={{ padding: '10px' }}>Yuklanmoqda...</p>
      ) : (
 <AdminTable
  title="Tarbiyalanuvchilar ro'yxati"
  columns={Object.keys(columnTitles)}
  columnTitles={columnTitles}
  data={data}
  onEdit={(row) => {
    setSelectedBola(row);
    setShowModal(true);
  }}
  onDelete={(id) => handleDelete(id)}
/>


      )}
      {showModal && (
  <BolaModal
  bola={selectedBola}
  onClose={() => setShowModal(false)}
  onSave={handleSave}
  guruhlar={groups}
/>
)}
    </LayoutComponent>
  );
}
