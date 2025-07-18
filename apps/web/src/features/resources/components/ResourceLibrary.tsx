'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  LibraryBooks as LibraryIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Favorite as FavoriteIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Gavel as LegalIcon,
  Campaign as MarketingIcon,
  Analytics as AnalyticsIcon,
  Settings as ProcessIcon,
  Home as WholesalingIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

interface ResourceLibraryProps {
  searchTerm: string;
  selectedCategory: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
  likes: number;
  downloadUrl: string;
  createdAt: string;
}

export function ResourceLibrary({ searchTerm, selectedCategory }: ResourceLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const sampleResources: Resource[] = [
    {
      id: '1',
      title: 'Wholesaling Contract Templates',
      description: 'Complete set of legal contract templates for wholesaling transactions, including purchase agreements, assignment contracts, and disclosure forms.',
      category: 'legal',
      tags: ['contracts', 'legal', 'templates', 'assignments'],
      difficulty: 'intermediate',
      views: 245,
      likes: 32,
      downloadUrl: '#',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Direct Mail Marketing Guide',
      description: 'Comprehensive guide to creating effective direct mail campaigns for finding motivated sellers, including templates and tracking systems.',
      category: 'marketing',
      tags: ['direct mail', 'marketing', 'sellers', 'campaigns'],
      difficulty: 'beginner',
      views: 189,
      likes: 28,
      downloadUrl: '#',
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      title: 'Market Analysis Spreadsheet',
      description: 'Excel spreadsheet for analyzing local market conditions, tracking comparables, and calculating ARV with automated formulas.',
      category: 'analytics',
      tags: ['analysis', 'excel', 'arv', 'comparables'],
      difficulty: 'intermediate',
      views: 156,
      likes: 19,
      downloadUrl: '#',
      createdAt: '2024-01-05',
    },
    {
      id: '4',
      title: 'Step-by-Step Wholesaling Process',
      description: 'Detailed workflow guide covering every step of the wholesaling process from lead generation to closing.',
      category: 'process',
      tags: ['process', 'workflow', 'guide', 'steps'],
      difficulty: 'beginner',
      views: 298,
      likes: 45,
      downloadUrl: '#',
      createdAt: '2024-01-20',
    },
    {
      id: '5',
      title: 'Advanced Negotiation Strategies',
      description: 'Advanced techniques for negotiating with sellers and buyers, including psychological triggers and closing techniques.',
      category: 'wholesaling',
      tags: ['negotiation', 'psychology', 'closing', 'advanced'],
      difficulty: 'advanced',
      views: 127,
      likes: 23,
      downloadUrl: '#',
      createdAt: '2024-01-08',
    },
    {
      id: '6',
      title: 'Social Media Marketing Blueprint',
      description: 'Complete blueprint for using social media to generate leads and build your personal brand in real estate.',
      category: 'marketing',
      tags: ['social media', 'branding', 'leads', 'blueprint'],
      difficulty: 'intermediate',
      views: 213,
      likes: 34,
      downloadUrl: '#',
      createdAt: '2024-01-12',
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal':
        return <LegalIcon />;
      case 'marketing':
        return <MarketingIcon />;
      case 'analytics':
        return <AnalyticsIcon />;
      case 'process':
        return <ProcessIcon />;
      case 'wholesaling':
        return <WholesalingIcon />;
      default:
        return <DocumentIcon />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredResources = sampleResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = difficultyFilter === 'all' || resource.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'grid' | 'list',
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 48,
              height: 48,
            }}
          >
            {getCategoryIcon(resource.category)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {resource.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={resource.difficulty}
                size="small"
                color={getDifficultyColor(resource.difficulty) as any}
              />
              <Typography variant="caption" color="text.secondary">
                {new Date(resource.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {resource.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {resource.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ViewIcon fontSize="small" />
              {resource.views}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon fontSize="small" />
              {resource.likes}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ViewIcon />}
            >
              View
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ResourceListItem = ({ resource }: { resource: Resource }) => (
    <Card elevation={1} sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {getCategoryIcon(resource.category)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {resource.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {resource.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                label={resource.difficulty}
                size="small"
                color={getDifficultyColor(resource.difficulty) as any}
              />
              {resource.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ViewIcon fontSize="small" />
                {resource.views}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FavoriteIcon fontSize="small" />
                {resource.likes}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<ViewIcon />}>
                View
              </Button>
              <Button size="small" variant="contained" startIcon={<DownloadIcon />}>
                Download
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LibraryIcon sx={{ mr: 2, color: 'primary.main' }} />
        Resource Library
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive educational materials and guides for wholesaling success
      </Typography>

      {/* Controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              label="Difficulty"
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="liked">Most Liked</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ ml: 'auto' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Resources */}
      {filteredResources.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <LibraryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Paper>
      ) : (
        <Box>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredResources.map((resource) => (
                <Grid item xs={12} md={6} lg={4} key={resource.id}>
                  <ResourceCard resource={resource} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box>
              {filteredResources.map((resource) => (
                <ResourceListItem key={resource.id} resource={resource} />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
