import { Outlet } from 'react-router-dom';
import Header from '@/pages/layout/Header';

export default function Layout() {
  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto p-6">
        <Outlet />
      </main>
    </>
  );
}
