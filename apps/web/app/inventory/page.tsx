'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryApi, isAuthenticated } from '../../lib/api';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  status: string;
  listingDate: string;
  propertyType: string;
  description: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // Load real properties from API
    const loadProperties = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getProperties();
        const apiProperties = response.data || [];
        
        // Transform API data to match our interface
        const formattedProperties = apiProperties.map((p: any) => ({
          id: p.id,
          address: p.address || 'No address provided',
          city: p.city || '',
          state: p.state || '',
          zipCode: p.zipCode || '',
          price: p.price || 0,
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          squareFeet: p.squareFeet || 0,
          status: p.status || 'Available',
          listingDate: p.listingDate || new Date().toISOString().split('T')[0],
          propertyType: p.propertyType || 'Unknown',
          description: p.description || 'No description available'
        }));

        setProperties(formattedProperties);
      } catch (error) {
        console.error('Failed to load properties:', error);
        // Fallback to demo data if API fails
        setProperties([
          {
            id: 'demo-1',
            address: '123 Main Street',
            city: 'Anytown',
            state: 'ST',
            zipCode: '12345',
            price: 325000,
            bedrooms: 3,
            bathrooms: 2,
            squareFeet: 1850,
            status: 'Active',
            listingDate: '2025-06-15',
            propertyType: 'Single Family',
            description: 'Beautiful 3-bedroom home with modern updates'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#28a745';
      case 'Under Contract': return '#2196f3';
      case 'Sold': return '#666';
      case 'Pending': return '#ff9800';
      default: return '#666';
    }
  };

  const filteredProperties = properties.filter(property => {
    if (filter === 'all') return true;
    return property.status.toLowerCase() === filter;
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div>Loading inventory...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: 'var(--primary)' }}>Open House CRM</h1>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'var(--error)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      {/* Navigation */}
      <nav style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dashboard</a>
          <a href="/contacts" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contacts</a>
          <a href="/calendar" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Calendar</a>
          <a href="/transactions" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Transactions</a>
          <a href="/inventory" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Inventory</a>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Property Inventory</h2>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + Add New Property
          </button>
        </div>

        {/* Filter and Summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          backgroundColor: 'var(--surface)',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-primary)' }}>Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Properties</option>
              <option value="active">Active</option>
              <option value="under contract">Under Contract</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <strong>Total Properties:</strong> {filteredProperties.length}
            </div>
            <div>
              <strong>Average Price:</strong> ${Math.round(filteredProperties.reduce((sum, p) => sum + p.price, 0) / filteredProperties.length || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredProperties.map((property) => (
            <div key={property.id} style={{
              backgroundColor: 'var(--surface)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}>
              {/* Property Image Placeholder */}
              <div style={{
                height: '200px',
                backgroundColor: 'var(--surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                📷 Property Photo
              </div>

              <div style={{ padding: '1.5rem' }}>
                {/* Status Badge */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: getStatusColor(property.status),
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}>
                    {property.status}
                  </span>
                </div>

                {/* Address */}
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                  {property.address}
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
                  {property.city}, {property.state} {property.zipCode}
                </p>

                {/* Price */}
                <p style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${property.price.toLocaleString()}
                </p>

                {/* Property Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--surface-secondary)',
                  borderRadius: '4px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{property.bedrooms}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bedrooms</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{property.bathrooms}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bathrooms</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{property.squareFeet.toLocaleString()}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sq Ft</div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {property.description}
                </p>

                {/* Listing Date */}
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                  Listed: {new Date(property.listingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Property Modal */}
        {showAddForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'var(--surface)',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Add New Property</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                This is a demo form. Integration with the backend API will be implemented next.
              </p>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  backgroundColor: 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
