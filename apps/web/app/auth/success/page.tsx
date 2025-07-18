'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    
    if (name && email) {
      setUserInfo({
        name: decodeURIComponent(name),
        email: decodeURIComponent(email)
      });
    }
  }, [searchParams]);

  const handleContinue = () => {
    // Redirect to the main CRM dashboard
    window.location.href = '/contacts';
  };

  const testGmailIntegration = () => {
    // Open Gmail API test endpoint
    window.open('http://localhost:3001/gmail/test', '_blank');
  };

  if (!userInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        
        <h1 style={{ color: '#4caf50', marginBottom: '10px' }}>
          Authentication Successful!
        </h1>
        
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Welcome to Open House CRM! Your Google account has been successfully connected.
        </p>

        <div style={{ 
          margin: '30px 0',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>👤 {userInfo.name}</strong>
          </div>
          <div style={{ color: '#666' }}>
            📧 {userInfo.email}
          </div>
        </div>

        <h3 style={{ marginTop: '30px', marginBottom: '10px' }}>
          🚀 What's Next?
        </h3>
        
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Your Gmail integration is now active! You can send and receive emails 
          directly from the CRM system.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={testGmailIntegration}
            style={{
              padding: '12px 24px',
              backgroundColor: '#fff',
              border: '2px solid #2196f3',
              color: '#2196f3',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📧 Test Gmail Integration
          </button>
          
          <button
            onClick={handleContinue}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196f3',
              border: 'none',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Continue to CRM →
          </button>
        </div>

        <p style={{ 
          fontSize: '12px', 
          color: '#999', 
          marginTop: '30px' 
        }}>
          🔐 Your authentication is secure and session-based. 
          No passwords are stored in our system.
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}
