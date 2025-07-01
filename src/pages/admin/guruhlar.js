'use client';

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

  const [searchText, setSearchText] = useState('');
  const [selectedXodimId, setSelectedXodimId] = useState(''); // Yangi select uchun

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    try {
      const [guruhRes, xodimRes] = await Promise.all([
        axios.get(`${url}/guruh`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${url}/xodim`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const xodimMap = {};
      xodimRes.data.forEach(x => {
        xodimMap[x.id] = x.name;
      });

      const updatedData = guruhRes.data.map(g => ({
        ...g,
        xodim_id_raw: g.xodim_id,
        xodim_id: xodimMap[g.xodim_id] || g.xodim_id,
      }));

      setData(updatedData);
      setXodimlar(xodimRes.data);
    } catch (err) {
      console.error('Xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newData) => {
    try {
      await axios.post(`${url}/guruh`, newData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchData();
    } catch (err) {
      console.error('Yaratishda xatolik:', err);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      await axios.put(`${url}/guruh/${updatedData.id}`, updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchData();
    } catch (err) {
      console.error('Yangilashda xatolik:', err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Haqiqatan ham o‘chirmoqchimisiz?')) {
      try {
        await axios.delete(`${url}/guruh/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchData();
      } catch (err) {
        console.error('O‘chirishda xatolik:', err);
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

  const columnTitles = {
    id: 'ID',
    name: 'Guruh nomi',
    xodim_id: 'Tarbiya beruvchi',
    created_at: 'Yaratilgan',
    updated_at: 'Yangilangan',
  };

  // Filtrlash: text input + select xodim
  const filteredData = data.filter((g) => {
    const textMatch =
      g.name.toLowerCase().includes(searchText.toLowerCase()) ||
      g.xodim_id.toLowerCase().includes(searchText.toLowerCase());

    const xodimMatch = selectedXodimId ? g.xodim_id_raw == selectedXodimId : true;

    return textMatch && xodimMatch;
  });

  return (
    <LayoutComponent>
      <AdminHeader
        title="Guruhlar"
        onCreate={() => {
          setSelectedGuruh(null);
          setShowModal(true);
        }}
      />

      {/* Filtr input va select */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', maxWidth: '600px' }}>
        <input
          type="text"
          placeholder="Guruh nomi yoki tarbiya beruvchi bo‘yicha qidiruv..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1.5px solid #ccc',
            fontSize: '16px',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#0070f3')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
        />

        <select
          value={selectedXodimId}
          onChange={(e) => setSelectedXodimId(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1.5px solid #ccc',
            fontSize: '16px',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'border-color 0.3s',
            minWidth: '200px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#0070f3')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
        >
          <option value="">Barchasi (Tarbiya beruvchi)</option>
          {xodimlar.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ padding: '10px', fontSize: '18px', color: '#555' }}>Yuklanmoqda...</p>
      ) : (
        <>
          <AdminTable
            title="Guruhlar ro‘yxati"
            columns={Object.keys(columnTitles)}
            columnTitles={columnTitles}
            data={filteredData}
            onEdit={(row) => {
              setSelectedGuruh(row);
              setShowModal(true);
            }}
            onDelete={handleDelete}
          />
          {filteredData.length === 0 && (
            <p style={{ marginTop: '20px', color: '#999', fontStyle: 'italic' }}>
              Hech qanday guruh topilmadi.
            </p>
          )}
        </>
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
