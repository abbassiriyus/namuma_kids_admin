'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import url from '@/host/host';
import BolaModal from '@/components/BolaModal.jsx';
import AdminHeader from '@/components/AdminHeader.jsx';

export default function Tarbiyalanuvchilar() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBola, setSelectedBola] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
        guruhMap[g.id] = g.name;
      });

      const updatedData = bolaRes.data.map((b) => ({
        ...b,
        guruh_id_raw: b.guruh_id,
        guruh_id: guruhMap[b.guruh_id] || b.guruh_id,
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
const handleToggleActive = async (id, currentValue) => {
  try {
    await axios.put(`${url}/bola/${id}/toggle-active`, {
      is_active: !currentValue
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchData(); // ma'lumotlarni yangilash
  } catch (error) {
    console.error("is_active yangilashda xatolik:", error);
  }
};

  const handleUpdate = async (updatedData) => {
    try {
      await axios.put(`${url}/bola/${updatedData.id}`, updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      console.error("Update xatolik:", err);
    }
  };

  const handleCreate = async (newData) => {
    try {
      await axios.post(`${url}/bola`, newData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      console.error("Yaratishda xatolik:", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
      try {
        await axios.delete(`${url}/bola/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchData();
      } catch (err) {
        console.error("Delete xatolik:", err);
      }
    }
  };

  const handleSave = (formData) => {
    if (formData.id) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
    setShowModal(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((b) => {
    const groupMatch = selectedGroup ? b.guruh_id_raw === Number(selectedGroup) : true;
    const nameMatch = b.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return groupMatch && nameMatch;
  });

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
     is_active: 'Holati (aktiv)',
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

{/* Filter va qidiruv qismi (zamonaviy dizayn) */}
<div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
  {/* Guruh select */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '600', color: '#555' }}>
      Guruh bo‘yicha filter:
    </label>
    <select
      value={selectedGroup}
      onChange={(e) => setSelectedGroup(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1.5px solid #ccc',
        fontSize: '16px',
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: '#fff',
      }}
    >
      <option value="">Barchasi</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>{g.name}</option>
      ))}
    </select>
  </div>

  {/* Qidiruv input */}
  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: '250px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '600', color: '#555' }}>
      Ism yoki familiya bo‘yicha qidiruv:
    </label>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Ism yoki familiya kiriting..."
      style={{
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1.5px solid #ccc',
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.3s',
      }}
    />
  </div>
</div>

{/* Natijalar soni */}
<div style={{ paddingBottom: '10px', fontWeight: '600', color: '#444' }}>
  Natijada: <span style={{ color: '#0070f3' }}>{filteredData.length}</span> ta tarbiyalanuvchi ko‘rsatildi.
</div>

 

      {loading ? (
        <p style={{ padding: '10px' }}>Yuklanmoqda...</p>
      ) : (
        <AdminTable
          title=""
          columns={Object.keys(columnTitles)}
          columnTitles={columnTitles}
          data={filteredData}
          onEdit={(row) => {
            setSelectedBola(row);
            setShowModal(true);
          }}
          onDelete={(id) => handleDelete(id)}
            customRenderers={{
    is_active: (row) => (
      <input
        type="checkbox"
        checked={row.is_active}
        onChange={() => handleToggleActive(row.id, row.is_active)}
      />
    )
  }}
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
