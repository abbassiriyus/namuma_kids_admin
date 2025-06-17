'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/Login.module.css';
import url from '../host/host'; // Bu yerda sizning backend API bazangiz `url` sifatida eksport qilingan bo'lishi kerak

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

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        router.push('/admin/dashboard');
      } else {
        setError("Login yoki parol noto‘g‘ri");
      }
    } catch (err) {
      setError("Server bilan bog‘lanishda xatolik: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.bg}>
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
