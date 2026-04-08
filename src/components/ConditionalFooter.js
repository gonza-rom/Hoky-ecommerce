'use client';
// src/components/ConditionalFooter.js
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) return null;
  return <Footer />;
}