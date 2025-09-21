'use client';

import { useState } from 'react';
import styles from '../styles/PermissionModal.module.css';

export default function PermissionModal({ permissions, setPermissions, onSave, onClose }) {
  const groupedPermissions = {
    '📊 Dashboard': ['view_dashboard'],
    '🛡️ Adminlar': ['view_admins', 'create_admins', 'edit_admins', 'delete_admins'],
    '👶 Tarbiyalanuvchi': ['view_students', 'create_students', 'edit_students', 'delete_students'],
    '👶 Sinov bola': ['view_prp', 'create_prp', 'edit_prp', 'delete_prp'],
    '🏫 Guruhlar': ['view_groups', 'create_groups', 'edit_groups', 'delete_groups'],
    '📆 Sinov Davomat': ['view_sinovdavomat', 'create_sinovdavomat', 'edit_sinovdavomat', 'delete_sinovdavomat'],
    '📆 Davomat': ['view_attendance', 'create_attendance', 'edit_attendance', 'delete_attendance'],
    '📚 Bola Kuni (Darslar)': ['view_lessons', 'create_lessons', 'edit_lessons', 'delete_lessons'],
    '💵 Tolovlar': ['view_payments', 'create_payments', 'edit_payments', 'delete_payments'],
    '👷 Hodimlar': ['view_employees', 'create_employees', 'edit_employees', 'delete_employees'],
    '📑 Oyliklar': ['view_salaries', 'create_salaries', 'edit_salaries', 'delete_salaries'],
    '📋 Lavozim': ['view_positions', 'create_positions', 'edit_positions', 'delete_positions'],
    '🍽 Maxsus Taomnoma': ['view_meals', 'create_meals', 'edit_meals', 'delete_meals'],
    '➕ Qo‘shimcha': ['view_extras', 'create_extras', 'edit_extras', 'delete_extras'],
    '👨‍🍳 Oshxona': [
      'view_kitchen_incomes', 'create_kitchen_incomes', 'edit_kitchen_incomes', 'delete_kitchen_incomes',
      'view_kitchen_expenses', 'create_kitchen_expenses', 'edit_kitchen_expenses', 'delete_kitchen_expenses',
      'view_kitchen_storage', 'create_kitchen_storage', 'edit_kitchen_storage', 'delete_kitchen_storage',
    ],
    '🧺 Maishiy': [
      'view_household_incomes', 'create_household_incomes', 'edit_household_incomes', 'delete_household_incomes',
      'view_household_expenses', 'create_household_expenses', 'edit_household_expenses', 'delete_household_expenses',
      'view_household_storage', 'create_household_storage', 'edit_household_storage', 'delete_household_storage',
    ]
  };

  const permissionLabels = {
    view_dashboard: "Dashboardni ko‘rish",

    view_admins: "Adminlarni ko‘rish",
    create_admins: "Admin qo‘shish",
    edit_admins: "Adminni tahrirlash",
    delete_admins: "Adminni o‘chirish",

    view_students: "Tarbiyalanuvchilarni ko‘rish",
    create_students: "Tarbiyalanuvchi qo‘shish",
    edit_students: "Tarbiyalanuvchini tahrirlash",
    delete_students: "Tarbiyalanuvchini o‘chirish",

    view_prp: "Sinov bolalarni ko‘rish",
    create_prp: "Sinov bola qo‘shish",
    edit_prp: "Sinov bolani tahrirlash",
    delete_prp: "Sinov bolani o‘chirish",

    view_groups: "Guruhlarni ko‘rish",
    create_groups: "Guruh qo‘shish",
    edit_groups: "Guruhni tahrirlash",
    delete_groups: "Guruhni o‘chirish",

    view_sinovdavomat: "Sinov davomatni ko‘rish",
    create_sinovdavomat: "Sinov davomat qo‘shish",
    edit_sinovdavomat: "Sinov davomatni tahrirlash",
    delete_sinovdavomat: "Sinov davomatni o‘chirish",

    view_attendance: "Davomatni ko‘rish",
    create_attendance: "Davomat qo‘shish",
    edit_attendance: "Davomatni tahrirlash",
    delete_attendance: "Davomatni o‘chirish",

    view_lessons: "Dars kunlarini ko‘rish",
    create_lessons: "Dars kuni qo‘shish",
    edit_lessons: "Dars kunini tahrirlash",
    delete_lessons: "Dars kunini o‘chirish",

    view_payments: "To‘lovlarni ko‘rish",
    create_payments: "To‘lov qo‘shish",
    edit_payments: "To‘lovni tahrirlash",
    delete_payments: "To‘lovni o‘chirish",

    view_employees: "Hodimlarni ko‘rish",
    create_employees: "Hodim qo‘shish",
    edit_employees: "Hodimni tahrirlash",
    delete_employees: "Hodimni o‘chirish",

    view_salaries: "Oyliklarni ko‘rish",
    create_salaries: "Oylik qo‘shish",
    edit_salaries: "Oylikni tahrirlash",
    delete_salaries: "Oylikni o‘chirish",

    view_positions: "Lavozimlarni ko‘rish",
    create_positions: "Lavozim qo‘shish",
    edit_positions: "Lavozimni tahrirlash",
    delete_positions: "Lavozimni o‘chirish",

    view_meals: "Maxsus taomnoma ko‘rish",
    create_meals: "Maxsus taomnoma qo‘shish",
    edit_meals: "Maxsus taomnomani tahrirlash",
    delete_meals: "Maxsus taomnomani o‘chirish",

    view_extras: "Qo‘shimcha bo‘limni ko‘rish",
    create_extras: "Qo‘shimcha qo‘shish",
    edit_extras: "Qo‘shimchani tahrirlash",
    delete_extras: "Qo‘shimchani o‘chirish",

    view_kitchen_incomes: "Oshxona kirimlarini ko‘rish",
    create_kitchen_incomes: "Oshxona kirim qo‘shish",
    edit_kitchen_incomes: "Oshxona kirimni tahrirlash",
    delete_kitchen_incomes: "Oshxona kirimni o‘chirish",

    view_kitchen_expenses: "Oshxona chiqimlarini ko‘rish",
    create_kitchen_expenses: "Oshxona chiqim qo‘shish",
    edit_kitchen_expenses: "Oshxona chiqimni tahrirlash",
    delete_kitchen_expenses: "Oshxona chiqimni o‘chirish",

    view_kitchen_storage: "Oshxona omborini ko‘rish",
    create_kitchen_storage: "Oshxona ombor qo‘shish",
    edit_kitchen_storage: "Oshxona omborini tahrirlash",
    delete_kitchen_storage: "Oshxona omborini o‘chirish",

    view_household_incomes: "Maishiy kirimlarni ko‘rish",
    create_household_incomes: "Maishiy kirim qo‘shish",
    edit_household_incomes: "Maishiy kirimni tahrirlash",
    delete_household_incomes: "Maishiy kirimni o‘chirish",

    view_household_expenses: "Maishiy chiqimlarni ko‘rish",
    create_household_expenses: "Maishiy chiqim qo‘shish",
    edit_household_expenses: "Maishiy chiqimni tahrirlash",
    delete_household_expenses: "Maishiy chiqimni o‘chirish",

    view_household_storage: "Maishiy omborni ko‘rish",
    create_household_storage: "Maishiy ombor qo‘shish",
    edit_household_storage: "Maishiy omborini tahrirlash",
    delete_household_storage: "Maishiy omborini o‘chirish",
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>🔧 Admin ruxsatlarini boshqarish</h2>
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>

        <div className={styles.content}>
          {Object.entries(groupedPermissions).map(([category, keys]) => (
            <div key={category} className={styles.category}>
              <h3>{category}</h3>
              <div className={styles.permissions}>
                {keys.map(key => (
                  <label key={key} className={styles.switchRow}>
                    <span>{permissionLabels[key] || key}</span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={permissions[key] || false}
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            [key]: e.target.checked
                          })
                        }
                      />
                      <span className={styles.slider}></span><br />
                    </label>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button onClick={onSave} className={styles.saveBtn}>💾 Saqlash</button>
          <button onClick={onClose} className={styles.cancelBtn}>❌ Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}
