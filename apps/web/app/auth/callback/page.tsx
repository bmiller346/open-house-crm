'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple callback processing
      if (hasProcessedCallback.current) return;
      hasProcessedCallback.current = true;

      try {
        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          router.push(`/auth/error?error=${error}`);
          return;
        }

        if (token && refresh && userParam) {
          // Decode user data
          const userData = JSON.parse(Buffer.from(userParam, 'base64').toString());
          
          // Store tokens and user data
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', refresh);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Set workspace ID if available
          if (userData.workspaceId) {
            localStorage.setItem('workspaceId', userData.workspaceId);
          }
          
          // Verify token is properly set
          const storedToken = localStorage.getItem('authToken');
          console.log('✅ Token stored successfully:', !!storedToken);
          
          // Update auth context
          login(token, userData);
          
          setStatus('success');
          
          // Small delay to ensure localStorage is committed before redirect
          setTimeout(() => {
            console.log('🚀 Redirecting to dashboard...');
            router.replace('/dashboard');
          }, 200);
        } else {
          throw new Error('Missing authentication data');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setTimeout(() => {
          router.push('/auth/error?error=invalid_callback');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  if (status === 'loading') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <p>Completing authentication...</p>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: 2
      }}>
        <h2>✅ Authentication Successful!</h2>
        <p>Redirecting to your dashboard...</p>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      gap: 2
    }}>
      <h2>❌ Authentication Error</h2>
      <p>Redirecting to error page...</p>
    </Box>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
