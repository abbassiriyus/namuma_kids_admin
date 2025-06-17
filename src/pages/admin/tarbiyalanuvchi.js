'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import url from '@/host/host'; // ← bu joyda siz `url` ni export qilgan faylingiz bo‘lishi kerak

export default function Tarbiyalanuvchilar() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/bola`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(response.data); // API'dan kelgan ma’lumot
        setLoading(false);
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <LayoutComponent>
      <h2 style={{ padding: '10px' }}>Tarbiyalanuvchilar</h2>
      {loading ? (
        <p style={{ padding: '10px' }}>Yuklanmoqda...</p>
      ) : (
        <AdminTable
          title="Tarbiyalanuvchilar ro'yxati"
          columns={['id', 'username', 'metrka', 'holati', 'ota_FISH', 'ota_phone', 'ona_FISH', 'ona_phone']}
          data={data}
        />
      )}
    </LayoutComponent>
  );
}
