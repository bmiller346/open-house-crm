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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Fab,
  Collapse,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  RecordVoiceOver as ScriptIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface ScriptLibraryProps {
  searchTerm: string;
  selectedCategory: string;
}

interface Script {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  variables: string[];
  isFavorite: boolean;
  timesUsed: number;
  createdAt: string;
  updatedAt: string;
}

export function ScriptLibrary({ searchTerm, selectedCategory }: ScriptLibraryProps) {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      title: 'Initial Cold Call to Motivated Seller',
      description: 'Opening script for first-time contact with potential motivated sellers',
      category: 'cold-calling',
      content: `Hi [SELLER_NAME], this is [YOUR_NAME] with [COMPANY_NAME]. I hope I'm not catching you at a bad time.

I'm a local real estate investor, and I came across your property at [PROPERTY_ADDRESS]. I'm wondering if you might be interested in selling it?

I know this might be out of the blue, but I work with homeowners who need to sell quickly for various reasons - maybe you're relocating, inherited a property, or just looking to avoid the traditional real estate process.

I can make you a fair cash offer and close in as little as 7 days with no repairs needed, no realtor commissions, and no closing costs on your end.

Would you be interested in hearing more about how this works?`,
      variables: ['SELLER_NAME', 'YOUR_NAME', 'COMPANY_NAME', 'PROPERTY_ADDRESS'],
      isFavorite: true,
      timesUsed: 45,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Follow-up Call Script',
      description: 'Script for following up with sellers who showed initial interest',
      category: 'follow-up',
      content: `Hi [SELLER_NAME], this is [YOUR_NAME] again from [COMPANY_NAME]. We spoke [TIME_FRAME] about your property at [PROPERTY_ADDRESS].

I wanted to follow up and see if you've had a chance to think about our conversation. I know selling a house can be a big decision, and I want to make sure you have all the information you need.

Just to recap what we discussed:
- I can make you a fair cash offer
- No repairs needed on your end
- We can close in 7-14 days
- No realtor commissions or closing costs

Do you have a few minutes to talk about next steps? I'd love to schedule a time to take a look at the property and provide you with a written offer.`,
      variables: ['SELLER_NAME', 'YOUR_NAME', 'COMPANY_NAME', 'PROPERTY_ADDRESS', 'TIME_FRAME'],
      isFavorite: false,
      timesUsed: 23,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12',
    },
    {
      id: '3',
      title: 'Price Negotiation Script',
      description: 'Script for negotiating price with motivated sellers',
      category: 'negotiation',
      content: `[SELLER_NAME], I really appreciate you taking the time to show me the property. I can see you've taken good care of it over the years.

Based on my analysis of comparable sales in the area and the current market conditions, along with the repairs needed to bring it up to retail standards, I can offer you [OFFER_AMOUNT] for the property.

I know this might be less than what you were hoping for, but let me explain how I arrived at this number:

The retail value after repairs would be approximately [ARV_AMOUNT]. The repairs needed include [REPAIR_LIST], which would cost around [REPAIR_COST]. After factoring in my costs, profit margin, and the risk I'm taking on, this brings us to the [OFFER_AMOUNT] offer.

This is a fair offer that allows you to sell quickly without any hassles. What are your thoughts on this?`,
      variables: ['SELLER_NAME', 'OFFER_AMOUNT', 'ARV_AMOUNT', 'REPAIR_LIST', 'REPAIR_COST'],
      isFavorite: true,
      timesUsed: 18,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08',
    },
    {
      id: '4',
      title: 'Objection Handling - "Price Too Low"',
      description: 'Script for handling price objections from sellers',
      category: 'objection-handling',
      content: `I understand that [OFFER_AMOUNT] might seem low compared to what you were expecting, and I appreciate you being honest about that.

Let me ask you this - what's more important to you: getting the absolute highest price possible, or having a quick, guaranteed sale with no hassles?

If you list with a realtor, you'll typically pay 6% in commissions, which on a [ARV_AMOUNT] house would be [COMMISSION_AMOUNT]. You'll also have carrying costs while it's on the market, potential repairs that buyers might request, and the uncertainty of whether it will actually sell.

My offer of [OFFER_AMOUNT] is cash, guaranteed, and we can close in [CLOSING_TIMEFRAME]. When you factor in all the costs and risks of the traditional route, my offer might actually net you more money in the end.

Would you like me to break down the numbers so you can see the comparison?`,
      variables: ['OFFER_AMOUNT', 'ARV_AMOUNT', 'COMMISSION_AMOUNT', 'CLOSING_TIMEFRAME'],
      isFavorite: false,
      timesUsed: 12,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cold-calling',
    content: '',
    variables: '',
  });
  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedScripts, setExpandedScripts] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'cold-calling', label: 'Cold Calling' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'objection-handling', label: 'Objection Handling' },
    { value: 'closing', label: 'Closing' },
  ];

  const handleOpenDialog = (script?: Script) => {
    if (script) {
      setEditingScript(script);
      setFormData({
        title: script.title,
        description: script.description,
        category: script.category,
        content: script.content,
        variables: script.variables.join(', '),
      });
    } else {
      setEditingScript(null);
      setFormData({
        title: '',
        description: '',
        category: 'cold-calling',
        content: '',
        variables: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScript(null);
  };

  const handleSaveScript = () => {
    const scriptData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      content: formData.content,
      variables: formData.variables.split(',').map(v => v.trim()).filter(Boolean),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editingScript) {
      setScripts(scripts.map(script => 
        script.id === editingScript.id 
          ? { ...script, ...scriptData }
          : script
      ));
    } else {
      const newScript: Script = {
        id: Date.now().toString(),
        ...scriptData,
        isFavorite: false,
        timesUsed: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setScripts([newScript, ...scripts]);
    }
    handleCloseDialog();
  };

  const handleDeleteScript = (scriptId: string) => {
    setScripts(scripts.filter(script => script.id !== scriptId));
  };

  const handleToggleFavorite = (scriptId: string) => {
    setScripts(scripts.map(script => 
      script.id === scriptId 
        ? { ...script, isFavorite: !script.isFavorite }
        : script
    ));
  };

  const handleCopyScript = (content: string) => {
    navigator.clipboard.writeText(content);
    setSnackbar({ open: true, message: 'Script copied to clipboard!' });
  };

  const handleToggleExpand = (scriptId: string) => {
    const newExpanded = new Set(expandedScripts);
    if (newExpanded.has(scriptId)) {
      newExpanded.delete(scriptId);
    } else {
      newExpanded.add(scriptId);
    }
    setExpandedScripts(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cold-calling':
        return 'primary';
      case 'follow-up':
        return 'success';
      case 'negotiation':
        return 'warning';
      case 'objection-handling':
        return 'error';
      case 'closing':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(localSearch.toLowerCase()) ||
                         script.description.toLowerCase().includes(localSearch.toLowerCase()) ||
                         script.content.toLowerCase().includes(localSearch.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || script.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort scripts: favorites first, then by usage
  const sortedScripts = [...filteredScripts].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.timesUsed - a.timesUsed;
  });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ScriptIcon sx={{ mr: 2, color: 'primary.main' }} />
            Script Library
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Proven scripts for every situation
          </Typography>
        </Box>
        <Fab
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search scripts..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flex: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Scripts Grid */}
      {sortedScripts.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <ScriptIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No scripts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first script to get started
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedScripts.map((script) => (
            <Grid item xs={12} lg={6} key={script.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                  },
                  ...(script.isFavorite && {
                    border: '2px solid',
                    borderColor: 'warning.main',
                  }),
                }}
              >
                {script.isFavorite && (
                  <StarIcon
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: 'warning.main',
                    }}
                  />
                )}
                
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {script.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={script.category.replace('-', ' ')}
                          size="small"
                          color={getCategoryColor(script.category) as any}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(script.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFavorite(script.id)}
                        color={script.isFavorite ? 'warning' : 'default'}
                      >
                        {script.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyScript(script.content)}
                        color="primary"
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(script)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteScript(script.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {script.description}
                  </Typography>

                  <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        ...(!expandedScripts.has(script.id) && {
                          display: '-webkit-box',
                          WebkitLineClamp: 6,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }),
                      }}
                    >
                      {script.content}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleToggleExpand(script.id)}
                      sx={{ mt: 1 }}
                      endIcon={expandedScripts.has(script.id) ? <CollapseIcon /> : <ExpandIcon />}
                    >
                      {expandedScripts.has(script.id) ? 'Show Less' : 'Show More'}
                    </Button>
                  </Paper>

                  {script.variables.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Variables:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {script.variables.map((variable, index) => (
                          <Chip
                            key={index}
                            label={variable}
                            size="small"
                            color="primary"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ViewIcon fontSize="small" />
                        Used {script.timesUsed} times
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon fontSize="small" />
                        {new Date(script.updatedAt).toLocaleDateString()}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Script Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingScript ? 'Edit Script' : 'Create New Script'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                {categories.slice(1).map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Script Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={8}
              fullWidth
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
            <TextField
              label="Variables (comma separated)"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              fullWidth
              helperText="e.g., SELLER_NAME, YOUR_NAME, PROPERTY_ADDRESS"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveScript}
            variant="contained"
            disabled={!formData.title || !formData.content}
          >
            {editingScript ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
