'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Paper,
  Popper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Divider,
  useTheme,
  alpha,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  People,
  AttachMoney,
  Business,
  CalendarToday,
  TrendingUp,
  KeyboardArrowRight,
  History,
  Star
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'contact' | 'transaction' | 'property' | 'page' | 'document';
  icon: React.ReactNode;
  path: string;
  score?: number;
}

interface SearchProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'John Smith',
    subtitle: 'Contact • john.smith@email.com',
    type: 'contact',
    icon: <People />,
    path: '/contacts/1',
    score: 0.95
  },
  {
    id: '2',
    title: '123 Oak Street',
    subtitle: 'Property • $450,000 • Listed',
    type: 'property',
    icon: <Business />,
    path: '/inventory/2',
    score: 0.87
  },
  {
    id: '3',
    title: 'Transaction #TX-2024-001',
    subtitle: 'Active Deal • $325,000',
    type: 'transaction',
    icon: <AttachMoney />,
    path: '/transactions/3',
    score: 0.73
  },
  {
    id: '4',
    title: 'Dashboard',
    subtitle: 'Page • Overview and stats',
    type: 'page',
    icon: <TrendingUp />,
    path: '/dashboard',
    score: 0.65
  }
];

const recentSearches = [
  'John Smith',
  '123 Oak Street',
  'Active deals',
  'December transactions'
];

const quickActions = [
  { label: 'Add Contact', path: '/contacts/new', icon: <People /> },
  { label: 'New Transaction', path: '/transactions/new', icon: <AttachMoney /> },
  { label: 'Add Property', path: '/inventory/new', icon: <Business /> },
  { label: 'Schedule Meeting', path: '/calendar/new', icon: <CalendarToday /> }
];

export default function Search({ 
  onResultClick, 
  placeholder = "Search contacts, properties, deals...",
  size = 'medium',
  fullWidth = false 
}: SearchProps) {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Simulate search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      // Simulate API call
      const filtered = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setSelectedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (onResultClick) {
      onResultClick(result);
    } else {
      router.push(result.path);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contact': return theme.palette.primary.main;
      case 'transaction': return theme.palette.success.main;
      case 'property': return theme.palette.warning.main;
      case 'page': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contact': return 'Contact';
      case 'transaction': return 'Transaction';
      case 'property': return 'Property';
      case 'page': return 'Page';
      case 'document': return 'Document';
      default: return 'Item';
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        <Paper
          ref={anchorRef}
          elevation={isOpen ? 2 : 1}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: fullWidth ? '100%' : size === 'small' ? '280px' : '400px',
            height: size === 'small' ? '36px' : '44px',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
            },
            '&:focus-within': {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
            }
          }}
        >
          <SearchIcon 
            sx={{ 
              color: theme.palette.text.secondary, 
              fontSize: size === 'small' ? '18px' : '20px',
              mr: 1
            }} 
          />
          <InputBase
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
              fontSize: size === 'small' ? '14px' : '16px',
              '& .MuiInputBase-input': {
                py: 0,
                '&::placeholder': {
                  color: theme.palette.text.secondary,
                  opacity: 0.7
                }
              }
            }}
          />
          {query && (
            <IconButton 
              onClick={handleClear} 
              size="small"
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1)
                }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '11px',
                px: 1,
                py: 0.25,
                backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                borderRadius: 0.5,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              ⌘K
            </Typography>
          </Box>
        </Paper>

        <Popper
          open={isOpen}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <Paper
                elevation={8}
                sx={{
                  mt: 1,
                  maxHeight: '400px',
                  overflow: 'auto',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                {query.length < 2 ? (
                  <Box sx={{ p: 2 }}>
                    {/* Recent Searches */}
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Recent Searches
                    </Typography>
                    <List dense>
                      {recentSearches.map((search, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.action.hover, 0.5)
                            }
                          }}
                          onClick={() => setQuery(search)}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <History fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={search} />
                        </ListItem>
                      ))}
                    </List>

                    <Divider sx={{ my: 1 }} />

                    {/* Quick Actions */}
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Quick Actions
                    </Typography>
                    <List dense>
                      {quickActions.map((action, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.action.hover, 0.5)
                            }
                          }}
                          onClick={() => {
                            setIsOpen(false);
                            router.push(action.path);
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {action.icon}
                          </ListItemIcon>
                          <ListItemText primary={action.label} />
                          <KeyboardArrowRight fontSize="small" />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Box>
                    {isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : results.length > 0 ? (
                      <List dense>
                        {results.map((result, index) => (
                          <ListItem
                            key={result.id}
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: selectedIndex === index ? 
                                alpha(theme.palette.primary.main, 0.1) : 'transparent',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                            onClick={() => handleResultClick(result)}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Box sx={{ color: getTypeColor(result.type) }}>
                                {result.icon}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {result.title}
                                  </Typography>
                                  <Chip
                                    label={getTypeLabel(result.type)}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '10px',
                                      backgroundColor: alpha(getTypeColor(result.type), 0.1),
                                      color: getTypeColor(result.type),
                                      border: `1px solid ${alpha(getTypeColor(result.type), 0.2)}`
                                    }}
                                  />
                                </Box>
                              }
                              secondary={result.subtitle}
                            />
                            {result.score && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Star
                                  fontSize="small"
                                  sx={{ 
                                    color: theme.palette.warning.main,
                                    opacity: result.score 
                                  }}
                                />
                              </Box>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No results found for "{query}"
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
