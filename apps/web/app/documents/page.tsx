'use client';

import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button, IconButton, Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar, Dialog, DialogTitle, DialogContent, DialogActions, Toolbar, AppBar } from '@mui/material';
import { Description, CloudUpload, Download, Edit, Delete, Share, Folder, PictureAsPdf, Image, Visibility, Close, GetApp } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';

const documents = [
  {
    id: 1,
    name: 'Purchase Agreement - 123 Main St',
    type: 'PDF',
    size: '2.4 MB',
    uploaded: '2024-03-10',
    category: 'Contracts',
    tags: ['Contract', 'Purchase', 'Legal'],
    url: '/api/documents/1/preview', // Sample preview URL
    downloadUrl: '/api/documents/1/download'
  },
  {
    id: 2,
    name: 'Property Inspection Report',
    type: 'PDF',
    size: '1.8 MB',
    uploaded: '2024-03-08',
    category: 'Inspections',
    tags: ['Inspection', 'Report', 'Property'],
    url: '/api/documents/2/preview',
    downloadUrl: '/api/documents/2/download'
  },
  {
    id: 3,
    name: 'Listing Photos - Luxury Home',
    type: 'ZIP',
    size: '15.2 MB',
    uploaded: '2024-03-07',
    category: 'Photos',
    tags: ['Photos', 'Listing', 'Marketing'],
    url: '/api/documents/3/preview',
    downloadUrl: '/api/documents/3/download'
  },
  {
    id: 4,
    name: 'Market Analysis Report Q1',
    type: 'PDF',
    size: '3.1 MB',
    uploaded: '2024-03-05',
    category: 'Reports',
    tags: ['Market', 'Analysis', 'Quarterly'],
    url: '/api/documents/4/preview',
    downloadUrl: '/api/documents/4/download'
  },
  {
    id: 5,
    name: 'Client Disclosure Forms',
    type: 'PDF',
    size: '1.2 MB',
    uploaded: '2024-03-03',
    category: 'Legal',
    tags: ['Legal', 'Disclosure', 'Client'],
    url: '/api/documents/5/preview',
    downloadUrl: '/api/documents/5/download'
  }
];

const categories = [
  { name: 'Contracts', count: 12, color: 'primary' },
  { name: 'Inspections', count: 8, color: 'secondary' },
  { name: 'Photos', count: 24, color: 'success' },
  { name: 'Reports', count: 15, color: 'warning' },
  { name: 'Legal', count: 6, color: 'error' }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'PDF': return <PictureAsPdf color="error" />;
    case 'ZIP': return <Folder color="warning" />;
    case 'IMAGE': return <Image color="info" />;
    default: return <Description />;
  }
};

const DocumentsPage = () => {
  const [previewDocument, setPreviewDocument] = useState<any>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const handlePreview = (document: any) => {
    setPreviewDocument(document);
    setPreviewDialogOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewDocument(null);
    setPreviewDialogOpen(false);
  };

  const handleDownload = (document: any) => {
    // In a real app, this would download the file
    console.log('Downloading:', document.name);
    // window.open(document.downloadUrl, '_blank');
  };

  const renderPreviewContent = (document: any) => {
    if (!document) return null;

    switch (document.type) {
      case 'PDF':
        return (
          <Box sx={{ width: '100%', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ textAlign: 'center' }}>
              <PictureAsPdf sx={{ fontSize: 80, color: '#d32f2f', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                PDF Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {document.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In a production environment, this would display the PDF content using PDF.js or similar library.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<GetApp />}
                onClick={() => handleDownload(document)}
                sx={{ mt: 2 }}
              >
                Download PDF
              </Button>
            </Box>
          </Box>
        );
      case 'ZIP':
        return (
          <Box sx={{ width: '100%', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Folder sx={{ fontSize: 80, color: '#ff9800', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Archive Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {document.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Archive contents: Photos, documents, and other files.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<GetApp />}
                onClick={() => handleDownload(document)}
                sx={{ mt: 2 }}
              >
                Download Archive
              </Button>
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ width: '100%', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Description sx={{ fontSize: 80, color: '#2196f3', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Document Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preview not available for this file type.
              </Typography>
            </Box>
          </Box>
        );
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Document Management
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUpload />}>
            Upload Document
          </Button>
        </Box>
        
        {/* Document Categories */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {categories.map((category) => (
            <Grid item xs={12} md={2.4} key={category.name}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: `${category.color}.main` }}>
                    <Folder />
                  </Avatar>
                  <Typography variant="h6">{category.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count} files
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Document List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <List>
              {documents.map((doc) => (
                <ListItem key={doc.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      {getFileIcon(doc.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={doc.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {doc.size} • {doc.uploaded} • {doc.category}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {doc.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <Box>
                    <IconButton size="small" color="primary" onClick={() => handlePreview(doc)}>
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => handleDownload(doc)}>
                      <Download />
                    </IconButton>
                    <IconButton size="small" color="info">
                      <Share />
                    </IconButton>
                    <IconButton size="small" color="default">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
        
        {/* Storage Usage */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Storage Usage
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Used: 124.8 GB of 500 GB
              </Typography>
              <Box flexGrow={1} sx={{ bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                <Box 
                  sx={{ 
                    width: '25%', 
                    height: '100%', 
                    bgcolor: 'primary.main', 
                    borderRadius: 1 
                  }} 
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                25%
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Document Preview Dialog */}
        <Dialog 
          open={previewDialogOpen} 
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClosePreview}
                aria-label="close"
              >
                <Close />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {previewDocument?.name || 'Document Preview'}
              </Typography>
              <Button 
                color="inherit"
                startIcon={<GetApp />}
                onClick={() => previewDocument && handleDownload(previewDocument)}
              >
                Download
              </Button>
            </Toolbar>
          </AppBar>
          <DialogContent sx={{ p: 0 }}>
            {renderPreviewContent(previewDocument)}
          </DialogContent>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
};

export default DocumentsPage;
