export interface LatLngLiteral {
  lat: number;
  lng: number;
}

// GeoJSON interfaces for clarity
interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: any;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Converts GeoJSON coordinates to Google Maps LatLngLiteral format.
 * Handles both Polygon and MultiPolygon types.
 * @param geometry - The GeoJSON geometry object.
 * @returns An array of polygon rings compatible with google.maps.Polygon.
 */
function convertGeoJsonToGoogleMapsPaths(geometry: GeoJSONFeature['geometry']): LatLngLiteral[][] {
  const { type, coordinates } = geometry;
  const paths: LatLngLiteral[][] = [];

  if (type === 'Polygon') {
    // coordinates is an array of rings: [ [lng, lat], [lng, lat], ... ]
    (coordinates as number[][][]).forEach(ring => {
      const path = ring.map(([lng, lat]) => ({ lat, lng }));
      paths.push(path);
    });
  } else if (type === 'MultiPolygon') {
    // coordinates is an array of polygons, each polygon is an array of rings
    (coordinates as number[][][][]).forEach(polygon => {
      polygon.forEach(ring => {
        const path = ring.map(([lng, lat]) => ({ lat, lng }));
        paths.push(path);
      });
    });
  }

  return paths;
}

/**
 * Fetches the geographic boundary for a given ZIP code from the US Census Bureau's TIGERweb API.
 * @param zipCode - The 5-digit ZIP code.
 * @returns A promise that resolves to an array of polygon paths for Google Maps.
 * @throws An error if the API request fails or no boundary is found.
 */
export async function fetchZipCodeBoundary(zipCode: string): Promise<LatLngLiteral[][]> {
  const url = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/11/query?where=ZCTA5%3D'${zipCode}'&outFields=*&f=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Census TIGERweb API error: ${response.status}`);
    }

    const data: GeoJSONFeatureCollection = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error(`No boundary data found for ZIP code ${zipCode}.`);
    }
    
    // Assuming the first feature is the correct one
    const feature = data.features[0];
    return convertGeoJsonToGoogleMapsPaths(feature.geometry);

  } catch (error) {
    console.error('Error fetching ZIP code boundary:', error);
    throw error;
  }
}
