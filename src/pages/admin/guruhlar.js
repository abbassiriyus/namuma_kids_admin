'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import url from '@/host/host';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import GuruhModal from '@/components/GuruhModal';
import AdminHeader from '@/components/AdminHeader';

export default function GuruhlarPage() {
  const [data, setData] = useState([]);
  const [xodimlar, setXodimlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuruh, setSelectedGuruh] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [guruhRes, xodimRes] = await Promise.all([
        axios.get(`${url}/guruh`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${url}/xodim`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const xodimMap = {};
      xodimRes.data.forEach((x) => {
        xodimMap[x.id] = x.fish;
      });

      const updatedData = guruhRes.data.map((g) => ({
        ...g,
        xodim_id: xodimMap[g.xodim_id] || g.xodim_id,
      }));

      setData(updatedData);
      setXodimlar(xodimRes.data);
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newData) => {
    await axios.post(`${url}/guruh`, newData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchData();
  };

  const handleUpdate = async (updatedData) => {
    await axios.put(`${url}/guruh/${updatedData.id}`, updatedData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
      await axios.delete(`${url}/guruh/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
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

  const columnTitles = {
    id: "ID",
    name: "Guruh nomi",
    xodim_id: "Tarbiya beruvchi",
    created_at: "Yaratilgan",
    updated_at: "Yangilangan"
  };

  return (
    <LayoutComponent>
   <AdminHeader
  title="Guruhlar"
  onCreate={() => {
    setSelectedGuruh(null);
    setShowModal(true);
  }}
/>

      {loading ? <p>Yuklanmoqda...</p> : (
        <AdminTable
          title="Guruhlar ro‘yxati"
          columns={Object.keys(columnTitles)}
          columnTitles={columnTitles}
          data={data}
          onEdit={(row) => { setSelectedGuruh(row); setShowModal(true); }}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <GuruhModal
          guruh={selectedGuruh}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          xodimlar={xodimlar}
        />
      )}
    </LayoutComponent>
  );
}

