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
  Menu,
  MenuProps,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  StickyNote2 as NotesIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  PushPin as PinIcon,
  AccessTime as TimeIcon,
  Flag as PriorityIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

interface PersonalNotesProps {
  searchTerm: string;
  selectedCategory: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export function PersonalNotes({ searchTerm, selectedCategory }: PersonalNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Follow up with seller on Oak Street',
      content: 'Property details:\n- 3BR/2BA single family\n- ARV: $85,000\n- Repairs needed: $15,000\n- Seller motivated due to job relocation\n- Call back Tuesday at 2 PM',
      category: 'deals',
      tags: ['follow-up', 'motivated-seller', 'oak-street'],
      priority: 'high',
      isPinned: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Buyer lead - Cash investor',
      content: 'John Smith - Cash buyer\n- Looking for SFH under $100k\n- Prefers 3BR+\n- Can close in 7 days\n- Email: john@investor.com\n- Phone: (555) 123-4567',
      category: 'buyers',
      tags: ['cash-buyer', 'sfh', 'quick-close'],
      priority: 'medium',
      isPinned: false,
      createdAt: '2024-01-14',
      updatedAt: '2024-01-14',
    },
    {
      id: '3',
      title: 'Market analysis notes',
      content: 'Westside neighborhood analysis:\n- Average ARV: $95,000\n- Days on market: 45\n- Rental rates: $800-950\n- Hot areas: Oak, Maple, Pine streets\n- Avoid: Main Street (commercial zoning issues)',
      category: 'market',
      tags: ['westside', 'analysis', 'arv', 'rental'],
      priority: 'low',
      isPinned: false,
      createdAt: '2024-01-13',
      updatedAt: '2024-01-13',
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'deals',
    tags: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'deals', label: 'Deals' },
    { value: 'buyers', label: 'Buyers' },
    { value: 'sellers', label: 'Sellers' },
    { value: 'market', label: 'Market Research' },
    { value: 'strategies', label: 'Strategies' },
    { value: 'contacts', label: 'Contacts' },
  ];

  const handleOpenDialog = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags.join(', '),
        priority: note.priority,
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        category: 'deals',
        tags: '',
        priority: 'medium',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNote(null);
  };

  const handleSaveNote = () => {
    const noteData = {
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      priority: formData.priority,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editingNote) {
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData }
          : note
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        isPinned: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setNotes([newNote, ...notes]);
    }
    handleCloseDialog();
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const handleTogglePin = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, isPinned: !note.isPinned }
        : note
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(localSearch.toLowerCase()) ||
                         note.content.toLowerCase().includes(localSearch.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(localSearch.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || note.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Sort notes: pinned first, then by date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <NotesIcon sx={{ mr: 2, color: 'primary.main' }} />
            Personal Notes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Organize your thoughts and track your progress
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
            placeholder="Search notes..."
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
          <FormControl sx={{ minWidth: 150 }}>
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
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="Priority"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <NotesIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first note to get started
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedNotes.map((note) => (
            <Grid item xs={12} md={6} lg={4} key={note.id}>
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
                  ...(note.isPinned && {
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }),
                }}
              >
                {note.isPinned && (
                  <PinIcon
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: 'primary.main',
                      transform: 'rotate(45deg)',
                    }}
                  />
                )}
                
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
                      {note.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleTogglePin(note.id)}
                        color={note.isPinned ? 'primary' : 'default'}
                      >
                        <PinIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(note)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteNote(note.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {note.content}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    <Chip
                      label={note.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {note.tags.map((tag, index) => (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={note.priority}
                      size="small"
                      color={getPriorityColor(note.priority) as any}
                      icon={<PriorityIcon />}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Note Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingNote ? 'Edit Note' : 'Create New Note'}
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
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={6}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
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
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  label="Priority"
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              helperText="e.g., follow-up, motivated-seller, oak-street"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            disabled={!formData.title || !formData.content}
          >
            {editingNote ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
