'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Button, Card, CardContent, Box, CircularProgress, Alert, Chip } from '@mui/material';

export default function APITestPage() {
  const [testResults, setTestResults] = useState<{
    test: string;
    status: 'PASS' | 'FAIL';
    response?: any;
    statusCode?: number;
    error?: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: {
      test: string;
      status: 'PASS' | 'FAIL';
      response?: any;
      statusCode?: number;
      error?: string;
    }[] = [];

    // Test 1: API Health Check
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      results.push({
        test: 'API Health Check',
        status: response.ok ? 'PASS' : 'FAIL',
        response: data,
        statusCode: response.status
      });
    } catch (error) {
      results.push({
        test: 'API Health Check',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Contacts API with Demo Token
    try {
      const response = await fetch('http://localhost:3001/api/contacts/search/all?page=1&limit=5', {
        headers: {
          'Authorization': 'Bearer demo-token-12345',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      results.push({
        test: 'Contacts API',
        status: response.ok ? 'PASS' : 'FAIL',
        response: data,
        statusCode: response.status
      });
    } catch (error) {
      results.push({
        test: 'Contacts API',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Transactions API
    try {
      const response = await fetch('http://localhost:3001/api/transactions', {
        headers: {
          'Authorization': 'Bearer demo-token-12345',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      results.push({
        test: 'Transactions API',
        status: response.ok ? 'PASS' : 'FAIL',
        response: data,
        statusCode: response.status
      });
    } catch (error) {
      results.push({
        test: 'Transactions API',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Inventory API
    try {
      const response = await fetch('http://localhost:3001/api/inventory', {
        headers: {
          'Authorization': 'Bearer demo-token-12345',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      results.push({
        test: 'Inventory API',
        status: response.ok ? 'PASS' : 'FAIL',
        response: data,
        statusCode: response.status
      });
    } catch (error) {
      results.push({
        test: 'Inventory API',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Test Dashboard
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={runTests} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Run Tests'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This page tests the API endpoints. Make sure your backend server is running on port 3001.
      </Alert>

      {testResults.map((result, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{result.test}</Typography>
              <Chip 
                label={result.status} 
                color={result.status === 'PASS' ? 'success' : 'error'}
              />
            </Box>
            
            {result.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {result.error}
              </Alert>
            )}
            
            {result.statusCode && (
              <Typography variant="body2" color="text.secondary">
                Status Code: {result.statusCode}
              </Typography>
            )}
            
            {result.response && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Response:</Typography>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(result.response, null, 2)}
                </pre>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
