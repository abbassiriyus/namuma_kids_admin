'use client';

import React, { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import axios from 'axios';
import url from '@/host/host';
import OylikEditModal from '@/components/OylikEditModal';
import OylikDeleteModal from '@/components/OylikDeleteModal';
export default function OyliklarPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedXodim, setSelectedXodim] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const fetchAll = async () => {
    if (!selectedMonth) return;
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const [xodimRes, bonusRes, jarimaRes, kunlikRes, typeRes] = await Promise.all([
        axios.get(`${url}/xodim`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${url}/bonus?month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${url}/jarima?month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${url}/kunlik?month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${url}/oylik_type?month=${selectedMonth}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const bonusMap = {}, jarimaMap = {}, kunlikMap = {}, tolanganMap = {};

      bonusRes.data.forEach(b => {
        bonusMap[b.xodim_id] = (bonusMap[b.xodim_id] || 0) + Number(b.narx);
      });

      jarimaRes.data.forEach(j => {
        jarimaMap[j.xodim_id] = (jarimaMap[j.xodim_id] || 0) + Number(j.narx);
      });

      kunlikRes.data.forEach(k => {
        kunlikMap[k.xodim_id] = (kunlikMap[k.xodim_id] || 0) + Number(k.narx);
      });

      typeRes.data.forEach(t => {
        tolanganMap[t.xodim_id] = (tolanganMap[t.xodim_id] || 0) + Number(t.narx);
      });

      const enriched = xodimRes.data.map(x => {
        const bonus = bonusMap[x.id] || 0;
        const jarima = jarimaMap[x.id] || 0;
        const kunlik = kunlikMap[x.id] || 0;
        const oylik = x.oylik ?? 0;
        const tolangan = tolanganMap[x.id] || 0;

        const total = Math.max(0, oylik + bonus + kunlik - jarima);

        let holat = 'To‘lanmadi';
        if (tolangan >= total && total > 0) holat = 'To‘landi';
        else if (tolangan > 0 && tolangan < total) holat = 'To‘liq to‘lanmadi';

        return {
          id: x.id,
          name: x.name,
          phone: x.phone,
          address: x.address,
          oylik,
          bonus,
          jarima,
          kunlik,
          tolangan,
          total,
          holat
        };
      });

      setData(enriched);

    } catch (err) {
      console.error("Xatolik:", err);
      alert("Ma'lumotlarni olishda xatolik yuz berdi!\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [selectedMonth]);

  const columnTitles = {
    id: 'ID',
    name: 'Ismi',
    // phone: 'Telefon',
    // address: 'Manzil',
    oylik: 'Oylik (so‘m)',
    bonus: 'Bonus (so‘m)',
    jarima: 'N/B (so‘m)',
    kunlik: 'Kunlik (so‘m)',
    tolangan: 'To‘langan (so‘m)',
    total: 'Umumiy (so‘m)',
    holat: 'Holati', // 💡 yangi ustun
  };

  return (
    <LayoutComponent>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label>Oy tanlang:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <button onClick={fetchAll}>Ko‘rish</button>
      </div>

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : (
        <AdminTable
          title={`Oylik / Bonus / Jarima ro‘yxati — ${selectedMonth}`}
          columns={Object.keys(columnTitles)}
          columnTitles={columnTitles}
          data={data}
          onEdit={(row) => {
            setSelectedXodim(row);
            setEditMode(false);
            setShowModal(true);
          }}
          onDelete={(row) => {
            setSelectedXodim(row);
            setEditMode(true);
            setShowModal(true);
          }}
        />
      )}

      {showModal && (
        <OylikEditModal
          open={showModal}
          xodim={selectedXodim}
          onClose={() => setShowModal(false)}
          onSaved={fetchAll}
          editMode={editMode}
          selectedMonth={selectedMonth}
        />
      )}
      {showModal && editMode && (
  <OylikDeleteModal
    open={showModal}
    xodim={selectedXodim}
    selectedMonth={selectedMonth}
    onClose={() => setShowModal(false)}
    onSaved={fetchAll}
  />
)}
    </LayoutComponent>
  );
}
