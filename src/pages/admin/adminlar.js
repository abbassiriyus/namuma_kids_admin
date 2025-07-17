'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutComponent from '@/components/LayoutComponent';
import PermissionTable from '@/components/PermissionTable';
import styles from '@/styles/Adminlar.module.css';
import { useRouter } from 'next/navigation';
import url from '@/host/host';

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
  const [permissions, setPermissions] = useState({});
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchAdmins();
  }, [activeType]);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${url}/admin?type=${activeType}`);
      const sortedAdmins = res.data.sort((a, b) =>
  a.username.localeCompare(b.username, 'uz', { sensitivity: 'base' })
);

      setAdmins(sortedAdmins);
    } catch (err) {
      alert('Adminlarni yuklashda xatolik.');
    }
  };

  const fetchPermissions = async (adminId) => {
    try {
      const res = await axios.get(`${url}/permissions/${adminId}`);
      setPermissions(res.data.permissions || {});
      setSelectedAdminId(adminId);
    } catch (err) {
      alert('Ruxsatlarni yuklashda xatolik');
    }
  };

  const handleSavePermissions = async () => {
    try {
      await axios.post(`${url}/permissions/${selectedAdminId}`, { permissions });
      alert('✅ Ruxsatlar saqlandi');
    } catch (err) {
      alert('Saqlashda xatolik');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Aniq o‘chirmoqchimisiz?')) {
      await axios.delete(`${url}/admin/${id}`);
      fetchAdmins();
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await axios.post(`${url}/admin`, form);
    setForm({ username: '', phone_number: '', password: '', type: 3, is_active: false });
    fetchAdmins();
  };

  const fetchGroups = async () => {
    const res = await axios.get(`${url}/guruh`);
    setAvailableGroups(res.data);
  };

  const fetchGroupAssignments = async (adminId) => {
    setSelectedAdminId(adminId);
    await fetchGroups();
    const res = await axios.get(`${url}/group-admin?admin_id=${adminId}`);
    const groupIds = res.data.map((g) => g.group_id);
    setSelectedGroups(groupIds);
    setShowGroupModal(true);
  };

  const handleSaveGroups = async () => {
    await axios.post(`${url}/group-admin/${selectedAdminId}`, {
      group_ids: selectedGroups
    });
    alert("✅ Guruhlar biriktirildi");
    setShowGroupModal(false);
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
                  <button onClick={() => handleDelete(a.id)}>🗑️</button>
                  {activeType === 3 && (
                    <button onClick={() => fetchPermissions(a.id)}>⚙️ Ruxsat</button>
                  )}
                  {activeType === 2 && (
                    <button onClick={() => fetchGroupAssignments(a.id)}>🏫 Guruhlar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {activeType === 3 && selectedAdminId && (
          <div className={styles.permissions}>
            <h3>🔧 Ruxsatlarni boshqarish (ID: {selectedAdminId})</h3>
            <PermissionTable permissions={permissions} setPermissions={setPermissions} />
            <button onClick={handleSavePermissions}>💾 Saqlash</button>
          </div>
        )}

        <form onSubmit={handleCreate} className={styles.form}>
          <h3>➕ Yangi admin qo‘shish</h3>
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
            required
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
          <button type="submit">Qo‘shish</button>
        </form>
      </div>

      {/* Modal for Guruhlar biriktirish */}
      {showGroupModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>🏫 Guruh biriktirish (Admin ID: {selectedAdminId})</h3>
            <div className={styles.groupList}>
              {availableGroups.map((g) => (
                <label key={g.id}>
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(g.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroups([...selectedGroups, g.id]);
                      } else {
                        setSelectedGroups(selectedGroups.filter((id) => id !== g.id));
                      }
                    }}
                  />
                  {g.name}
                </label>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveGroups}>💾 Saqlash</button>
              <button onClick={() => setShowGroupModal(false)}>❌ Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </LayoutComponent>
  );
}
