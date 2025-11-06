import { LatLngLiteral } from './censusBoundaryHelper';

/**
 * Defines the structure for a place returned by the Google Places API (New).
 */
export interface Place {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  rating?: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface PlacesAPIResponse {
  places: Place[];
}

/**
 * Searches for points of interest within a given geographic boundary using the Google Places API (New).
 * @param polygonPaths - The geographic boundary of the search area.
 * @param zipCode - The ZIP code, used as a search query.
 * @param apiKey - Unrestricted Google Cloud API key for web services.
 * @returns A promise that resolves to an array of found places.
 */
export async function searchPlaces(
  polygonPaths: LatLngLiteral[][],
  zipCode: string,
  apiKey: string
): Promise<Place[]> {
  const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

  if (!polygonPaths || polygonPaths.length === 0 || polygonPaths[0].length === 0) {
    return [];
  }
  
  // Calculate the bounding box for the location restriction as a rectangle.
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  polygonPaths.forEach(ring => {
      ring.forEach(point => {
          if (point.lat < minLat) minLat = point.lat;
          if (point.lat > maxLat) maxLat = point.lat;
          if (point.lng < minLng) minLng = point.lng;
          if (point.lng > maxLng) maxLng = point.lng;
      });
  });

  const requestBody = {
    textQuery: `popular places in ${zipCode}`,
    locationRestriction: {
      rectangle: {
        low: {
          latitude: minLat,
          longitude: minLng,
        },
        high: {
          latitude: maxLat,
          longitude: maxLng,
        },
      },
    },
    maxResultCount: 10,
    // rankPreference: 'POPULARITY' is invalid for searchText. 'RELEVANCE' is the default.
  };

  try {
    const response = await fetch(PLACES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // FieldMask to specify which fields to return
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.location',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('Places API Error:', errorBody);
        throw new Error(`Places API request failed with status ${response.status}: ${errorBody.error?.message || 'Unknown error'}`);
    }

    const data: PlacesAPIResponse = await response.json();
    return data.places || []; // Return an empty array if no places are found
    
  } catch (error) {
    console.error('Error fetching data from Places API:', error);
    throw error;
  }
}