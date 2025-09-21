
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import url from '../../host/host';
import LayoutComponent from '../../components/LayoutComponent';
import DavomatModal from '../../components/DavomatModal';
import ErrorModal from '../../components/ErrorModal';
import styles from '../../styles/DavomatPage.module.css';

export default function DavomatPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [bolalar, setBolalar] = useState([]);
  const [filteredBolalar, setFilteredBolalar] = useState([]);
  const [darsKunlar, setDarsKunlar] = useState([]);
  const [davomatlar, setDavomatlar] = useState([]);
  const [guruhlar, setGuruhlar] = useState([]);
  const [selectedGuruh, setSelectedGuruh] = useState('');
  const [selected, setSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnmarkedOnly, setFilterUnmarkedOnly] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state
  const [permissions, setPermissions] = useState({
    view_attendance: false,
    create_attendance: false,
    edit_attendance: false,
    delete_attendance: false,
  });

  const token = (typeof window !== "undefined") ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchGuruhlar = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/guruh`, authHeader);
      setGuruhlar(res.data);
    } catch (err) {
      console.error('Guruhlar olishda xatolik:', err);
      if (err.response?.status === 403) {
        setErrorMessage('Guruhlarni olish uchun ruxsat yo‘q');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDarsKunlar = async () => {
    try {
      setLoading(true);
      const [year, monthNum] = month.split('-');
      const res = await axios.get(`${url}/bola_kun_all?year=${year}&month=${monthNum}`, authHeader);
      const sorted = res.data
        .filter(d => d.sana.startsWith(month))
        .sort((a, b) => new Date(a.sana) - new Date(b.sana));
      setDarsKunlar(sorted);
    } catch (err) {
      console.error('Dars kunlarini olishda xatolik:', err);
      if (err.response?.status === 403) {
        setErrorMessage('Dars kunlarini olish uchun ruxsat yo‘q');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDavomatlar = async () => {
    try {
      // setLoading(true);
      const res = await axios.get(`${url}/bola_kun`, authHeader);
      setDavomatlar(res.data);
    } catch (err) {
      console.error('Davomatlarni olishda xatolik:', err);
      if (err.response?.status === 403 && err.config.url.includes('bola_kun')) {
        setErrorMessage('Davomatlarni olish uchun ruxsat yo‘q');
      } else {
        setErrorMessage('Davomatlarni olishda noma’lum xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBolalar = async (selectedMonth) => {
    try {
      setLoading(true);
      const [year, monthNum] = selectedMonth.split('-');
      const [bolalarRes, davomatRes, darsSanaRes] = await Promise.all([
        axios.get(`${url}/bola/all`, authHeader),
        axios.get(`${url}/bola_kun`, authHeader),
        axios.get(`${url}/bola_kun_all?year=${year}&month=${monthNum}`, authHeader),
      ]);

      const allBolalar = bolalarRes.data;
      const allDavomat = davomatRes.data;
      const allDarsSana = darsSanaRes.data;

      const thisMonthDarsIds = allDarsSana
        .filter(d => d.sana.startsWith(selectedMonth))
        .map(d => d.id);

      const monthBolaIds = allDavomat
        .filter(bk => thisMonthDarsIds.includes(bk.darssana_id))
        .map(bk => bk.bola_id);

      const visibleBolalar = allBolalar.filter(bola =>
        bola.is_active || monthBolaIds.includes(bola.id)
      );

      setBolalar(visibleBolalar);
      filterBolalar(visibleBolalar, selectedGuruh, searchQuery, filterUnmarkedOnly);
    } catch (err) {
      console.error('Xatolik bolalarni olishda:', err);
      if (err.response?.status === 403 && err.config.url.includes('bola_kun')) {
        setErrorMessage('Bolalarni olish uchun ruxsat yo‘q');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const type = localStorage.getItem('type') ? localStorage.getItem('type'): null;
      const adminId = type === '3' && typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('admin'))?.id : null;

      let permissionsData = {
        view_attendance: true,
        create_attendance: true,
        edit_attendance: true,
        delete_attendance: true,
      };

      if (type === '3') {
        const res = await axios.get(`${url}/permissions/${adminId}`, authHeader);
        permissionsData = res?.data?.permissions || permissionsData;
      }
      setPermissions(permissionsData);
    } catch (err) {
      console.error('Ruxsatlarni olishda xatolik:', err);
      if (err.response?.status === 403) {
        setErrorMessage('Ruxsatlarni olish uchun ruxsat yo‘q');
      }
    } finally {
      setLoading(false);
    }
  };
const [today, setToday] = useState("");

useEffect(() => {
  setToday(new Date().toISOString().slice(0, 10));
}, []);
  const filterBolalar = (list, guruhId, search, unmarkedOnly) => {
    let result = list;

    if (guruhId) {
      result = result.filter(bola => bola.guruh_id == guruhId);
    }

    if (search) {
      result = result.filter(bola =>
        bola.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (unmarkedOnly) {
      // const today = new Date().toISOString().slice(0, 10);
      const todayLesson = darsKunlar.find(d => d.sana.slice(0, 10) === today);
      if (todayLesson) {
        result = result.filter(bola => {
          return !davomatlar.find(
            d => d.bola_id === bola.id && d.darssana_id === todayLesson.id
          );
        });
      }
    }

    result = result.sort((a, b) =>
      a.username.localeCompare(b.username, 'uz', { sensitivity: 'base' })
    );

    setFilteredBolalar(result);
  };

  const handleGuruhChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedGuruh(selectedValue);
    filterBolalar(bolalar, selectedValue, searchQuery, filterUnmarkedOnly);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterBolalar(bolalar, selectedGuruh, query, filterUnmarkedOnly);
  };

  const toggleUnmarkedOnly = () => {
    const newValue = !filterUnmarkedOnly;
    setFilterUnmarkedOnly(newValue);
    filterBolalar(bolalar, selectedGuruh, searchQuery, newValue);
  };

  const openModal = (bola, dars) => {
    if (!permissions.edit_attendance && !permissions.create_attendance && !permissions.delete_attendance) {
      setErrorMessage("Sizda davomatni o‘zgartirish uchun ruxsat yo‘q!");
      return;
    }
    setErrorMessage('');
    setSelected({ bola, dars });
  };

  const handleDavomatSelect = async (holati) => {
    if (!selected) return;

    if (!permissions.create_attendance && !permissions.edit_attendance && !permissions.delete_attendance) {
      setErrorMessage("Sizda davomatni o‘zgartirish uchun ruxsat yo‘q!");
      return;
    }

    const { bola, dars } = selected;
    const existing = davomatlar.find(d => d.bola_id === bola.id && d.darssana_id === dars.id);

    const payload = { bola_id: bola.id, darssana_id: dars.id, holati };
    const endpoint = existing ? `${url}/bola_kun/${existing.id}` : `${url}/bola_kun`;
    const method = existing ? 'put' : 'post';

    try {
      // setLoading(true);
      await axios[method](endpoint, payload, authHeader);
      await fetchDavomatlar();
      setSelected(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMessage('Davomatni saqlash uchun ruxsat yo‘q');
      } else {
        console.error('Xatolik:', err);
        setErrorMessage('Davomatni saqlashda noma’lum xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    fetchPermissions();
    fetchGuruhlar();
    fetchDavomatlar();
  }, []);

  useEffect(() => {
    fetchDarsKunlar();
    fetchBolalar(month);
  }, [month]);

  useEffect(() => {
    filterBolalar(bolalar, selectedGuruh, searchQuery, filterUnmarkedOnly);
  }, [selectedGuruh, searchQuery, filterUnmarkedOnly, bolalar, davomatlar, darsKunlar]);

  useEffect(() => {
    if (errorMessage) setSelected(null);
  }, [errorMessage]);

  return (
    <LayoutComponent>
      {permissions.view_attendance ? (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>Bog‘cha Dars Kunlari Davomat</h2>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                const newMonth = e.target.value;
                setMonth(newMonth);
                fetchBolalar(newMonth);
              }}
              className={styles.monthInput}
            />
            <input
              type="text"
              placeholder="Ism yoki familiya..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <select
              value={selectedGuruh}
              onChange={handleGuruhChange}
              className={styles.select}
            >
              <option value="">Barcha guruhlar</option>
              {guruhlar.map(guruh => (
                <option key={guruh.id} value={guruh.id}>{guruh.name}</option>
              ))}
            </select>
            <button onClick={toggleUnmarkedOnly} className={styles.filterBtn}>
              {filterUnmarkedOnly ? '🔁 Barchasini ko‘rsatish' : '🕒 Bugun belgilanmaganlar'}
            </button>
          </div>

          {loading ? (
            <p style={{ padding: '10px' }}>Yuklanmoqda...</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', position: 'sticky', left: '0px', zIndex: 22, top: '0px' }}>№</th>
                    <th style={{ position: 'sticky', left: '45px', zIndex: 22 }}>Ism Familiya</th>
                    {darsKunlar.map(d => (
                      <th key={d.id}>{d.sana.slice(8, 10)}</th>
                    ))}
                    <th>✅ Bor</th>
                    <th>❌ Yo‘q</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBolalar.map((bola, index) => {
                    const bolaDavomat = davomatlar.filter(
                      v => v.bola_id === bola.id &&
                           darsKunlar.some(d => d.id === v.darssana_id)
                    );

                    const bor = bolaDavomat.filter(v => v.holati === 1).length;
                    const yoq = bolaDavomat.filter(v => v.holati === 2).length;

                    return (
                      <tr key={bola.id}>
                        <td style={{ textAlign: 'center', position: 'sticky', left: '0px', background: 'aqua', zIndex: 22 }}>{index + 1}</td>
                        <td style={{ position: 'sticky', left: '45px', background: 'aqua', zIndex: 22 }}>{bola.username}</td>
                        {darsKunlar.map(d => {
                          const entry = davomatlar.find(
                            v => v.bola_id === bola.id && v.darssana_id === d.id
                          );
                          const mark = entry?.holati === 1 ? '✅' : entry?.holati === 2 ? '❌' : '';
                          return (
                            <td
                              key={d.id}
                              style={{ cursor: permissions.edit_attendance || permissions.create_attendance || permissions.delete_attendance ? 'pointer' : 'default', textAlign: 'center' }}
                              onClick={() => openModal(bola, d)}
                            >
                              {mark}
                            </td>
                          );
                        })}
                        <td>{bor}</td>
                        <td>{yoq}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ fontWeight: 'bold', position: 'sticky', zIndex: 333, left: '0px', background: 'aqua' }}></td>
                    <td style={{ fontWeight: 'bold', position: 'sticky', zIndex: 333, left: '40px', background: 'aqua' }}>Kun bo‘yicha:</td>
                    {darsKunlar.map(d => {
                      const kunDavomat = davomatlar.filter(
                        v => v.darssana_id === d.id &&
                             filteredBolalar.some(b => b.id === v.bola_id)
                      );
                      const bor = kunDavomat.filter(v => v.holati === 1).length;
                      const yoq = kunDavomat.filter(v => v.holati === 2).length;

                      return (
                        <td key={d.id} style={{ fontSize: '12px', lineHeight: '14px', textAlign: 'center' }}>
                          ✅ {bor}<br />❌ {yoq}
                        </td>
                      );
                    })}
                    <td style={{ fontWeight: 'bold', color: '#166534' }}>
                      {
                        davomatlar.filter(
                          v => v.holati === 1 &&
                               filteredBolalar.some(b => b.id === v.bola_id) &&
                               darsKunlar.some(d => d.id === v.darssana_id)
                        ).length
                      }
                    </td>
                    <td style={{ fontWeight: 'bold', color: '#991b1b' }}>
                      {
                        davomatlar.filter(
                          v => v.holati === 2 &&
                               filteredBolalar.some(b => b.id === v.bola_id) &&
                               darsKunlar.some(d => d.id === v.darssana_id)
                        ).length
                      }
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {selected && (permissions.create_attendance || permissions.edit_attendance || permissions.delete_attendance) && (
            <DavomatModal
              bola={selected.bola}
              sana={selected.dars.sana}
              onClose={() => setSelected(null)}
              onSelect={handleDavomatSelect}
              canEdit={permissions.edit_attendance}
              canCreate={permissions.create_attendance}
              canDelete={permissions.delete_attendance}
            />
          )}

          <ErrorModal
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        </>
      ) : (
        <p style={{ padding: '20px', color: 'red' }}>
          Sizda davomatni ko‘rish uchun ruxsat yo‘q!
        </p>
      )}
    </LayoutComponent>
  );
}
