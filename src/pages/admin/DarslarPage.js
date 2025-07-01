'use client';
import React, { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import axios from 'axios';
import url from '@/host/host';
import styles from '@/styles/Calendar.module.css';

export default function DarslarPage() {
  const today = new Date();
  const [yearMonth, setYearMonth] = useState(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDates, setSelectedDates] = useState([]);

  const [year, month] = yearMonth.split('-').map(Number);

  useEffect(() => {
    fetchSelectedDates();
  }, [yearMonth]);

  const fetchSelectedDates = async () => {
    try {
      const res = await axios.get(`${url}/bola_kun_all?month=${month}&year=${year}`);
      const dates = res.data.map(item => new Date(item.sana).toLocaleDateString('sv-SE'));
      setSelectedDates(dates);
    } catch (err) {
      console.error('Xatolik:', err);
    }
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const handleCheckboxChange = async (dateStr) => {
    const isoDate = new Date(dateStr);
    isoDate.setDate(isoDate.getDate() + 1);
    const sanaPlusOne = isoDate.toISOString();
    const isChecked = selectedDates.includes(dateStr);
    try {
      if (isChecked) {
        await axios.delete(`${url}/bola_kun_all`, { data: { sana: sanaPlusOne } });
        setSelectedDates(prev => prev.filter(d => d !== dateStr));
      } else {
        await axios.post(`${url}/bola_kun_all`, {
          sana: sanaPlusOne,
          mavzu: 'Avtomatik mavzu'
        });
        setSelectedDates(prev => [...prev, dateStr]);
      }
    } catch (err) {
      console.error('Xatolik:', err);
    }
  };

  const handleAutoFill = async () => {
    const days = getDaysInMonth(year, month);
    const newDates = [];
    for (const day of days) {
      const dateStr = day.toLocaleDateString('sv-SE');
      if (!selectedDates.includes(dateStr)) {
        const isoDate = new Date(dateStr);
        isoDate.setDate(isoDate.getDate() + 1);
        const sanaPlusOne = isoDate.toISOString();
        await axios.post(`${url}/bola_kun_all`, {
          sana: sanaPlusOne,
          mavzu: 'Avtomatik mavzu'
        });
        newDates.push(dateStr);
      }
    }
    setSelectedDates(prev => [...prev, ...newDates]);
  };

  const days = getDaysInMonth(year, month);

  return (
    <LayoutComponent>
      <div className={styles.calendar}>
        <div className={styles.calendar__top}>
          <label htmlFor="month-select" className={styles.calendar__label}>Oy tanlang:</label>
          <input
            id="month-select"
            type="month"
            className={styles.calendar__monthInput}
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          />
          <button onClick={handleAutoFill} className={styles.calendar__autofillBtn}>Avtomatik to'ldirish</button>
        </div>

        <h2 className={styles.calendar__title}>📅 {year}-{String(month).padStart(2, '0')}</h2>

        <div className={styles.calendar__grid}>
          {days.map((day, idx) => {
            const dateStr = day.toLocaleDateString('sv-SE');
            const checked = selectedDates.includes(dateStr);
            const isSunday = day.getDay() === 0;
            return (
              <div key={idx} className={`${styles.calendar__day} ${isSunday ? styles.calendar__sunday : ''}`}>
                <div className={styles.calendar__date}>{dateStr}</div>
                <input
                  type="checkbox"
                  className={styles.calendar__checkbox}
                  checked={checked}
                  onChange={() => handleCheckboxChange(dateStr)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </LayoutComponent>
  );
} 
