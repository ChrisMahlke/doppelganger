import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Collapse,
  ListItemButton,
} from '@mui/material';
import { Place as PlaceIcon, Star, ExpandMore, OpenInNew } from '@mui/icons-material';
import { Place } from '../utils/placesHelper';

interface PlacesCardProps {
  places: Place[] | null;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  onSelectPlace: (place: Place | null) => void;
}

const PlacesCard: React.FC<PlacesCardProps> = ({ places, loading, error, darkMode, onSelectPlace }) => {
  const [expanded, setExpanded] = useState(false);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ mt: 1 }}>
          {[...Array(5)].map((_, i) => (
             <Skeleton key={i} variant="text" height={40} />
          ))}
        </Box>
      );
    }

    if (error) {
      return <Alert severity="warning" sx={{ mt: 1.5 }}>{error}</Alert>;
    }

    if (!places || places.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          No notable points of interest were found for this area.
        </Typography>
      );
    }

    return (
      <List dense disablePadding sx={{ mt: 1 }}>
        {places.map((place, index) => (
          <React.Fragment key={place.id}>
            <ListItem
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="open in google maps"
                  title="Open in Google Maps"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.formattedAddress)}&query_place_id=${place.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OpenInNew fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => onSelectPlace(place)} sx={{ pr: 6 }}>
                <ListItemText
                  primary={place.displayName.text}
                  primaryTypographyProps={{ fontWeight: 500, noWrap: true }}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      {place.rating && (
                        <>
                          <Star sx={{ fontSize: 14, color: 'warning.main' }} />
                          <Typography variant="body2" color="text.secondary">{place.rating.toFixed(1)}</Typography>
                          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }}/>
                        </>
                      )}
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {place.formattedAddress}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < places.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Card sx={{
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      border: '1px solid',
      borderColor: 'primary.main',
      boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: expanded ? 1.5 : 0, 
            cursor: 'pointer' 
          }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontSize: 18 }}>
                    {React.cloneElement(<PlaceIcon />, { 
                        color: 'primary',
                        fontSize: 'inherit'
                    })}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Points of Interest
                </Typography>
            </Box>
            <ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {renderContent()}
        </Collapse>

      </CardContent>
    </Card>
  );
};

export default PlacesCard;