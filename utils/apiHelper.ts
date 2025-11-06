import { DoppelgangerApiResponse } from './types';

// Secure "front door" (the API Gateway).
// Load from environment variable for security
const DOPPELGANGER_API_ENDPOINT = import.meta.env.VITE_API_GATEWAY_URL || 
  "https://doppelganger-gateway-wmo7fuo.uc.gateway.dev/find-twin";

// API Gateway API Key - must be set via environment variable
// This key is used to authenticate with the API Gateway
const GATEWAY_API_KEY = import.meta.env.VITE_API_GATEWAY_KEY || "";

if (!GATEWAY_API_KEY) {
  console.warn("⚠️ VITE_API_GATEWAY_KEY is not set. API requests will fail.");
}

/**
 * Fetches all demographic, profile, and doppelganger data 
 * from the new backend service with a single network request.
 * * @param zipCode The 5-digit ZIP code to analyze.
 * @param signal The AbortSignal to allow for request cancellation.
 * @returns A Promise that resolves to the complete data object.
 */
export async function getDoppelgangerData(zipCode: string, signal?: AbortSignal): Promise<DoppelgangerApiResponse> {
  console.log(`Sending request for ZIP ${zipCode} to new API Gateway...`);

  try {
    const response = await fetch(DOPPELGANGER_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 3. This is the NEW, required header for the secure gateway
        'x-api-key': GATEWAY_API_KEY
      },
      // The backend only needs the zip code.
      body: JSON.stringify({
        zip_code: zipCode 
      }),
      signal, // Pass the signal to the fetch request
    });

    if (!response.ok) {
      // Pass along any errors from the backend (e.g., "ZIP not found")
      const errorData = await response.json();
      console.error('Backend API Error:', errorData.error);
      throw new Error(errorData.error || 'Failed to fetch data from API');
    }

    const data = await response.json();
    
    console.log("Success! Received all data from backend:", data);
    return data;

  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Fetch request was cancelled by the user.');
    } else {
      console.error('Network or fetch error:', error);
    }
    throw error;
  }
}

// --- Client-Side Geolocation Helpers ---

// Mountain View, CA coordinates (default), used when geolocation fails or is denied.
const DEFAULT_LAT = 37.4056;
const DEFAULT_LNG = -122.0775;

/**
 * Gets the user's current position via the browser's Geolocation API.
 * @returns Promise<{ lat: number; lng: number }>
 */
async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser. Using default location.");
            resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG }),
            { timeout: 5000 }
        );
    });
}

/**
 * Geocodes coordinates to a ZIP code using Google's Geocoding API.
 * @param apiKey - Unrestricted Google Cloud API key for web services.
 * @param lat - Optional latitude.
 * @param lng - Optional longitude.
 * @returns Promise<string | null> - The found ZIP code or null.
 */
export async function geocodeToZipCode(
  apiKey: string,
  lat?: number,
  lng?: number
): Promise<string | null> {
  try {
    let coordinates = { lat, lng };
    if (lat === undefined || lng === undefined) {
        coordinates = await getCurrentPosition();
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    for (const result of data.results) {
        for (const component of result.address_components) {
            if (component.types.includes('postal_code')) {
                const zipCode = component.long_name.split('-')[0].trim();
                if (/^\d{5}$/.test(zipCode)) {
                    return zipCode;
                }
            }
        }
    }
    return null;
  } catch (error) {
    console.error('Error geocoding coordinates to ZIP code:', error);
    throw error;
  }
}

/**
 * Geocodes a ZIP code to find associated city names using Google's Geocoding API.
 * @param apiKey - Unrestricted Google Cloud API key for web services.
 * @param zipCode - The 5-digit ZIP code.
 * @returns Promise<string[] | null> - An array of found city names or null.
 */
export async function geocodeZipToCities(
  apiKey: string,
  zipCode: string
): Promise<string[] | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    const uniqueCities = new Set<string>();
    // A single ZIP can have multiple results, especially if it covers a large area.
    for (const result of data.results) {
      // Find the "locality" (city) component in the address.
      const cityComponent = result.address_components.find((comp: any) => 
        comp.types.includes('locality')
      );
      if (cityComponent) {
        uniqueCities.add(cityComponent.long_name);
      }
    }
    
    if (uniqueCities.size > 0) {
        return Array.from(uniqueCities);
    }
    
    return null;

  } catch (error) {
    console.error(`Error geocoding ZIP ${zipCode} to cities:`, error);
    throw error; // Re-throw to be caught by the calling function
  }
}