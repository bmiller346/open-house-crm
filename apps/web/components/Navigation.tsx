'use client';

import { useRouter } from 'next/navigation';

interface NavProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contacts', label: 'Contacts' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/webhooks', label: 'Webhooks' }
  ];

  return (
    <div>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <a href="/dashboard" style={{ textDecoration: 'none' }}>
          <h1 style={{ margin: 0, color: '#2196f3' }}>Open House CRM</h1>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>
            {typeof window !== 'undefined' && localStorage.getItem('authToken') && (() => {
              try {
                const payload = JSON.parse(atob(localStorage.getItem('authToken')!.split('.')[1]));
                return `Welcome, ${payload.email}`;
              } catch {
                return 'Welcome';
              }
            })()}
          </span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                color: currentPage === item.href ? '#2196f3' : '#666',
                textDecoration: 'none',
                fontWeight: currentPage === item.href ? 'bold' : 'normal'
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
