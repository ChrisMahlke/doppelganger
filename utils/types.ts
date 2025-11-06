/**
 * Raw demographic data from the U.S. Census.
 */
export interface Demographics {
  name: string;
  population: number;
  medianIncome: number;
  medianAge: number;
  raceWhite: number;
  raceBlack: number;
  raceNative: number;
  raceAsian: number;
  educationPopulation: number;
  educationBachelors: number;
  educationGraduate: number;
  medianHomeValue: number;
  medianRent: number;
  housingUnits: number;
  ownerOccupied: number;
  renterOccupied: number;
  zipCode: string;
  ageUnder18: number;
  age18to64: number;
  age65plus: number;
  commuteTotal: number;
  commuteDrive: number;
  commutePublic: number;
  commuteWfh: number;
}

/**
 * The AI-generated profile from Gemini.
 */
export interface Profile {
  whoAreWe: string;
  ourNeighborhood: string[];
  socioeconomicTraits: string[];
}

/**
 * A single "doppelgänger" ZIP code match.
 */
export interface Doppelganger {
    zipCode: string;
    city: string;
    state: string;
    similarityReason: string;
    similarityPercentage: number;
}

/**
 * The unified API response structure from the backend service.
 */
export interface DoppelgangerApiResponse {
  // This contains all three parts, but the backend service might only return profile and doppelgangers.
  // For the purpose of the call to getDoppelgangerData, we expect the profile and doppelgangers.
  demographics: Demographics;
  profile: Profile;
  doppelgangers: Doppelganger[];
}