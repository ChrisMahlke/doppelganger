import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from '@mui/material';
import { AutoAwesome, FiberManualRecord } from '@mui/icons-material';
import { Profile } from '../utils/types';

interface GeminiInsightProps {
  profile: Profile | null;
  darkMode: boolean;
}

const GeminiInsight: React.FC<GeminiInsightProps> = ({ profile, darkMode }) => {
  return (
    <Card sx={{
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
      borderColor: 'secondary.main',
      borderWidth: '1px',
      borderStyle: 'solid'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'secondary.main', fontSize: 18 }}>
            {React.cloneElement(<AutoAwesome />, { color: 'secondary', fontSize: 'inherit' })}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Gemini Market Profile
          </Typography>
        </Box>

        {!profile ? (
            <Box>
                <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={100} />
            </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, color: 'text.secondary' }}>
              Who Are We?
            </Typography>
            <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
              {profile.whoAreWe}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, mt: 2, color: 'text.secondary' }}>
              Our Neighborhood
            </Typography>
            <List dense sx={{ p: 0 }}>
              {profile.ourNeighborhood.map((item, index) => (
                <ListItem key={index} sx={{ p: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}>
                    <FiberManualRecord sx={{ fontSize: 8, color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, mb: 1, mt: 2, color: 'text.secondary' }}>
              Socioeconomic Traits
            </Typography>
            <List dense sx={{ p: 0 }}>
              {profile.socioeconomicTraits.map((item, index) => (
                <ListItem key={index} sx={{ p: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}>
                    <FiberManualRecord sx={{ fontSize: 8, color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GeminiInsight;