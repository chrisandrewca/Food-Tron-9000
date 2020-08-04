import DashboardNav from '../dashboard-nav';
import { h } from 'preact';
import { Link } from 'wouter-preact';
import style from './style';

const DashboardHeader = () => {
  return (
    <header class={style.header}>
      <h1>
        <Link href='/dashboard'>
          Food-Tron 9000
        </Link>
      </h1>
      <DashboardNav />
    </header>
  );
}

export default DashboardHeader;