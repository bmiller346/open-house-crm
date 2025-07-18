'use client';

import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, Avatar, Chip, List, ListItem, ListItemText, ListItemAvatar, TextField, IconButton } from '@mui/material';
import { Forum, ThumbUp, Reply, Add, TrendingUp, Help, Campaign } from '@mui/icons-material';
import { useState } from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

const forumCategories = [
  { name: 'General Discussion', posts: 234, color: 'primary' },
  { name: 'Market Trends', posts: 89, color: 'success' },
  { name: 'Legal Questions', posts: 156, color: 'warning' },
  { name: 'Technology Tips', posts: 67, color: 'info' },
  { name: 'Success Stories', posts: 45, color: 'secondary' }
];

const recentPosts = [
  {
    id: 1,
    title: 'Best practices for first-time home buyer consultations?',
    author: 'Sarah Johnson',
    category: 'General Discussion',
    replies: 12,
    likes: 24,
    timestamp: '2 hours ago',
    excerpt: 'Looking for advice on how to structure initial meetings with first-time buyers to set proper expectations...'
  },
  {
    id: 2,
    title: 'Market predictions for Q2 2024',
    author: 'Mike Chen',
    category: 'Market Trends',
    replies: 8,
    likes: 18,
    timestamp: '4 hours ago',
    excerpt: 'Based on current indicators, what are your thoughts on where the market is heading?'
  },
  {
    id: 3,
    title: 'New mortgage regulations - what agents need to know',
    author: 'Lisa Rodriguez',
    category: 'Legal Questions',
    replies: 15,
    likes: 32,
    timestamp: '6 hours ago',
    excerpt: 'Recent changes to mortgage approval processes and how they impact our clients...'
  },
  {
    id: 4,
    title: 'CRM integration with social media platforms',
    author: 'David Kim',
    category: 'Technology Tips',
    replies: 6,
    likes: 14,
    timestamp: '8 hours ago',
    excerpt: 'Has anyone successfully integrated their CRM with Instagram and Facebook for lead generation?'
  },
  {
    id: 5,
    title: 'Closed my biggest deal ever - $2.3M waterfront property',
    author: 'Jennifer Walsh',
    category: 'Success Stories',
    replies: 23,
    likes: 67,
    timestamp: '1 day ago',
    excerpt: 'Wanted to share my experience closing this luxury waterfront property after 8 months of negotiations...'
  }
];

const ForumPage = () => {
  const [newPost, setNewPost] = useState('');

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Forum />
          </Avatar>
          <Typography variant="h4" component="h1">
            Agent Forum
          </Typography>
        </Box>
        
        {/* Forum Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  1,247
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Posts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  3,456
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  234
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Posts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  89
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Online Now
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          {/* Forum Categories */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Categories
                </Typography>
                <List>
                  {forumCategories.map((category) => (
                    <ListItem key={category.name} button>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${category.color}.main` }}>
                          <Forum />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={category.name}
                        secondary={`${category.posts} posts`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Button fullWidth variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>
                  New Post
                </Button>
                <Button fullWidth variant="outlined" startIcon={<TrendingUp />} sx={{ mb: 2 }}>
                  Trending Topics
                </Button>
                <Button fullWidth variant="outlined" startIcon={<Help />}>
                  Help & Guidelines
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Posts */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Discussions
                </Typography>
                
                {/* New Post Input */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Share your thoughts with the community..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                  />
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button variant="contained" startIcon={<Add />}>
                      Post
                    </Button>
                  </Box>
                </Box>
                
                {/* Posts List */}
                <List>
                  {recentPosts.map((post) => (
                    <ListItem key={post.id} divider>
                      <ListItemAvatar>
                        <Avatar>{post.author.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="subtitle1" component="h3">
                              {post.title}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <Chip label={post.category} size="small" />
                              <Typography variant="body2" color="text.secondary">
                                by {post.author} • {post.timestamp}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {post.excerpt}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                              <Box display="flex" alignItems="center">
                                <ThumbUp fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2">{post.likes}</Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Reply fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2">{post.replies}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
};

export default ForumPage;
