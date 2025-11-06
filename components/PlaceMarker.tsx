import React from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Box, Typography, Paper, useTheme, IconButton, Divider } from '@mui/material';
import { Star, Close, AttachMoney, HomeWork, Groups } from '@mui/icons-material';
import { Place } from '../utils/placesHelper';
import { Demographics } from '../utils/types';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { formatCurrency, formatNumberCompact } from '../utils/formatters';

interface PlaceMarkerProps {
  selectedPlace: Place | null;
  demographics: Demographics | null;
  onClose: () => void;
}

// Define the keyframes for the pulsating animation
const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 128, 255, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 128, 255, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 128, 255, 0);
  }
`;

// Create a styled component for the custom marker
const PulsatingMarker = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${(props) => props.theme.palette.secondary.main};
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 rgba(0, 128, 255, 0.4);
  animation: ${pulse} 2s infinite;
  transform: scale(1);
  cursor: pointer;
`;

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ selectedPlace, demographics, onClose }) => {
  const theme = useTheme();

  if (!selectedPlace) {
    return null;
  }

  const isInfoWindowOpen = !!selectedPlace;

  return (
    <>
      <AdvancedMarker
        position={{
          lat: selectedPlace.location.latitude,
          lng: selectedPlace.location.longitude,
        }}
      >
        <PulsatingMarker theme={theme} />
      </AdvancedMarker>

      {isInfoWindowOpen && (
        <InfoWindow
          position={{
            lat: selectedPlace.location.latitude,
            lng: selectedPlace.location.longitude,
          }}
          onCloseClick={onClose}
          minWidth={250}
          pixelOffset={[0, -25]}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              position: 'relative',
              maxWidth: 280,
              backdropFilter: 'blur(10px) saturate(180%)',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(40, 40, 40, 0.85)' 
                : 'rgba(255, 255, 255, 0.85)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '12px',
              boxShadow: '0 4px_20px rgba(0,0,0,0.2)',
            }}
          >
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 4,
                top: 4,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close fontSize="small" />
            </IconButton>

            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, pr: 3 }}>
              {selectedPlace.displayName.text}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedPlace.formattedAddress}
            </Typography>
            {selectedPlace.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {selectedPlace.rating.toFixed(1)}
                </Typography>
              </Box>
            )}

            {demographics && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Surrounding Area (ZIP: {demographics.zipCode})
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', gap: 1 }}>
                  <Box>
                    <Groups sx={{ fontSize: 20, color: 'text.secondary', mb: 0.25 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {formatNumberCompact(demographics.population)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Population</Typography>
                  </Box>
                  <Box>
                    <AttachMoney sx={{ fontSize: 20, color: 'text.secondary', mb: 0.25 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {formatCurrency(demographics.medianIncome)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Med. Income</Typography>
                  </Box>
                  <Box>
                    <HomeWork sx={{ fontSize: 20, color: 'text.secondary', mb: 0.25 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {formatCurrency(demographics.medianHomeValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Med. Home</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </InfoWindow>
      )}
    </>
  );
};

export default PlaceMarker;