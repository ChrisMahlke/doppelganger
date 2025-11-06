import React from 'react';
import { Box, Typography, Button, TextField, useTheme } from '@mui/material';
import { Home, MyLocation, Search, Close, Brightness4, Brightness7, InfoOutlined, DescriptionOutlined } from '@mui/icons-material';

interface SearchHeaderProps {
  darkMode: boolean;
  isDesktop: boolean;
  inputZip: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSearch: () => void;
  onUseMyLocation: () => void;
  onToggleTheme: () => void;
  onShowIntro: () => void;
  onShowDataSources: () => void;
  onClose?: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  darkMode,
  isDesktop,
  inputZip,
  loading,
  onInputChange,
  onSearch,
  onUseMyLocation,
  onToggleTheme,
  onShowIntro,
  onShowDataSources,
  onClose,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      p: { xs: 2, md: 2.5 },
      borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
      backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.5)'
    }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
          <Home color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Demographic Doppelgänger
          </Typography>
        </Box>
        <Button
          variant="text"
          size="small"
          onClick={onToggleTheme}
          sx={{
            minWidth: 'auto',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            color: 'text.secondary'
          }}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Brightness7 sx={{ fontSize: 20 }} /> : <Brightness4 sx={{ fontSize: 20 }} />}
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={onShowIntro}
          sx={{
            minWidth: 'auto',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            color: 'text.secondary'
          }}
          title="Show introduction"
        >
          <InfoOutlined sx={{ fontSize: 20 }} />
        </Button>
        <Button
          variant="text"
          size="small"
          onClick={onShowDataSources}
          sx={{
            minWidth: 'auto',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            color: 'text.secondary'
          }}
          title="About the data sources"
        >
          <DescriptionOutlined sx={{ fontSize: 20 }} />
        </Button>
        {!isDesktop && onClose && (
          <Button
            variant="text"
            size="small"
            onClick={onClose}
            sx={{
              minWidth: 'auto',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              color: 'text.secondary'
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </Button>
        )}
      </Box>
      <Box component="form" 
        onSubmit={(e) => { e.preventDefault(); onSearch(); }} 
        sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}
      >
        <TextField
          placeholder="ZIP Code"
          variant="outlined"
          size="small"
          value={inputZip}
          onChange={(e) => onInputChange(e.target.value)}
          InputProps={{
            sx: {
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              // This is the fix: give the input a solid background
              backgroundColor: theme.palette.background.paper,
              '& input': {
                py: { xs: 1.25, md: 1.5 },
                width: '100px',
              }
            }
          }}
          sx={{
            width: '140px',
          }}
        />
        <Button 
          type="submit"
          variant="contained"
          startIcon={<Search sx={{ fontSize: 18 }} />}
          disabled={loading}
          sx={{
            minWidth: { xs: 'auto', md: 90 },
            px: { xs: 1.5, md: 2 },
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            }
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Search</Box>
        </Button>
        <Button 
          variant="outlined"
          onClick={onUseMyLocation}
          disabled={loading}
          sx={{
            minWidth: 'auto',
            px: { xs: 1.25, md: 1.5 },
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.12)',
            '&:hover': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)',
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            }
          }}
          title="Use My Location"
        >
          <MyLocation sx={{ fontSize: 18 }} />
        </Button>
      </Box>
    </Box>
  );
};

export default SearchHeader;