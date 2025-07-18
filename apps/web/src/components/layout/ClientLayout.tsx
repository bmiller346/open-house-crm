'use client';

import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Routes that don't need the MainLayout
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  return (
    <>
      {isPublicRoute ? (
        <>{children}</>
      ) : (
        <MainLayout>{children}</MainLayout>
      )}
    </>
  );
}