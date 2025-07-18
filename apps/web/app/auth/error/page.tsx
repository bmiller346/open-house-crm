'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'auth_failed':
        return 'Authentication failed. Please try again.';
      case 'no_user':
        return 'User information not found. Please try logging in again.';
      case 'db_error':
        return 'Database error occurred. Please try again later.';
      case 'invalid_token':
        return 'Invalid authentication token. Please login again.';
      default:
        return message || 'An authentication error occurred. Please try again.';
    }
  };

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
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Authentication Error</h2>
        <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.5' }}>
          {getErrorMessage(error)}
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <a 
            href="/auth/login" 
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            Try Again
          </a>
          <a 
            href="/" 
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            Home
          </a>
        </div>

        {error && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#6c757d'
          }}>
            Error Code: {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
