'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { transactionsApi, contactsApi, isAuthenticated } from '../../lib/api';

interface Transaction {
  id: string;
  contactId: string;
  pipelineStage: string;
  amount: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    contactId: '',
    pipelineStage: 'Lead',
    amount: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // Load transactions and contacts
    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, contactsResponse] = await Promise.all([
          transactionsApi.getTransactions(),
          contactsApi.getContacts()
        ]);
        
        setTransactions(transactionsResponse.data || []);
        setContacts(contactsResponse.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const getPipelineStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return '#ff9800';
      case 'Qualified': return '#2196f3';
      case 'Proposal': return '#9c27b0';
      case 'Negotiation': return '#f44336';
      case 'Closed': return '#4caf50';
      default: return '#666';
    }
  };

  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await transactionsApi.createTransaction({
        contactId: formData.contactId,
        pipelineStage: formData.pipelineStage,
        amount: formData.amount
      });
      
      // Add the new transaction to the list
      setTransactions([...transactions, response.data]);
      setShowAddForm(false);
      setFormData({
        contactId: '',
        pipelineStage: 'Lead',
        amount: 0
      });
      
      alert('Transaction created successfully!');
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        <div style={{ fontSize: '1.2rem' }}>Loading transactions...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#333', margin: 0 }}>
          Transactions
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + Add Transaction
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Transactions</h3>
          <div style={{ fontSize: '2rem', color: '#2196f3', fontWeight: 'bold' }}>
            {transactions.length}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Value</h3>
          <div style={{ fontSize: '2rem', color: '#4caf50', fontWeight: 'bold' }}>
            ${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </div>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Closed Deals</h3>
          <div style={{ fontSize: '2rem', color: '#9c27b0', fontWeight: 'bold' }}>
            {transactions.filter(t => t.pipelineStage === 'Closed').length}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>All Transactions</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🏠</div>
            <div>No transactions yet. Add your first transaction to get started!</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Contact</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Pipeline Stage</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Created</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{getContactName(transaction.contactId)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: getPipelineStageColor(transaction.pipelineStage)
                    }}>
                      {transaction.pipelineStage}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>${transaction.amount.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{new Date(transaction.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Transaction Modal */}
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
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>Add New Transaction</h2>
            
            <form onSubmit={handleSubmitTransaction}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Contact *
                </label>
                <select
                  value={formData.contactId}
                  onChange={(e) => handleInputChange('contactId', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} ({contact.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Pipeline Stage *
                </label>
                <select
                  value={formData.pipelineStage}
                  onChange={(e) => handleInputChange('pipelineStage', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="Lead">Lead</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Amount *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: submitting ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
