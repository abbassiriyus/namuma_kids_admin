'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import AdminHeader from '@/components/AdminHeader';
import styles from '@/styles/hodimlar.module.css';
import url from '@/host/host';

function getMonthDays(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push({ date: new Date(date), checked: false });
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function Hodimlar() {
  const [data, setData] = useState([]);
  const [lavozimlar, setLavozimlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', phone: '', lavozim_id: '', address: '', oylik: '',
    ish_tur: '1', image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [settingsModal, setSettingsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [monthDays, setMonthDays] = useState([]);
  const [activeTab, setActiveTab] = useState('davomat');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchLavozimlar();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/xodim`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLavozimlar = async () => {
    try {
      const res = await axios.get(`${url}/lavozim`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLavozimlar(res.data);
    } catch (err) {
      console.error('Lavozimlarni olishda xatolik:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      // console.log(value);
      // console.log(name);
      
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      for (const key in form) {
        if (key === 'image') {
          if (form.image instanceof File) {
            formData.append('image', form.image);
          }
        } else {
          formData.append(key, form[key]);
        }
      }
      if (editId) {
        await axios.put(`${url}/xodim/${editId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${url}/xodim`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      fetchData();
      setForm({
        name: '', phone: '', lavozim_id: '', address: '', oylik: '',
        ish_tur: '1', image: null
      });
      setEditId(null);
      setShowModal(false);
      setImagePreview(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      ish_tur: item.ish_tur.toString(),
      image: null
    });
    setEditId(item.id);
    setImagePreview(item.image ? `${url}/upload/${item.image}` : null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
      try {
        await axios.delete(`${url}/xodim/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchData();
      } catch (err) {
        console.error('O‘chirishda xatolik:', err);
      }
    }
  };
const loadWorkDays = async (employee, year, month) => {
  const days = getMonthDays(year, month - 1); // JS month 0-based
  try {
    const res = await axios.get(`${url}/xodim/${employee.id}/workday`, {
      params: { year, month },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const selectedDates = res.data;
    const updatedDays = days.map(day => ({
      ...day,
      checked: selectedDates.includes(day.date.toISOString().slice(0, 10))
    }));
    setMonthDays(updatedDays);
    setSelectedEmployee({ ...employee, year, month });
    setSettingsModal(true);
  } catch (err) {
    console.error("Ish kunlarini olishda xatolik:", err);
    alert("Ish kunlarini olishda xatolik yuz berdi");
  }
};


  const openSettingsModal = async (employee) => {
    if (employee.ish_tur !== 2) return;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    loadWorkDays(employee, currentYear, currentMonth);
    const days = getMonthDays(currentYear, currentMonth);
    try {
      const res = await axios.get(`${url}/xodim/${employee.id}/workday`, {
        params: {
          year: currentYear,
          month: currentMonth + 1
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const selectedDates = res.data;
      const updatedDays = days.map(day => ({
        ...day,
        checked: selectedDates.includes(day.date.toISOString().slice(0, 10))
      }));
      setSelectedEmployee({
        ...employee,
        year: currentYear,
        month: currentMonth + 1
      });
      setMonthDays(updatedDays);
      setSettingsModal(true);
    } catch (err) {
      console.error("Ish kunlarini olishda xatolik:", err);
      alert("Ish kunlarini olishda xatolik yuz berdi");
    }
  };

  const columnTitles = {
    id: 'ID', name: 'F.I.Sh', phone: 'Telefon', lavozim_nomi: 'Lavozim',
    address: 'Manzil', oylik: 'Oylik', ish_tur: 'Ish turi', image: 'Rasm', created_at: 'Yaratilgan'
  };

  return (
    <LayoutComponent>
      <AdminHeader title="Xodimlar" onCreate={() => {
        setForm({
          name: '', phone: '', lavozim_id: '', address: '', oylik: '',
          ish_tur: '1', image: null
        });
        setEditId(null);
        setImagePreview(null);
        setShowModal(true);
      }} />

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className={activeTab === 'davomat' ? styles.activeTab : ''} onClick={() => setActiveTab('davomat')}>Davomat bilan</button>
          <button className={activeTab === 'erkin' ? styles.activeTab : ''} onClick={() => setActiveTab('erkin')}>Erkin ish</button>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Ism yoki telefon raqam..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

{/* Modal — Yaratish/Tahrirlash */}
{showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3>{editId ? 'Xodimni tahrirlash' : 'Yangi xodim yaratish'}</h3>
      <div className={styles.formGroup}>
        <label>F.I.Sh</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} />
      </div>
      <div className={styles.formGroup}>
        <label>Telefon</label>
        <input type="text" name="phone" value={form.phone} onChange={handleChange} />
      </div>
      <div className={styles.formGroup}>
        <label>Lavozim</label>
        <select name="lavozim_id" value={form.lavozim_id} onChange={handleChange}>
          <option value="">Tanlang</option>
          {lavozimlar.map((lavozim) => (
            <option key={lavozim.id} value={lavozim.id}>{lavozim.name}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>Manzil</label>
        <input type="text" name="address" value={form.address} onChange={handleChange} />
      </div>
      <div className={styles.formGroup}>
        <label>Oylik</label>
        <input type="number" name="oylik" value={form.oylik} onChange={handleChange} />
      </div>
      <div className={styles.formGroup}>
        <label>Ish turi</label>
        <select name="ish_tur" value={form.ish_tur} onChange={handleChange}>
          <option value="1">Davomat bilan</option>
          <option value="2">Erkin ish</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>Rasm</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" className={styles.previewImg} />}
      </div>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <div className={styles.modalButtons}>
        <button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
        <button onClick={() => setShowModal(false)}>Bekor qilish</button>
      </div>
    </div>
  </div>
)}


      {/* Modal — Settings */}
      {settingsModal && (
        <div className={styles.modalOverlay}>
          
          <div className={styles.modal}>
            <h3>{selectedEmployee?.name} — ishlaydigan kunlar</h3>


{/* Oy va yil tanlash */}
<div className={styles.monthYearSelector}>
  <select
    value={selectedEmployee?.month}
    onChange={(e) => {
      const month = parseInt(e.target.value);
      loadWorkDays(selectedEmployee, selectedEmployee.year, month);
    }}
  >
    {Array.from({ length: 12 }).map((_, idx) => (
      <option key={idx + 1} value={idx + 1}>
        {new Date(0, idx).toLocaleString('uz-UZ', { month: 'long' })}
      </option>
    ))}
  </select>

  <select
    value={selectedEmployee?.year}
    onChange={(e) => {
      const year = parseInt(e.target.value);
      loadWorkDays(selectedEmployee, year, selectedEmployee.month);
    }}
  >
    {Array.from({ length: 5 }).map((_, idx) => {
      const y = new Date().getFullYear() - 2 + idx;
      return <option key={y} value={y}>{y}</option>;
    })}
  </select>
</div>


            <div className={styles.calendarGrid}>
              {monthDays.map((day, idx) => (
                <label key={idx} className={styles.dayBox}>
                  <input
                    type="checkbox"
                    checked={day.checked}
                    onChange={async () => {
                      const updated = [...monthDays];
                      const newChecked = !day.checked;
                      updated[idx].checked = newChecked;
                      setMonthDays(updated);

                      // ⏱️ +1 kun qo‘shish
                      const nextDay = new Date(day.date);
                      nextDay.setDate(nextDay.getDate() + 1);
                      const dateStr = nextDay.toISOString().slice(0, 10);

                      try {
                        if (newChecked) {
                          await axios.post(
                            `${url}/xodim/${selectedEmployee.id}/workday`,
                            { day: dateStr },
                            {
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            }
                          );
                        } else {
                          await axios.delete(
                            `${url}/xodim/${selectedEmployee.id}/workday`,
                            {
                              data: { days: [dateStr] },
                              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            }
                          );
                        }
                      } catch (err) {
                        console.error("Xatolik:", err);
                        alert("Xatolik yuz berdi");
                      }
                    }}
                  />
                  {day.date.getDate()} - {day.date.toLocaleDateString('uz-UZ', { weekday: 'short' })}
                </label>
              ))}
            </div>
            <div className={styles.modalButtons}>
              <button onClick={() => setSettingsModal(false)}>Yopish</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen image */}
      {fullscreenImage && (
        <div className={styles.fullscreenImageOverlay} onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} className={styles.fullscreenImage} />
        </div>
      )}

      {/* Jadval */}
      {loading ? (
        <p style={{ padding: '10px' }}>Yuklanmoqda...</p>
      ) : (
        <AdminTable
          title={activeTab === 'davomat' ? "Davomat bilan xodimlar" : "Erkin ish xodimlar"}
          columns={Object.keys(columnTitles)}
          columnTitles={columnTitles}
          data={data
            .filter(d => (activeTab === 'davomat' ? d.ish_tur === 1 : d.ish_tur === 2))
            .filter(d =>
              d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.phone.includes(searchTerm)
            )
            .map(d => ({
              ...d,
              image: d.image ? (
                <img
                  src={`${url}/upload/${d.image}`}
                  alt=""
                  className={styles.tableImg}
                  onClick={() => setFullscreenImage(`${url}/upload/${d.image}`)}
                />
              ) : '—',
              ish_tur: d.ish_tur === 1 ? 'Davomat bilan' : (
                <>
                  Erkin
                  <button
                    onClick={() => openSettingsModal(d)}
                    style={{ marginLeft: '8px', cursor: 'pointer' }}
                    title="Setting"
                  >⚙️</button>
                </>
              )
            }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </LayoutComponent>
  );
}
