'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();



  const handleLogin = (e) => {
    e.preventDefault();
    // Foydalanuvchini tekshirish (demo: admin/1234)
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('token', 'my_secret_token');
      router.push('/admin/dashboard');
    } else {
      setError("Login yoki parol noto‘g‘ri");
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
