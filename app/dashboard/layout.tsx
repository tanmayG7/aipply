import { UserContextProvider } from '@/app/contexts/UserContext';

/**
 * Dashboard layout wrapper
 * Provides UserContext to all dashboard sub-pages
 * This ensures user profile and subscription data persists across page navigation
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserContextProvider>
      {children}
    </UserContextProvider>
  );
}
