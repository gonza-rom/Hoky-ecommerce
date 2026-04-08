'use client';
// src/components/ConditionalNavbar.js
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  // Ocultar en /admin y cualquier subruta de admin
  if (pathname?.startsWith('/admin')) return null;
  return <Navbar />;
}