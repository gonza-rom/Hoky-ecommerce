// src/app/admin/layout.js
import AdminSidebar from './sidebar';

export const metadata = { title: 'Admin — Hoky' };

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f4f2', fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '32px 36px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}