'use client';

import { useEffect } from 'react';

export default function AuthLoginPage() {
  useEffect(() => {
    // Redirect to the API server's OAuth test page
    window.location.href = 'http://localhost:3001/oauth-test';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
        <h2>Redirecting to Login...</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          You'll be redirected to the secure authentication page.
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          If you're not redirected automatically, 
          <a href="http://localhost:3001/oauth-test" style={{ color: '#2196f3' }}>
            click here
          </a>
        </p>
      </div>
    </div>
  );
}
