import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';
import { Search, QueryStats, TravelExplore, ArrowForward } from '@mui/icons-material';

interface PopUpProps {
  open: boolean;
  onClose: () => void;
}

const Step = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    const theme = useTheme();
    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                backgroundColor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                color: 'primary.main',
                margin: '0 auto',
                mb: 2,
            }}>
                {icon}
            </Box>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
    );
};


const PopUp: React.FC<PopUpProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="welcome-dialog-title"
      maxWidth="md"
    >
      <DialogTitle id="welcome-dialog-title" sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>Welcome to Demographic Doppelgänger</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Your journey to uncovering surprising community connections starts here.</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 2 }}
          alignItems="center"
          justifyContent="center"
          sx={{ my: 2 }}
        >
          <Step 
            icon={<Search sx={{ fontSize: 32 }} />} 
            title="Search" 
            description="Enter a ZIP code to see its core demographic data instantly." 
          />
          <ArrowForward sx={{ color: 'text.disabled', transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
          <Step 
            icon={<QueryStats sx={{ fontSize: 32 }} />} 
            title="Analyze" 
            description="Click a button to send that data to our AI for deeper analysis." 
          />
          <ArrowForward sx={{ color: 'text.disabled', transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
          <Step 
            icon={<TravelExplore sx={{ fontSize: 32 }} />} 
            title="Discover" 
            description="Uncover the AI-generated profile and find its surprising twin." 
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button onClick={onClose} variant="contained" size="large" autoFocus sx={{ px: 5, py: 1.5, borderRadius: '24px' }}>
          Let's Begin
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopUp;
