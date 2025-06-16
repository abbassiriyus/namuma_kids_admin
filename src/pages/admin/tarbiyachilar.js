import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import AdminTable from '../../components/AdminTable';

const mockData = [
  { id: 1, FIO: 'Ali Aliyev', Lavozim: 'Tarbiyachi', Telefon: '998901234567' },
  { id: 2, FIO: 'Zulfiya Karimova', Lavozim: 'Tarbiyachi', Telefon: '998911234567' },
];

export default function Tarbiyachilar() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/');
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <AdminTable
          title="Tarbiyachilar"
          columns={['id', 'FIO', 'Lavozim', 'Telefon']}
          data={mockData}
        />
      </div>
    </div>
  );
}
