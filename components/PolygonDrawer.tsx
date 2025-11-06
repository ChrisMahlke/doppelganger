import React, { useEffect } from 'react';
// Fix: The `useTheme` hook for Material-UI should be imported from '@mui/material/styles'.
import { useTheme } from '@mui/material/styles';
import { useMap } from '@vis.gl/react-google-maps';
import { LatLngLiteral } from '../utils/censusBoundaryHelper';

interface PolygonDrawerProps {
  paths: LatLngLiteral[][] | null;
  comparisonPaths?: LatLngLiteral[][] | null;
}

const PolygonDrawer: React.FC<PolygonDrawerProps> = ({ paths, comparisonPaths }) => {
  const map = useMap();
  const muiTheme = useTheme();

  // Effect for the primary polygon
  useEffect(() => {
    if (!map || !paths || paths.length === 0) return;

    const polygon = new (window as any).google.maps.Polygon({
      paths: paths,
      strokeColor: muiTheme.palette.primary.main,
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: muiTheme.palette.primary.main,
      fillOpacity: 0.25,
    });

    polygon.setMap(map);

    return () => {
      polygon.setMap(null);
    };
  }, [map, paths, muiTheme.palette.primary.main]);
  
  // Effect for the single comparison polygon
  useEffect(() => {
    if (!map || !comparisonPaths || comparisonPaths.length === 0) return;

    const comparisonPolygon = new (window as any).google.maps.Polygon({
        paths: comparisonPaths,
        strokeColor: muiTheme.palette.secondary.main,
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: muiTheme.palette.secondary.main,
        fillOpacity: 0.35,
    });

    comparisonPolygon.setMap(map);

    return () => {
        comparisonPolygon.setMap(null);
    };
  }, [map, comparisonPaths, muiTheme.palette.secondary.main]);

  return null;
};

export default PolygonDrawer;