'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import url from '@/host/host';
import AdminHeader from '@/components/AdminHeader';
export default function Lavozimlar() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${url}/lavozim`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setData(res.data);
    } catch (err) {
      console.error('Xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setBtnLoading(true);
    try {
      if (editId) {
        await axios.put(`${url}/lavozim/${editId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.post(`${url}/lavozim`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      setForm({ name: '' });
      setEditId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Yozishda xatolik:', err);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
      try {
        await axios.delete(`${url}/lavozim/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchData();
      } catch (err) {
        console.error('O‘chirishda xatolik:', err);
      }
    }
  };

  const columnTitles = {
    id: 'ID',
    name: 'Lavozim nomi',
    created_at: 'Yaratilgan',
    updated_at: 'Yangilangan',
  };

  return (
    <LayoutComponent>
    <AdminHeader
  title="Lavozimlar"
  onCreate={() => {
    setForm({ name: '' });
    setEditId(null);
    setShowModal(true);
  }}
/>

      {loading ? (
        <p style={{ padding: '10px' }}>Yuklanmoqda...</p>
      ) : (
        <AdminTable
          title="Lavozimlar ro'yxati"
          columns={Object.keys(columnTitles)}
          columnTitles={columnTitles}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '300px' }}>
            <h3>{editId ? 'Tahrirlash' : 'Yangi lavozim'}</h3>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Lavozim nomi"
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={handleSubmit}
                style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                {btnLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutComponent>
  );
}
