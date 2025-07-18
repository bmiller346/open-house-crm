'use client';

import { Container, Typography, Box, Grid, Card, CardContent, TextField, Button, List, ListItem, ListItemText, Avatar, Chip, Paper } from '@mui/material';
import { SmartToy, Send, Psychology, TrendingUp, Home, People } from '@mui/icons-material';
import { useState } from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

const aiFeatures = [
  {
    id: 1,
    title: 'Market Analysis',
    description: 'Get AI-powered market insights and property valuations',
    icon: <TrendingUp />,
    color: 'primary'
  },
  {
    id: 2,
    title: 'Property Recommendations',
    description: 'Intelligent property matching based on client preferences',
    icon: <Home />,
    color: 'secondary'
  },
  {
    id: 3,
    title: 'Client Insights',
    description: 'Analyze client behavior and predict buying patterns',
    icon: <People />,
    color: 'success'
  },
  {
    id: 4,
    title: 'Smart Pricing',
    description: 'AI-driven pricing recommendations for optimal listings',
    icon: <Psychology />,
    color: 'warning'
  }
];

const chatHistory = [
  {
    id: 1,
    type: 'user',
    message: 'What are the market trends for luxury properties in downtown?',
    timestamp: '10:30 AM'
  },
  {
    id: 2,
    type: 'ai',
    message: 'Based on current market data, luxury properties in downtown are showing a 12% increase in value over the past quarter. The average price per square foot has risen to $850, with inventory remaining low at 2.3 months supply.',
    timestamp: '10:31 AM'
  },
  {
    id: 3,
    type: 'user',
    message: 'Can you recommend properties for a client with a $500K budget?',
    timestamp: '10:35 AM'
  },
  {
    id: 4,
    type: 'ai',
    message: 'For a $500K budget, I recommend focusing on these areas: Midtown (3-4 bedroom condos), Riverside District (2-3 bedroom townhomes), and Suburban Heights (single-family homes). Would you like me to generate a specific property list?',
    timestamp: '10:36 AM'
  }
];

const AIAssistantPage = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      setIsTyping(true);
      // Simulate AI response
      setTimeout(() => {
        setIsTyping(false);
        setMessage('');
      }, 2000);
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <SmartToy />
          </Avatar>
          <Typography variant="h4" component="h1">
            AI Assistant
          </Typography>
        </Box>
        
        {/* AI Features */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {aiFeatures.map((feature) => (
            <Grid item xs={12} md={6} key={feature.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, bgcolor: `${feature.color}.main` }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6">{feature.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                  <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Chat Interface */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chat with AI Assistant
                </Typography>
                
                {/* Chat History */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    height: 400, 
                    overflow: 'auto', 
                    p: 2, 
                    bgcolor: 'grey.50',
                    mb: 2
                  }}
                >
                  <List>
                    {chatHistory.map((chat) => (
                      <ListItem key={chat.id} sx={{ flexDirection: 'column', alignItems: chat.type === 'user' ? 'flex-end' : 'flex-start' }}>
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: chat.type === 'user' ? 'primary.main' : 'white',
                            color: chat.type === 'user' ? 'white' : 'text.primary',
                            boxShadow: 1
                          }}
                        >
                          <Typography variant="body2">{chat.message}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {chat.timestamp}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                    {isTyping && (
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'white',
                            boxShadow: 1
                          }}
                        >
                          <Typography variant="body2">AI is typing...</Typography>
                        </Box>
                      </ListItem>
                    )}
                  </List>
                </Paper>
                
                {/* Message Input */}
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    placeholder="Ask me anything about your real estate business..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    sx={{ minWidth: 60 }}
                  >
                    <Send />
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <List>
                  <ListItem button>
                    <ListItemText primary="Generate Market Report" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Property Valuation" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Client Matching" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Pricing Analysis" />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="Investment Insights" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent AI Insights
                </Typography>
                <Box>
                  <Chip label="Market up 5.2%" color="success" size="small" sx={{ mb: 1, mr: 1 }} />
                  <Chip label="New hot area: Downtown" color="info" size="small" sx={{ mb: 1, mr: 1 }} />
                  <Chip label="Luxury demand high" color="warning" size="small" sx={{ mb: 1, mr: 1 }} />
                  <Chip label="Best time to sell" color="primary" size="small" sx={{ mb: 1, mr: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default AIAssistantPage;
