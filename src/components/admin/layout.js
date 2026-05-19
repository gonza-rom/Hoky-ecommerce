import { OrderAlertsProvider } from '@/components/admin/OrderToast';

export default function AdminLayout({ children }) {
  return (
    <OrderAlertsProvider intervalMs={30_000}>
      {/* tu layout existente */}
      {children}
    </OrderAlertsProvider>
  );
}