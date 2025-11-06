import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import { Menu } from '@mui/icons-material';

import PopUp from './components/popup/PopUp';
import DataSourcesModal from './components/DataSourcesModal';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MapController from './components/MapController';
import PolygonDrawer from './components/PolygonDrawer';
import SearchHeader from './components/SearchHeader';
import DemographicsContent from './components/DemographicsContent';
import PlaceMarker from './components/PlaceMarker';
import ConnectionLineDrawer from './components/ConnectionLineDrawer';

import { Demographics, Profile, Doppelganger } from './utils/types';
import { fetchZipCodeBoundary, type LatLngLiteral } from './utils/censusBoundaryHelper';
import { getCensusDataByZipCode } from './utils/censusDataHelper';
import { getDoppelgangerData, geocodeToZipCode, geocodeZipToCities } from './utils/apiHelper';
import { searchPlaces, Place } from './utils/placesHelper';
import { getTheme } from './theme/theme';

// Google Maps API Key - loaded from environment variable
// Set this in your .env.local file: VITE_GOOGLE_MAPS_API_KEY=your-key-here
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";


const LIGHT_MAP_ID = '11a94722049cf825b1e1a387';
const DARK_MAP_ID = '11a94722049cf825be87f0ef'; 

// Centered on the contiguous United States
const DEFAULT_COORDINATES = { lat: 39.8283, lng: -98.5795 };

if (typeof API_KEY !== 'string') {
  throw new Error(
    'Missing required environment variable: API_KEY'
  );
}

