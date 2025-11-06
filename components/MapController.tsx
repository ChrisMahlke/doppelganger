import React, { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { LatLngLiteral } from '../utils/censusBoundaryHelper';
import { Place } from '../utils/placesHelper';

interface MapControllerProps {
  polygonPaths: LatLngLiteral[][] | null;
  comparisonPaths?: LatLngLiteral[][] | null;
  selectedPlace?: Place | null;
}

const MapController: React.FC<MapControllerProps> = ({ polygonPaths, comparisonPaths, selectedPlace }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || (!polygonPaths && !comparisonPaths)) return;
    if (selectedPlace) return; // Don't refit bounds if a place is selected, let the place zoom take priority

    const bounds = new (window as any).google.maps.LatLngBounds();
    
    if (polygonPaths && polygonPaths.length > 0) {
      polygonPaths.forEach(ring => {
        ring.forEach(latLng => {
          bounds.extend(latLng);
        });
      });
    }

    if (comparisonPaths && comparisonPaths.length > 0) {
        comparisonPaths.forEach(ring => {
            ring.forEach(latLng => {
                bounds.extend(latLng);
            });
        });
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 50); // Add 50px padding
    }
  }, [map, polygonPaths, comparisonPaths, selectedPlace]);
  
  useEffect(() => {
    if (!map || !selectedPlace) return;
    
    map.panTo({
      lat: selectedPlace.location.latitude,
      lng: selectedPlace.location.longitude
    });
    map.setZoom(15);
  }, [map, selectedPlace]);

  return null;
};

export default MapController;