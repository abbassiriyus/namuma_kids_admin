import Sidebar from '../../components/Sidebar';
import DashboardChart from '../../components/DashboardChart';
import styles from '../../styles/Dashboard.module.css';
import LayoutComponent from '@/components/LayoutComponent';

export default function Dashboard() {
  return (
    <div className={styles.container}>
    <LayoutComponent>
        <h1>Dashboard</h1>
        <DashboardChart />
     </LayoutComponent>
    </div>
  );
}