const App: React.FC = () => {
  // --- Refactored State ---
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [aiData, setAiData] = useState<{ profile: Profile; doppelgangers: Doppelganger[] } | null>(null);

  const [zipCode, setZipCode] = useState<string | null>(null);
  const [cities, setCities] = useState<string[] | null>(null);
  const [inputZip, setInputZip] = useState('');
  
  // No initial loading, app starts ready for input.
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [showPopup, setShowPopup] = useState(true);
  const [showDataSources, setShowDataSources] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Map State
  const [polygonPaths, setPolygonPaths] = useState<LatLngLiteral[][] | null>(null);
  const [comparisonPolygonPaths, setComparisonPolygonPaths] = useState<LatLngLiteral[][] | null>(null);
  
  // Places State (still fetched client-side)
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const theme = getTheme(darkMode ? 'dark' : 'light');
  
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const checkIsDesktop = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const handleClosePopup = () => setShowPopup(false);
  const handleShowIntro = () => setShowPopup(true);
  const handleShowDataSources = () => setShowDataSources(true);
  const handleCloseDataSources = () => setShowDataSources(false);

  const toggleSidebar = () => {
    if (!isDesktop) {
        setSidebarOpen(!sidebarOpen);
    }
  };

  const clearAllData = () => {
    setDemographics(null);
    setAiData(null);
    setZipCode(null);
    setCities(null);
    setPolygonPaths(null);
    setComparisonPolygonPaths(null);
    setPlaces(null);
    setPlacesError(null);
    setSelectedPlace(null);
  };
  
  const handleFetchPlaces = async (paths: LatLngLiteral[][], zip: string) => {
    setPlacesLoading(true);
    setPlacesError(null);
    setPlaces(null);
    try {
        // Step 1: Broad search using the bounding box to get candidate places
        const candidatePlaces = await searchPlaces(paths, zip, API_KEY);

        if (candidatePlaces.length === 0) {
            setPlaces([]);
            return;
        }

        // Step 2: Precise point-in-polygon filtering
        if (!(window as any).google || !(window as any).google.maps.geometry) {
            console.warn("Google Maps Geometry library not loaded. Skipping precise filtering.");
            setPlaces(candidatePlaces);
            return;
        }

        const zipPolygon = new (window as any).google.maps.Polygon({ paths });

        const filteredPlaces = candidatePlaces.filter(place => {
            const placeLatLng = new (window as any).google.maps.LatLng(
                place.location.latitude,
                place.location.longitude
            );
            return (window as any).google.maps.geometry.poly.containsLocation(placeLatLng, zipPolygon);
        });

        setPlaces(filteredPlaces);

    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setPlacesError(`Could not fetch places: ${message}`);
    } finally {
        setPlacesLoading(false);
    }
  };
  
  const executeSearch = async (searchZip: string) => {
    if (!/^\d{5}$/.test(searchZip)) {
        setError("Please enter a valid 5-digit ZIP code.");
        return;
    }
    setLoading(true);
    setError(null);
    clearAllData();

    try {
        // 1. Fetch ONLY demographics, cities, and boundaries in parallel
        const [demoData, cityNames, paths] = await Promise.all([
            getCensusDataByZipCode(searchZip),
            geocodeZipToCities(API_KEY, searchZip),
            fetchZipCodeBoundary(searchZip),
        ]);
        
        setDemographics(demoData);
        setCities(cityNames);
        setZipCode(searchZip);
        setInputZip(searchZip);
        setPolygonPaths(paths);

        // 2. Fetch places for the primary ZIP code (dependent on boundary)
        handleFetchPlaces(paths, searchZip);

    } catch (err) {
        const message = err instanceof Error ? err.message : `An unknown error occurred.`;
        setError(message);
        clearAllData();
    } finally {
        setLoading(false);
    }
  };
  
  const fetchDataByCoords = async (lat?: number, lng?: number) => {
    setLoading(true);
    setError(null);
    try {
        const resolvedZip = await geocodeToZipCode(API_KEY, lat, lng);
        if (resolvedZip) {
            executeSearch(resolvedZip);
        } else {
            throw new Error('Could not determine ZIP code for your location.');
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
        setLoading(false);
    }
  };

  const handleSearch = () => {
    executeSearch(inputZip);
  };
  
  const handleUseMyLocation = () => {
      fetchDataByCoords(undefined, undefined);
  }

  const handleShowOnMap = async (comparisonZipCode: string) => {
    setLoading(true); 
    try {
        const paths = await fetchZipCodeBoundary(comparisonZipCode);
        setComparisonPolygonPaths(paths);
    } catch (err) {
        const message = err instanceof Error ? err.message : `An unknown error occurred.`;
        setError(`Could not fetch data for comparison ZIP ${comparisonZipCode}: ${message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleSelectPlace = (place: Place | null) => {
    setSelectedPlace(place);
  };

  const handleMarkerClose = () => {
    setSelectedPlace(null);
  };
  
  const handleGetAiInsights = async () => {
    if (!zipCode) return;
    setAiLoading(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const response = await getDoppelgangerData(zipCode, signal);
      if (signal.aborted) return;
      setAiData({
        profile: response.profile,
        doppelgangers: response.doppelgangers,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const message = err instanceof Error ? err.message : `An unknown error occurred.`;
        setError(message);
      }
    } finally {
      if (!signal.aborted) {
        setAiLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleCancelAiRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setAiLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PopUp open={showPopup} onClose={handleClosePopup} />
      <DataSourcesModal open={showDataSources} onClose={handleCloseDataSources} />
      
      <Box sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        <Box sx={{ 
            flex: 1, 
            position: 'relative', 
            height: '100%',
        }}>
          <APIProvider apiKey={API_KEY} libraries={['geometry']}>
            <Map
              defaultCenter={DEFAULT_COORDINATES}
              defaultZoom={4}
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              mapId={darkMode ? DARK_MAP_ID : LIGHT_MAP_ID}
              gestureHandling="greedy"
            >
              <PolygonDrawer paths={polygonPaths} comparisonPaths={comparisonPolygonPaths} />
              <ConnectionLineDrawer paths={polygonPaths} comparisonPaths={comparisonPolygonPaths} />
              <PlaceMarker 
                selectedPlace={selectedPlace} 
                demographics={demographics} 
                onClose={handleMarkerClose} 
              />
            </Map>
            <MapController 
              polygonPaths={polygonPaths} 
              comparisonPaths={comparisonPolygonPaths}
              selectedPlace={selectedPlace}
            />
          </APIProvider>
          {!isDesktop && !sidebarOpen && (
            <Button
              variant="contained"
              onClick={toggleSidebar}
              sx={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 800,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.9375rem',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                }
              }}
              startIcon={<Menu sx={{ fontSize: 20 }} />}
            >
              View Demographics
            </Button>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 999,
                borderRadius: 2,
                maxWidth: { xs: 'calc(100% - 32px)', md: 500 },
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </Box>

        <Paper
          elevation={0}
          sx={{
            display: sidebarOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 900,
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            
            ...(isDesktop ? {
              position: 'relative',
              width: 380,
              borderLeft: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: darkMode ? '-4px 0 24px 0 rgba(0, 0, 0, 0.4)' : '-4px 0 24px 0 rgba(0, 0, 0, 0.1)',
            } : {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '85vh',
              maxHeight: '85vh',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: darkMode ? '0 -4px 24px 0 rgba(0, 0, 0, 0.4)' : '0 -4px 24px 0 rgba(0, 0, 0, 0.15)',
              transition: 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 4,
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.25)',
                borderRadius: 2,
                zIndex: 1,
              }
            })
          }}
        >
          <SearchHeader
            darkMode={darkMode}
            isDesktop={isDesktop}
            inputZip={inputZip}
            loading={loading || aiLoading}
            onInputChange={setInputZip}
            onSearch={handleSearch}
            onUseMyLocation={handleUseMyLocation}
            onToggleTheme={toggleTheme}
            onShowIntro={handleShowIntro}
            onShowDataSources={handleShowDataSources}
            onClose={!isDesktop ? toggleSidebar : undefined}
          />
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            p: { xs: 2, md: 2.5 },
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)',
              }
            }
          }}>
            <DemographicsContent
              loading={loading}
              demographics={demographics}
              aiData={aiData}
              aiLoading={aiLoading}
              zipCode={zipCode}
              cities={cities}
              darkMode={darkMode}
              onShowOnMap={handleShowOnMap}
              places={places}
              placesLoading={placesLoading}
              placesError={placesError}
              onSelectPlace={handleSelectPlace}
              onGetAiInsights={handleGetAiInsights}
              onCancelAiRequest={handleCancelAiRequest}
            />
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;