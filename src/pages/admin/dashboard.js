import Sidebar from '../../components/Sidebar';
import DashboardChart from '../../components/DashboardChart';
import styles from '../../styles/Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <h1>Dashboard</h1>
        <DashboardChart />
      </main>
    </div>
  );
}
