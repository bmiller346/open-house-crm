'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Calculate as CalculateIcon,
  LibraryBooks as LibraryIcon,
  StickyNote2 as NotesIcon,
  RecordVoiceOver as ScriptIcon,
} from '@mui/icons-material';
import { WholesalingHub } from './WholesalingHub';
import { InteractiveCalculators } from './InteractiveCalculators';
import { ResourceLibrary } from './ResourceLibrary';
import { PersonalNotes } from './PersonalNotes';
import { ScriptLibrary } from './ScriptLibrary';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function ResourceCenter() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'legal', label: 'Legal' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'process', label: 'Process' },
    { value: 'wholesaling', label: 'Wholesaling' },
    { value: 'scripts', label: 'Scripts' },
  ];

  const tabs = [
    { label: 'Wholesaling Hub', icon: <HomeIcon />, component: WholesalingHub },
    { label: 'Calculators', icon: <CalculateIcon />, component: InteractiveCalculators },
    { label: 'Resource Library', icon: <LibraryIcon />, component: ResourceLibrary },
    { label: 'Personal Notes', icon: <NotesIcon />, component: PersonalNotes },
    { label: 'Script Library', icon: <ScriptIcon />, component: ScriptLibrary },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={1} sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flex: 1 }}
          />
          <TextField
            select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 60,
              fontSize: '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          ))}
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading resources...
          </Typography>
        </Box>
      ) : (
        tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            <tab.component searchTerm={searchTerm} selectedCategory={selectedCategory} />
          </TabPanel>
        ))
      )}
    </Box>
  );
}
