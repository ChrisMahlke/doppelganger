import React, { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { useTheme } from '@mui/material/styles';
import { LatLngLiteral } from '../utils/censusBoundaryHelper';

interface ConnectionLineDrawerProps {
  paths: LatLngLiteral[][] | null;
  comparisonPaths: LatLngLiteral[][] | null;
}

// Helper function to calculate the centroid of a set of polygons.
// FIX: Changed return type from `google.maps.LatLng` to `any` to avoid TypeScript error.
const getCentroid = (paths: LatLngLiteral[][]): any | null => {
  if (!paths || paths.length === 0) return null;

  let latSum = 0;
  let lngSum = 0;
  let pointCount = 0;

  paths.forEach(ring => {
    ring.forEach(point => {
      latSum += point.lat;
      lngSum += point.lng;
      pointCount++;
    });
  });

  if (pointCount === 0) return null;

  return new (window as any).google.maps.LatLng(latSum / pointCount, lngSum / pointCount);
};

const ConnectionLineDrawer: React.FC<ConnectionLineDrawerProps> = ({ paths, comparisonPaths }) => {
  const map = useMap();
  const theme = useTheme();

  useEffect(() => {
    if (!map || !paths || !comparisonPaths) return;
  
    const mainCentroid = getCentroid(paths);
    const comparisonCentroid = getCentroid(comparisonPaths);
  
    if (!mainCentroid || !comparisonCentroid) return;

    const line = new (window as any).google.maps.Polyline({
      path: [mainCentroid, comparisonCentroid],
      geodesic: true,
      strokeColor: theme.palette.info.main,
      strokeOpacity: 0,
      icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 3,
          strokeColor: theme.palette.info.main,
        },
        offset: '0',
        repeat: '15px',
      }],
    });
    
    line.setMap(map);
  
    return () => {
      line.setMap(null);
    };
  
  }, [map, paths, comparisonPaths, theme.palette.info.main]);

  return null;
};

export default ConnectionLineDrawer;