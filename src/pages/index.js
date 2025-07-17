'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/Login.module.css'; // agar css yo'q bo‘lsa, bu qatorni olib tashlang
import url from '../host/host'; // bu sizning backend API bazangiz URL

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/admin/login`, {
        username,
        password,
      });

      const { token, admin } = response.data;
      const type = admin.type;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('type', type);
        localStorage.setItem('admin', JSON.stringify(admin));


        if (type === 1 || type===3) {
          router.push('/admin/dashboard');
        } else if (type === 2) {
          router.push('/tarbiyachi/davomat');
        } else {
          setError("Nomaʼlum foydalanuvchi turi");
        }
      } else {
        setError("Login yoki parol noto‘g‘ri");
      }
    } catch (err) {
      setError("Server bilan bog‘lanishda xatolik: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.bg}>
      <div className={styles.overlay}></div>
      <form onSubmit={handleLogin} className={styles.loginBox}>
        <h2>Admin Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Foydalanuvchi nomi"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Kirish</button>
      </form>
    </div>
  );
}
