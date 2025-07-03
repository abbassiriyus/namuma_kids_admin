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
  const [selectedStatus, setSelectedStatus] = useState('');
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
        const naqt_prichislena = bolaDaromatlar.reduce((sum, d) => sum + (d.naqt_prichislena || 0), 0);
        const jami_tolangan = naqt + karta + prichislena + naqt_prichislena;

        return {
          id: b.id, fish, guruh, oylik_tolov, kunlik_tolov, jami, kelgan, hisob,
          naqt, karta, prichislena, naqt_prichislena, jami_tolangan
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
    const guruhOk = selectedGroup ? r.guruh === groups.find(g => g.id == selectedGroup)?.name : true;
    const fishOk = r.fish.toLowerCase().includes(searchFish.toLowerCase());

    let statusOk = true;
    if (selectedStatus === 'not-paid') {
      statusOk = r.jami_tolangan === 0;
    } else if (selectedStatus === 'part-paid') {
      statusOk = r.jami_tolangan > 0 && r.jami_tolangan < r.hisob;
    } else if (selectedStatus === 'fully-paid') {
      statusOk = r.jami_tolangan >= r.hisob;
    }

    return guruhOk && fishOk && statusOk;
  });

  const totalSummary = filteredRows.reduce((acc, row) => {
    acc.naqt += row.naqt;
    acc.karta += row.karta;
    acc.prichislena += row.prichislena;
    acc.naqt_prichislena += row.naqt_prichislena || 0;
    acc.jami_tolangan += row.jami_tolangan;
    return acc;
  }, { naqt: 0, karta: 0, prichislena: 0, naqt_prichislena: 0, jami_tolangan: 0 });

  const columns = [
    'fish', 'guruh', 'oylik_tolov', 'kunlik_tolov', 'jami', 'kelgan', 'hisob',
    'naqt', 'karta', 'prichislena', 'naqt_prichislena', 'jami_tolangan'
  ];

  const columnTitles = {
    fish: 'F.I.Sh.',
    guruh: 'Guruh',
    oylik_tolov: "Oylik to'lov (so'm)",
    kunlik_tolov: "Kunlik to'lov (so'm)",
    jami: 'Jami dars',
    kelgan: 'Kelgan',
    hisob: 'Hisoblangan',
    naqt: 'Naqt',
    karta: 'Karta',
    prichislena: 'Bank',
    naqt_prichislena: 'Bank (naqt)', // yangi ustun
    jami_tolangan: 'Jami to‘langan',
  };

  return (
    <LayoutComponent>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
        To‘lovlar va daromadlar ({month})
      </h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Oy:</label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Guruh:</label>
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
          >
            <option value="">Barchasi</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Ism/Familya:</label>
          <input
            type="text"
            placeholder="Qidiruv..."
            value={searchFish}
            onChange={e => setSearchFish(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
          <label>To‘lov holati:</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
          >
            <option value="">Barchasi</option>
            <option value="not-paid">Umuman to‘lamaganlar</option>
            <option value="part-paid">To‘liq to‘lamaganlar</option>
            <option value="fully-paid">To‘liq to‘laganlar</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : (
        <>
          <p><strong>Natija:</strong> {filteredRows.length} ta bola</p>

          <AdminTable
            title=""
            columns={columns}
            columnTitles={columnTitles}
            data={filteredRows}
            onEdit={row => { setSelectedBola(row); setModalOpen(true); }}
            onDelete={id => { setDeleteTargetBolaId(id); setDeleteModalOpen(true); }}
          />

          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            maxWidth: '400px'
          }}>
            <h3>Umumiy To‘lovlar</h3>
            <p><strong>Naqt:</strong> {totalSummary.naqt.toLocaleString()} so'm</p>
            <p><strong>Karta:</strong> {totalSummary.karta.toLocaleString()} so'm</p>
            <p><strong>Bank to`lov:</strong> {totalSummary.prichislena.toLocaleString()} so'm</p>
            <p><strong>Bank(Naqt) to`lov:</strong> {totalSummary.naqt_prichislena.toLocaleString()} so'm</p>
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
