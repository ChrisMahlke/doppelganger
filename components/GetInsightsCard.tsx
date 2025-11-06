import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

interface GetInsightsCardProps {
  onGetInsights: () => void;
  darkMode: boolean;
}

const GetInsightsCard: React.FC<GetInsightsCardProps> = ({ onGetInsights, darkMode }) => {
  return (
    <Card sx={{
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
    }}>
      <CardContent sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Unlock the full story of this community with AI-powered analysis.
        </Typography>
        <Button
          variant="contained"
          onClick={onGetInsights}
          startIcon={<AutoAwesome />}
        >
          Get AI Insights & Doppelgängers
        </Button>
      </CardContent>
    </Card>
  );
};

export default GetInsightsCard;