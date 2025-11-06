import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton, Chip } from '@mui/material';
import InfoItem from './InfoItem';
import GeminiInsight from './GeminiInsight';
import DoppelgangerCard from './DoppelgangerCard';
import PlacesCard from './PlacesCard';
import DemographicsPanel from './DemographicsPanel';
import GetInsightsCard from './GetInsightsCard';
import LoadingFactsCard from './LoadingFactsCard'; // Import the new component
import { Demographics, Profile, Doppelganger } from '../utils/types';
import { Place } from '../utils/placesHelper';
import { formatNumber, formatCurrency } from '../utils/formatters';

interface DemographicsContentProps {
  loading: boolean;
  demographics: Demographics | null;
  aiData: { profile: Profile; doppelgangers: Doppelganger[] } | null;
  aiLoading: boolean;
  zipCode: string | null;
  cities: string[] | null;
  darkMode: boolean;
  onShowOnMap: (zip: string) => void;
  places: Place[] | null;
  placesLoading: boolean;
  placesError: string | null;
  onSelectPlace: (place: Place | null) => void;
  onGetAiInsights: () => void;
  onCancelAiRequest: () => void;
}

const DemographicsContent: React.FC<DemographicsContentProps> = ({
  loading,
  demographics,
  aiData,
  aiLoading,
  zipCode,
  cities,
  darkMode,
  onShowOnMap,
  places,
  placesLoading,
  placesError,
  onSelectPlace,
  onGetAiInsights,
  onCancelAiRequest,
}) => {
  const showAiInsights = aiData !== null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Card key={index} sx={{ 
            backdropFilter: 'blur(10px)',
            backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1.5 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (!demographics || !zipCode) {
    return (
      <Card sx={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Search for a ZIP code or use your location to view demographics data.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* ZIP Code Summary Card */}
      <Card sx={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem', fontWeight: 600 }}>
            ZIP Code
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: 'primary.main' }}>
            {zipCode}
          </Typography>
          {cities && cities.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, mb: 1.5 }}>
              {cities.map((city) => (
                <Chip key={city} label={city} size="small" variant="outlined" />
              ))}
            </Box>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: cities ? 0 : 1.5 }}>
            <InfoItem label="Population" value={formatNumber(demographics.population)} />
            <InfoItem label="Age" value={`${demographics.medianAge} yrs`} />
            <InfoItem label="Income" value={formatCurrency(demographics.medianIncome)} />
            <InfoItem label="Home Value" value={formatCurrency(demographics.medianHomeValue)} />
          </Box>
        </CardContent>
      </Card>

      <DemographicsPanel
        demographics={demographics}
        darkMode={darkMode}
      />
      
      {aiLoading ? (
        <LoadingFactsCard darkMode={darkMode} onCancel={onCancelAiRequest} />
      ) : !showAiInsights ? (
        <GetInsightsCard onGetInsights={onGetAiInsights} darkMode={darkMode} />
      ) : null}
      
      {showAiInsights && aiData && (
        <>
          <GeminiInsight
            profile={aiData.profile}
            darkMode={darkMode}
          />
          <DoppelgangerCard
            doppelgangers={aiData.doppelgangers}
            darkMode={darkMode}
            onShowOnMap={onShowOnMap}
          />
        </>
      )}

      <PlacesCard
        places={places}
        loading={placesLoading}
        error={placesError}
        darkMode={darkMode}
        onSelectPlace={onSelectPlace}
      />
    </Box>
  );
};

export default DemographicsContent;