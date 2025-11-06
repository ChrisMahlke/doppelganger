import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import {
  AccountBalance,
  AutoAwesome,
  PinDrop,
  Place,
  Build,
  Cloud,
  MyLocation,
  DesignServices,
  Storage,
  VpnKey,
  DeveloperBoard,
  Key,
  DataObject, // New icon for the Node.js service
} from '@mui/icons-material';

interface DataSourcesModalProps {
  open: boolean;
  onClose: () => void;
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ mt: 3, mb: 1 }}>
    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
    <Divider />
  </Box>
);

const DataSourcesModal: React.FC<DataSourcesModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="data-sources-dialog-title" maxWidth="sm" fullWidth>
      <DialogTitle id="data-sources-dialog-title" sx={{ pb: 1 }}>
        About Our Data & Technology
      </DialogTitle>
      <DialogContent sx={{ pt: '0 !important' }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          This application is built on a secure, multi-service architecture that synthesizes information from leading data sources to provide a comprehensive profile of each community.
        </Typography>

        <SectionHeader>Core Data Providers</SectionHeader>
        <List dense>
          <ListItem>
            <ListItemIcon><AccountBalance color="primary" /></ListItemIcon>
            <ListItemText
              primary="U.S. Census Bureau (ACS & TIGERweb)"
              secondary="Provides core demographic statistics (2022 ACS 5-Year Estimates) and geographic boundaries."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><PinDrop sx={{ color: '#34A853' }} /></ListItemIcon>
            <ListItemText
              primary="Google Maps Platform"
              secondary="Powers the interactive map and Geocoding API (secured with HTTP referrer restrictions)."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><Place sx={{ color: '#EA4335' }} /></ListItemIcon>
            <ListItemText
              primary="Google Places API"
              secondary="Identifies and displays local points of interest within the selected area."
            />
          </ListItem>
           <ListItem>
            <ListItemIcon><MyLocation sx={{ color: '#4285F4' }} /></ListItemIcon>
            <ListItemText
              primary="Browser Geolocation API"
              secondary="Used with your permission to determine your current location."
            />
          </ListItem>
        </List>

        <SectionHeader>Backend Architecture & Security</SectionHeader>
        <List dense>
           <ListItem>
            <ListItemIcon><VpnKey sx={{ color: '#1A73E8' }} /></ListItemIcon>
            <ListItemText
              primary="Google Cloud API Gateway"
              secondary="The public-facing 'front door' that handles authentication via `x-api-key` and routes requests to the public API service."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><DataObject sx={{ color: '#339933' }} /></ListItemIcon>
            <ListItemText
              primary="Public API Service (Cloud Run)"
              secondary="A lightweight Node.js service that validates and securely forwards requests to the private engine service."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><DeveloperBoard sx={{ color: '#FF6D00' }} /></ListItemIcon>
            <ListItemText
              primary="Private Engine Service (Cloud Run)"
              secondary="The internal-only Python service that orchestrates AI analysis. Tuned for performance (2Gi RAM, min-instances=1 for zero cold starts) and is protected from the public internet."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><AutoAwesome color="secondary" /></ListItemIcon>
            <ListItemText
              primary="Google Gemini API"
              secondary="The AI engine that generates market profiles and finds 'doppelgänger' ZIP codes."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><Storage sx={{ color: '#FFCA28' }} /></ListItemIcon>
            <ListItemText
              primary="Google Cloud Firestore"
              secondary="Acts as a high-speed cache, providing instant results for previously searched ZIP codes."
            />
          </ListItem>
           <ListItem>
            <ListItemIcon><Key sx={{ color: '#BDBDBD' }} /></ListItemIcon>
            <ListItemText
              primary="Google Cloud Secret Manager"
              secondary="Securely stores and manages sensitive credentials, like the Gemini API key, for the backend services."
            />
          </ListItem>
        </List>
        
        <SectionHeader>Platform & Tools</SectionHeader>
        <List dense>
          <ListItem>
            <ListItemIcon><Cloud sx={{ color: '#1A73E8' }} /></ListItemIcon>
            <ListItemText
              primary="Google Cloud Platform"
              secondary="Provides the scalable infrastructure for hosting all frontend and backend services on Cloud Run."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><Build sx={{ color: '#FBC02D' }} /></ListItemIcon>
            <ListItemText
              primary="Google AI Studio"
              secondary="The development environment used to build and deploy the frontend web application."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><DesignServices sx={{ color: '#008168' }} /></ListItemIcon>
            <ListItemText
              primary="Material-UI (MUI) & React"
              secondary="The UI component library and framework for a clean, responsive interface."
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataSourcesModal;