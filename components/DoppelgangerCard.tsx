import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  Divider,
  Chip,
  Skeleton,
} from '@mui/material';
import { TravelExplore } from '@mui/icons-material';
import { Doppelganger } from '../utils/types';

interface DoppelgangerCardProps {
  doppelgangers: Doppelganger[] | null;
  darkMode: boolean;
  onShowOnMap: (zip: string) => void;
}

const DoppelgangerCard: React.FC<DoppelgangerCardProps> = ({
  doppelgangers,
  darkMode,
  onShowOnMap,
}) => {
  return (
    <Card sx={{
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
      borderColor: 'primary.main',
      borderWidth: '1px',
      borderStyle: 'solid'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    <TravelExplore color="primary" fontSize="small" />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Doppelgänger Results
                </Typography>
            </Box>
        </Box>

        {!doppelgangers ? (
          <Box>
            <Skeleton variant="text" height={40} />
            <Divider sx={{ my: 1 }} />
            <Skeleton variant="text" height={40} />
          </Box>
        ) : doppelgangers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No similar ZIP codes found.
          </Typography>
        ) : (
            <List disablePadding>
                {doppelgangers.map((zip, index) => (
                <React.Fragment key={zip.zipCode}>
                    <ListItem 
                        disablePadding 
                    >
                        <Button
                            onClick={() => onShowOnMap(zip.zipCode)}
                            title={`Compare ${zip.zipCode} on the map`}
                            sx={{
                                p: 1,
                                textTransform: 'none',
                                textAlign: 'left',
                                display: 'block',
                                color: 'text.primary',
                                '&:hover': { backgroundColor: 'action.hover' },
                                width: '100%',
                                borderRadius: 1
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {zip.city}, {zip.state} {zip.zipCode}
                                </Typography>
                                <Chip label={`${zip.similarityPercentage}% Match`} size="small" variant="outlined" color="success" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                {zip.similarityReason}
                            </Typography>
                        </Button>
                    </ListItem>
                    {index < doppelgangers.length - 1 && <Divider component="li" />}
                </React.Fragment>
                ))}
            </List>
        )}
      </CardContent>
    </Card>
  );
};

export default DoppelgangerCard;