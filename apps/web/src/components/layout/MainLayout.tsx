'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Chip,
  Collapse,
  useTheme,
  useMediaQuery,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Snackbar,
  Alert,
  Paper,
  InputBase,
  Tooltip,  // Add this import!
  CssBaseline,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Adb as AdbIcon,
  Home,
  People,
  AttachMoney,
  Assessment,
  Settings,
  Business,
  Logout,
  Notifications,
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  Dashboard,
  Inventory,
  CalendarToday,
  Description,
  Campaign,
  Timeline,
  Forum,
  School,
  Map as MapIcon,
  CloudSync,
  SmartToy,
  AccountCircle,
  Webhook,
  Add,
  Phone,
  Email,
  Event,
  ChevronRight,
  Help
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from './Breadcrumb';
import Search from './Search';

const drawerWidth = 260;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: NavItem[];
  isNew?: boolean;
}

const navigationItems: NavItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Contacts', icon: <People />, path: '/contacts', badge: 3 },
  { text: 'Properties', icon: <Home />, path: '/inventory' },
  { text: 'Transactions', icon: <AttachMoney />, path: '/transactions' },
  { text: 'Pipelines', icon: <Assessment />, path: '/pipelines' },
  { 
    text: 'Analytics', 
    icon: <Assessment />, 
    path: '/analytics',
    children: [
      { text: 'Overview', icon: <Dashboard />, path: '/analytics' },
      { text: 'Property Data', icon: <Home />, path: '/property-data' },
      { text: 'Market Trends', icon: <Assessment />, path: '/analytics/trends' }
    ]
  },
  { text: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
  { text: 'Campaigns', icon: <Campaign />, path: '/campaigns' },
  { text: 'Documents', icon: <Description />, path: '/documents' },
  { text: 'Webhooks', icon: <Webhook />, path: '/webhooks', isNew: true },
  { text: 'AI Assistant', icon: <SmartToy />, path: '/ai', isNew: true },
  { text: 'Map View', icon: <MapIcon />, path: '/map' },
  { text: 'Forum', icon: <Forum />, path: '/forum' },
  { text: 'Resources', icon: <School />, path: '/resources' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [notifications] = useState(5);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleExpandClick = (text: string) => {
    setExpandedItems(prev =>
      prev.includes(text)
        ? prev.filter(item => item !== text)
        : [...prev, text]
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}
          >
            OH
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Open House
            </Typography>
            <Typography variant="caption" color="text.secondary">
              CRM Platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => item.children ? handleExpandClick(item.text) : handleNavClick(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      }
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.8),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    <Badge 
                      badgeContent={item.badge} 
                      color="error" 
                      sx={{ '& .MuiBadge-badge': { fontSize: '10px', height: 16, minWidth: 16 } }}
                    >
                      {item.icon}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: pathname === item.path ? 600 : 500 
                    }}
                  />
                  {item.isNew && (
                    <Box
                      sx={{
                        backgroundColor: 'success.main',
                        color: 'white',
                        borderRadius: 1,
                        px: 1,
                        py: 0.25,
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      NEW
                    </Box>
                  )}
                  {item.children && (
                    <Box sx={{ color: 'text.secondary' }}>
                      {expandedItems.includes(item.text) ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
              {item.children && (
                <Collapse in={expandedItems.includes(item.text)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 1 }}>
                    {item.children.map((child) => (
                      <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          selected={pathname === child.path}
                          onClick={() => handleNavClick(child.path)}
                          sx={{
                            borderRadius: 2,
                            py: 0.75,
                            px: 2,
                            pl: 4,
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                            <ChevronRight fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.text} 
                            primaryTypographyProps={{ 
                              variant: 'body2', 
                              fontSize: '13px',
                              fontWeight: pathname === child.path ? 600 : 400
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavClick('/settings')}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavClick('/help')}
              sx={{ borderRadius: 2, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Help />
              </ListItemIcon>
              <ListItemText primary="Help" primaryTypographyProps={{ variant: 'body2' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, height: 64 }}>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Search */}
          <Box sx={{ flexGrow: 1, maxWidth: 600 }}>
            <Search fullWidth />
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Quick Add
            </Button>
            
            <IconButton 
              color="inherit"
              sx={{ 
                position: 'relative',
                '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.8) }
              }}
            >
              <Badge badgeContent={notifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar 
                    alt={user ? `${user.firstName} ${user.lastName}` : 'User'} 
                    src={user?.avatar}
                  >
                    {!user?.avatar && (user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U')}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'Loading...'}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); router.push('/account'); }}>
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  My Account
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); router.push('/settings'); }}>
                  <ListItemIcon><Settings /></ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Side Navigation */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider'
          }
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              position: 'relative',
              height: '100vh'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          backgroundColor: 'background.default'
        }}
      >
        <Toolbar sx={{ height: 64 }} />
        <Box sx={{ p: 3 }}>
          <Breadcrumb />
          {children}
        </Box>
      </Box>
    </Box>
  );
}