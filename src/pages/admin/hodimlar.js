'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import url from '@/host/host';
import AdminHeader from '@/components/AdminHeader';

export default function Hodimlar() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', lavozim_id: '', address: '', oylik: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${url}/xodim`, {
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
    try {
      if (editId) {
        await axios.put(`${url}/xodim/${editId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } else {
        await axios.post(`${url}/xodim`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      setForm({ name: '', phone: '', lavozim_id: '', address: '', oylik: '' });
      setEditId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Yozishda xatolik:', err);
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
        await axios.delete(`${url}/xodim/${id}`, {
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
    name: 'F.I.Sh',
    phone: 'Telefon',
    lavozim_id: 'Lavozim ID',
    address: 'Manzil',
    oylik: 'Oylik',
    created_at: 'Yaratilgan',
    updated_at: 'Yangilangan',
  };

  return (
    <LayoutComponent>
  <AdminHeader
  title="Xodimlar"
  onCreate={() => {
    setForm({ name: '', phone: '', lavozim_id: '', address: '', oylik: '' });
    setEditId(null);
    setShowModal(true);
  }}
/>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ marginBottom: '10px' }}>{editId ? 'Tahrirlash' : 'Yangi xodim qo‘shish'}</h3>
            <input name="name" value={form.name} onChange={handleChange} placeholder="F.I.Sh" style={{ padding: '8px', width: '95%', marginBottom: '8px' }} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefon" style={{ padding: '8px', width: '95%', marginBottom: '8px' }} />
            <input name="lavozim_id" value={form.lavozim_id} onChange={handleChange} placeholder="Lavozim ID" style={{ padding: '8px', width: '95%', marginBottom: '8px' }} />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Manzil" style={{ padding: '8px', width: '95%', marginBottom: '8px' }} />
            <input name="oylik" value={form.oylik} onChange={handleChange} placeholder="Oylik" type="number" style={{ padding: '8px', width: '95%', marginBottom: '8px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleSubmit} style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' }}>
                {editId ? 'Yangilash' : 'Saqlash'}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}>
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ padding: '10px' }}>Yuklanmoqda...</p>
      ) : (
        <AdminTable
          title="Xodimlar ro'yxati"
          columns={Object.keys(columnTitles)}
          columnTitles={columnTitles}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </LayoutComponent>
  );
}
