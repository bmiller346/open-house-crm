'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    let isValid = false;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        if (payload.exp > now) {
          isValid = true;
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsAuthenticated(isValid);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#fafafa'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280', textAlign: 'center' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            🏠
          </div>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            Open House CRM
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isAuthenticated ? (
            <a
              href="/dashboard"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
            >
              Go to Dashboard
            </a>
          ) : (
            <>
              <a
                href="/auth/login"
                style={{
                  padding: '0.75rem 1.5rem',
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s ease'
                }}
              >
                Sign In
              </a>
              <a
                href="/auth/login"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                }}
              >
                Get Started Free
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          display: 'inline-block',
          marginBottom: '2rem',
          color: '#3b82f6',
          fontWeight: '500',
          fontSize: '0.875rem'
        }}>
          ✨ New: AI-Powered Lead Scoring & Calendar Integration
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          The Modern Real Estate CRM<br />
          <span style={{ color: '#3b82f6' }}>Built for Success</span>
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto 3rem',
          lineHeight: '1.6'
        }}>
          Streamline your real estate business with intelligent contact management, 
          automated workflows, and powerful analytics. Close more deals, faster.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}>
          <a
            href="/auth/login"
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              border: 'none'
            }}
          >
            🚀 Start Free Trial
          </a>
          <a
            href="#demo"
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              color: '#6b7280',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem',
              transition: 'all 0.2s ease',
              border: '2px solid #e5e7eb'
            }}
          >
            📺 Watch Demo
          </a>
        </div>

        {/* Social Proof */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          opacity: 0.7
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#fbbf24' }}>⭐⭐⭐⭐⭐</span>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>4.9/5 rating</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Trusted by 10,000+ real estate professionals
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Everything You Need to Succeed
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {[
              {
                icon: '👥',
                title: 'Smart Contact Management',
                description: 'AI-powered lead scoring and automated follow-ups keep you connected with prospects.',
                color: '#3b82f6'
              },
              {
                icon: '🏠',
                title: 'Property Intelligence',
                description: 'Advanced property tracking with market analytics and automated valuation models.',
                color: '#10b981'
              },
              {
                icon: '💼',
                title: 'Deal Pipeline',
                description: 'Visual deal tracking from lead to close with automated milestone notifications.',
                color: '#f59e0b'
              },
              {
                icon: '📊',
                title: 'Analytics Dashboard',
                description: 'Real-time insights into your business performance and growth metrics.',
                color: '#8b5cf6'
              },
              {
                icon: '📅',
                title: 'Calendar Integration',
                description: 'Seamless scheduling with Google Calendar and automated appointment reminders.',
                color: '#ef4444'
              },
              {
                icon: '🤖',
                title: 'AI Assistant',
                description: 'Smart recommendations for pricing, timing, and client communication strategies.',
                color: '#06b6d4'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  backgroundColor: feature.color + '20',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: '#1f2937',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Ready to Transform Your Business?
          </h2>
            <p style={{
            fontSize: '1.125rem',
            color: '#d1d5db',
            marginBottom: '2rem',
            lineHeight: '1.6'
            }}>
            Be among the first to pioneer a new era in real estate CRM. Try our open source beta and help shape the future—no credit card required.
            </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="/auth/login"
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.125rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              Start Free Trial
            </a>
            <a
              href="mailto:support@openhousecrm.com"
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'transparent',
                color: '#d1d5db',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.125rem',
                transition: 'all 0.2s ease',
                border: '2px solid #374151'
              }}
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        backgroundColor: '#111827',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}>
          <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/support" style={{ color: '#9ca3af', textDecoration: 'none' }}>Support</a>
        </div>
        <p style={{ fontSize: '0.875rem' }}>
          © 2025 Open House CRM. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
