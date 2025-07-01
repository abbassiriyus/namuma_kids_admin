'use client';

import React, { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import DaromatModal from '@/components/DaromatModal';
import DaromatDeleteModal from '@/components/DaromatDeleteModal';
import axios from 'axios';
import url from '@/host/host';
import { useRouter } from 'next/navigation';

export default function TolovlarPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchFish, setSearchFish] = useState('');
  const [groups, setGroups] = useState([]);

  const [selectedBola, setSelectedBola] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetBolaId, setDeleteTargetBolaId] = useState(null);

  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
const [bolaRes, guruhRes, darsRes, kunRes, daromatRes] = await Promise.all([
  axios.get(`${url}/bola`, { headers }),
  axios.get(`${url}/guruh`, { headers }),
  axios.get(`${url}/bola_kun_all?month=${Number(month.split('-')[1])}&year=${Number(month.split('-')[0])}`, { headers }),
  axios.get(`${url}/bola_kun`, { headers }),
  axios.get(`${url}/daromat_type`, { headers }),
]);
      const guruhMap = {};
      guruhRes.data.forEach(g => { guruhMap[g.id] = g.name });
      setGroups(guruhRes.data);

      const darsKunlar = darsRes.data.filter(d => d.sana?.slice(0, 7) === month);
      const daromatlar = daromatRes.data.filter(d => d.sana?.slice(0, 7) === month);

      const bolalar = bolaRes.data.map(b => {
        const fish = b.username;
        const guruh = guruhMap[b.guruh_id] || 'Noma’lum';

        const bolaYoqlama = kunRes.data.filter(
          k => k.bola_id === b.id && darsKunlar.some(d => d.id === k.darssana_id)
        );

        const kelgan = bolaYoqlama.filter(k => k.holati === 1).length;
        const jami = darsKunlar.length;
        const oylik_tolov = b.oylik_toliv || 0;
        const kunlik_tolov = Math.round(oylik_tolov / 25);
        const hisob = kelgan > 24 ? oylik_tolov : kelgan * kunlik_tolov;

        const bolaDaromatlar = daromatlar.filter(d => d.bola_id === b.id);

        const naqt = bolaDaromatlar.reduce((sum, d) => sum + (d.naqt || 0), 0);
        const karta = bolaDaromatlar.reduce((sum, d) => sum + (d.karta || 0), 0);
        const prichislena = bolaDaromatlar.reduce((sum, d) => sum + (d.prichislena || 0), 0);
        const jami_tolangan = naqt + karta + prichislena;

        return {
          id: b.id, fish, guruh, oylik_tolov, kunlik_tolov, jami, kelgan, hisob,
          naqt, karta, prichislena, jami_tolangan
        };
      });

      setRows(bolalar);
    } catch (error) {
      console.error('Xatolik:', error);
      if (error.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  const filteredRows = rows.filter(r => {
    const okGroup = selectedGroup ? r.guruh === groups.find(g => g.id === Number(selectedGroup))?.name : true;
    const okFish = r.fish.toLowerCase().includes(searchFish.toLowerCase());
    return okGroup && okFish;
  });

  const totalSummary = filteredRows.reduce((acc, row) => {
    acc.naqt += row.naqt;
    acc.karta += row.karta;
    acc.prichislena += row.prichislena;
    acc.jami_tolangan += row.jami_tolangan;
    return acc;
  }, { naqt: 0, karta: 0, prichislena: 0, jami_tolangan: 0 });

  const columns = ['fish', 'guruh', 'oylik_tolov', 'kunlik_tolov', 'jami', 'kelgan', 'hisob', 'naqt', 'karta', 'prichislena', 'jami_tolangan'];
  const columnTitles = {
    fish: 'F.I.Sh.',
    guruh: 'Guruh',
    oylik_tolov: "Oylik to'lov (so'm)",
    kunlik_tolov: "Kunlik to'lov (so'm)",
    jami: 'Jami darslar soni',
    kelgan: 'Kelgan darslar',
    hisob: 'Hisoblangan summa (so\'m)',
    naqt: 'Naqt to‘langan (so\'m)',
    karta: 'Karta orqali (so\'m)',
    prichislena: 'Bank transferi (so\'m)',
    jami_tolangan: 'Jami to‘langan (so\'m)',
  };

  return (
    <LayoutComponent>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#333' }}>
        To‘lovlar va daromadlar ({month})
      </h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="monthInput" style={{ marginBottom: '6px', fontWeight: '600', color: '#555' }}>Oy tanlash:</label>
          <input
            id="monthInput"
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
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

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
          <label htmlFor="groupSelect" style={{ marginBottom: '6px', fontWeight: '600', color: '#555' }}>Guruh bo‘yicha filter:</label>
          <select
            id="groupSelect"
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
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
            <option value=''>Barchasi</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: '250px' }}>
          <label htmlFor="searchInput" style={{ marginBottom: '6px', fontWeight: '600', color: '#555' }}>Ism yoki familiya bo‘yicha qidiruv:</label>
          <input
            id="searchInput"
            type="text"
            placeholder="Ism yoki familiya kiriting..."
            value={searchFish}
            onChange={e => setSearchFish(e.target.value)}
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

      {loading ? (
        <p style={{ fontSize: '18px', color: '#666' }}>Yuklanmoqda...</p>
      ) : (
        <>
          <p style={{ marginBottom: '10px', fontWeight: '600', color: '#444' }}>
            Natijada: <span style={{ color: '#0070f3' }}>{filteredRows.length}</span> ta tarbiyalanuvchi ko‘rsatildi.
          </p>

          <AdminTable
            title=""
            columns={Object.keys(columnTitles)}
            columnTitles={columnTitles}
            data={filteredRows}
            onEdit={row => { setSelectedBola(row); setModalOpen(true); }}
            onDelete={id => { setDeleteTargetBolaId(id); setDeleteModalOpen(true); }}
          />

          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f5f8ff',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              maxWidth: '400px',
            }}
          >
            <h3 style={{ fontWeight: '700', marginBottom: '12px', color: '#222' }}>Umumiy to‘lovlar:</h3>
            <p><strong>Naqt:</strong> {totalSummary.naqt.toLocaleString()} so'm</p>
            <p><strong>Karta:</strong> {totalSummary.karta.toLocaleString()} so'm</p>
            <p><strong>Prichislena:</strong> {totalSummary.prichislena.toLocaleString()} so'm</p>
            <p><strong>Jami to‘langan:</strong> {totalSummary.jami_tolangan.toLocaleString()} so'm</p>
          </div>
        </>
      )}

      <DaromatModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        bola={selectedBola}
        month={month}
        onSaved={() => {
          setModalOpen(false);
          setLoading(true);
          fetchData();
        }}
      />

      <DaromatDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        bolaId={deleteTargetBolaId}
        month={month}
        onDeleted={fetchData}
      />
    </LayoutComponent>
  );
}
