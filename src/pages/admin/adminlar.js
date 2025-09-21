'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutComponent from '../../components/LayoutComponent';
import PermissionTable from '../../components/PermissionModal';
import styles from '../../styles/Adminlar.module.css';
import { useRouter } from 'next/navigation';
import url from '../../host/host';

const TABS = [
  { label: 'Super Adminlar', type: 1 },
  { label: 'Tarbiyachilar', type: 2 },
  { label: 'Qo‘shimcha Adminlar', type: 3 }
];

export default function AdminTabs() {
  const [activeType, setActiveType] = useState(1);
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    username: '',
    phone_number: '',
    password: '',
    type: 3,
    is_active: false
  });
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [permissions, setPermissions] = useState({});
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const [showAdminModal, setShowAdminModal] = useState(false);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [myPermissions, setMyPermissions] = useState({});

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminStr = localStorage.getItem('admin');
    if (!token || !adminStr) return router.push('/login');

    const admin = JSON.parse(adminStr);
    setIsSuperAdmin(admin.type === 1);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    if (admin.type === 3) {
      axios.get(`${url}/permissions/${admin.id}`).then(res => {
        setMyPermissions(res.data.permissions || {});
      });
    }

    fetchAdmins();
  }, [activeType]);

  const hasPermission = (actionKey) => {
    return isSuperAdmin || !!myPermissions[actionKey];
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${url}/admin?type=${activeType}`);
      const sortedAdmins = res.data.sort((a, b) =>
        a.username.localeCompare(b.username, 'uz', { sensitivity: 'base' })
      );
      setAdmins(sortedAdmins);
    } catch {
      alert('Adminlarni yuklashda xatolik.');
    }
  };

  const fetchPermissions = async (adminId) => {
    if (!hasPermission('edit_admins')) {
      return alert('❌ Sizda ruxsat yo‘q');
    }
    try {
      const res = await axios.get(`${url}/permissions/${adminId}`);
      setPermissions(res.data.permissions || {});
      setSelectedAdminId(adminId);
      setShowPermissionModal(true);
    } catch {
      alert('Ruxsatlarni yuklashda xatolik');
    }
  };

  const handleSavePermissions = async () => {
    try {
      await axios.post(`${url}/permissions/${selectedAdminId}`, { permissions });
      alert('✅ Ruxsatlar saqlandi');
      setShowPermissionModal(false);
    } catch {
      alert('Saqlashda xatolik');
    }
  };

  const handleDelete = async (id) => {
    if (!hasPermission('delete_admins')) {
      return alert('❌ Sizda ruxsat yo‘q');
    }
    if (confirm('Aniq o‘chirmoqchimisiz?')) {
      await axios.delete(`${url}/admin/${id}`);
      fetchAdmins();
    }
  };

  const handleOpenCreate = () => {
    setSelectedAdmin(null);
    setForm({ username: '', phone_number: '', password: '', type: 3, is_active: false });
    setShowAdminModal(true);
  };

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    setForm({
      username: admin.username,
      phone_number: admin.phone_number,
      password: '',
      type: admin.type,
      is_active: admin.is_active
    });
    setShowAdminModal(true);
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    if (selectedAdmin) {
      if (!hasPermission('edit_admins')) {
        return alert('❌ Sizda ruxsat yo‘q');
      }
      await axios.put(`${url}/admin/${selectedAdmin.id}`, form);
    } else {
      if (!hasPermission('create_admins')) {
        return alert('❌ Sizda ruxsat yo‘q');
      }
      await axios.post(`${url}/admin`, form);
    }
    setShowAdminModal(false);
    fetchAdmins();
  };

  return (
    <LayoutComponent>
      <div className={styles.wrapper}>
        <h2>👤 Adminlar</h2>

        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveType(tab.type)}
              className={`${styles.tab} ${activeType === tab.type ? styles.tabActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Foydalanuvchi</th>
              <th>Telefon</th>
              <th>Faolmi?</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.username}</td>
                <td>{a.phone_number}</td>
                <td>{a.is_active ? '✅' : '❌'}</td>
                <td className={styles.actions}>
                  {hasPermission('edit_admins') && (
                    <button onClick={() => handleOpenEdit(a)}>✏️</button>
                  )}
                  {hasPermission('delete_admins') && (
                    <button onClick={() => handleDelete(a.id)}>🗑️</button>
                  )}
                  {activeType === 3 && hasPermission('edit_admins') && (
                    <button onClick={() => fetchPermissions(a.id)}>⚙️ Ruxsat</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showPermissionModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>🔧 Ruxsatlarni boshqarish (ID: {selectedAdminId})</h3>
              <PermissionTable
                permissions={permissions}
                setPermissions={setPermissions}
                onSave={handleSavePermissions}
                onClose={() => setShowPermissionModal(false)}
              />
            </div>
          </div>
        )}

        {hasPermission('create_admins') && (
          <button className={styles.addBtn} onClick={handleOpenCreate}>
            ➕ Yangi admin qo‘shish
          </button>
        )}

        {showAdminModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>{selectedAdmin ? '✏️ Adminni tahrirlash' : '➕ Yangi admin qo‘shish'}</h3>
              <form onSubmit={handleSaveAdmin} className={styles.form}>
                <input
                  placeholder="Foydalanuvchi nomi"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
                <input
                  placeholder="Telefon raqam"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Parol"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!selectedAdmin}
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: parseInt(e.target.value) })}
                >
                  <option value={1}>Super Admin</option>
                  <option value={2}>Tarbiyachi</option>
                  <option value={3}>Qo‘shimcha Admin</option>
                </select>
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Faolmi?
                </label>
                <div className={styles.modalActions}>
                  <button type="submit">💾 Saqlash</button>
                  <button type="button" onClick={() => setShowAdminModal(false)}>❌ Bekor qilish</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
}
