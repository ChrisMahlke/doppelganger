import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Public } from '@mui/icons-material';
import { keyframes } from '@emotion/react';

interface LoadingFactsCardProps {
  darkMode: boolean;
  onCancel: () => void;
}

const FACTS = [
  "The U.S. Census Bureau has been conducting the national census every 10 years since 1790.",
  "ZIP codes were introduced in 1963 to make mail delivery faster and more efficient.",
  "The most populated ZIP code in the U.S. is 77449 — located in Katy, Texas.",
  "Alaska has the lowest population density of any U.S. state — less than 2 people per square mile.",
  "The word “demographics” comes from the Greek words demos (people) and graphein (to write).",
  "In the U.S., about 82% of people live in urban areas.",
  "Hawaii is the only U.S. state that grows coffee commercially.",
  "There are over 41,000 ZIP codes across the United States.",
  "Cartography — the art and science of making maps — dates back more than 5,000 years.",
  "The geographic center of the contiguous U.S. is near Lebanon, Kansas.",
  "Over 350 languages are spoken in American homes.",
  "More than half of the world’s population now lives in cities.",
  "California alone has more people than the entire country of Canada.",
  "Rural ZIP codes cover about 97% of U.S. land area but house less than 20% of the population.",
  "The highest ZIP code number in the U.S. is 99950, in Ketchikan, Alaska.",
  "The Census Bureau’s American Community Survey updates data every year — not just every decade.",
  "Cartographers use satellite imagery, GPS, and AI to keep modern maps up to date.",
  "The population of the U.S. doubles roughly every 50–70 years.",
  "Washington, D.C., has no “counties” — it’s divided into neighborhoods instead.",
  "The average ZIP code in the U.S. contains about 7,000 to 10,000 people.",
];

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const LoadingFactsCard: React.FC<LoadingFactsCardProps> = ({ darkMode, onCancel }) => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prevIndex) => (prevIndex + 1) % FACTS.length);
    }, 5000); // Slower: Change fact every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card sx={{
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
    }}>
      <CardContent sx={{ p: 2, textAlign: 'center' }}>
        <Box sx={{
          animation: `${pulseAnimation} 2.5s ease-in-out infinite`,
          display: 'inline-block',
          mb: 1.5,
        }}>
          <Public color="primary" sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          Analyzing community data...
        </Typography>
        <Box sx={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography
            key={factIndex}
            variant="body2"
            color="text.secondary"
            sx={{
              fontStyle: 'italic',
              animation: 'fadeInOut 5s ease-in-out infinite' // Slower: Match interval
            }}
          >
            {FACTS[factIndex]}
          </Typography>
        </Box>
        <Button
          onClick={onCancel}
          size="small"
          sx={{
            mt: 1.5,
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }
          }}
        >
          Cancel
        </Button>
        <style>
          {`
            @keyframes fadeInOut {
              0% { opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}
        </style>
      </CardContent>
    </Card>
  );
};

export default LoadingFactsCard;