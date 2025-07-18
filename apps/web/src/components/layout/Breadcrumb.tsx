'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Breadcrumbs, 
  Link, 
  Typography, 
  Box, 
  IconButton,
  Chip
} from '@mui/material';
import { 
  Home, 
  NavigateNext, 
  ArrowBack,
  Dashboard,
  People,
  AttachMoney,
  Business,
  ShowChart,
  CalendarToday,
  Settings,
  Help,
  AccountCircle
} from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

const routeConfig: Record<string, { label: string; icon: React.ReactNode; parent?: string }> = {
  '/dashboard': { label: 'Dashboard', icon: <Dashboard /> },
  '/contacts': { label: 'Contacts', icon: <People /> },
  '/transactions': { label: 'Transactions', icon: <AttachMoney /> },
  '/inventory': { label: 'Properties', icon: <Business /> },
  '/analytics': { label: 'Analytics', icon: <ShowChart /> },
  '/calendar': { label: 'Calendar', icon: <CalendarToday /> },
  '/settings': { label: 'Settings', icon: <Settings /> },
  '/account': { label: 'Account', icon: <AccountCircle /> },
  '/help': { label: 'Help', icon: <Help /> },
  '/property-data': { label: 'Property Data', icon: <Business />, parent: '/analytics' },
  '/analytics/trends': { label: 'Market Trends', icon: <ShowChart />, parent: '/analytics' },
  '/campaigns': { label: 'Campaigns', icon: <ShowChart /> },
  '/documents': { label: 'Documents', icon: <ShowChart /> },
  '/ai': { label: 'AI Assistant', icon: <ShowChart /> },
  '/map': { label: 'Map View', icon: <ShowChart /> },
  '/forum': { label: 'Forum', icon: <ShowChart /> },
  '/resources': { label: 'Resources', icon: <ShowChart /> },
  '/pipelines': { label: 'Pipelines', icon: <ShowChart /> },
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      href: '/dashboard',
      icon: <Home />
    });

    // Get current route config
    const currentRoute = routeConfig[pathname];
    if (!currentRoute) {
      // Handle dynamic routes or unknown routes
      const segments = pathname.split('/').filter(Boolean);
      segments.forEach((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const config = routeConfig[path];
        if (config) {
          breadcrumbs.push({
            label: config.label,
            href: path,
            icon: config.icon,
            isActive: path === pathname
          });
        } else {
          // Fallback for unknown segments
          breadcrumbs.push({
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: path,
            isActive: path === pathname
          });
        }
      });
    } else {
      // Handle parent routes
      if (currentRoute.parent) {
        const parentConfig = routeConfig[currentRoute.parent];
        if (parentConfig) {
          breadcrumbs.push({
            label: parentConfig.label,
            href: currentRoute.parent,
            icon: parentConfig.icon
          });
        }
      }
      
      // Add current route
      breadcrumbs.push({
        label: currentRoute.label,
        icon: currentRoute.icon,
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const canGoBack = breadcrumbs.length > 1;

  const handleGoBack = () => {
    if (canGoBack) {
      router.back();
    }
  };

  const handleBreadcrumbClick = (href: string) => {
    router.push(href);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        py: 1,
        px: 0,
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        mb: 2
      }}
    >
      {/* Back Button */}
      <IconButton 
        onClick={handleGoBack}
        disabled={!canGoBack}
        size="small"
        sx={{ 
          mr: 1,
          opacity: canGoBack ? 1 : 0.3,
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <ArrowBack fontSize="small" />
      </IconButton>

      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ flex: 1 }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isActive = item.isActive || isLast;

          if (isActive) {
            return (
              <Box 
                key={item.label} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: 'primary.main',
                  fontWeight: 600
                }}
              >
                {item.icon}
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {item.label}
                </Typography>
              </Box>
            );
          }

          return (
            <Link
              key={item.label}
              component="button"
              onClick={() => item.href && handleBreadcrumbClick(item.href)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                },
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem'
              }}
            >
              {item.icon}
              <Typography variant="body2" color="inherit">
                {item.label}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>

      {/* Page Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {pathname === '/dashboard' && (
          <Chip 
            label="Overview" 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        )}
        {pathname === '/contacts' && (
          <Chip 
            label="All Contacts" 
            size="small" 
            color="default" 
            variant="outlined"
          />
        )}
        {pathname === '/transactions' && (
          <Chip 
            label="Active Deals" 
            size="small" 
            color="success" 
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
}
