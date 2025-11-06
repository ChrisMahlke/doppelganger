import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Collapse,
} from '@mui/material';
import { PersonPinCircle, Apartment, LocationCity, ExpandMore } from '@mui/icons-material';
import DataBar from './DataBar';
import InfoItem from './InfoItem';
// Fix: The Demographics type should be imported from utils/types.ts as censusDataHelper.ts is not a module and does not export it.
import { Demographics } from '../utils/types';
import { formatNumber, formatCurrency } from '../utils/formatters';

interface DemographicsPanelProps {
  demographics: Demographics;
  darkMode: boolean;
}

const DemographicsPanel: React.FC<DemographicsPanelProps> = ({ demographics, darkMode }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{
      backdropFilter: 'blur(10px)',
      backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Detailed Demographics
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Source: 2022 ACS 5-Year Estimates
            </Typography>
          </Box>
          <ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Demographics Content */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'primary.main', fontSize: 18 }}>
                    {React.cloneElement(<PersonPinCircle />, { color: 'primary', fontSize: 'inherit' })}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Demographics</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>Age</Typography>
                    <DataBar label="<18" value={demographics.ageUnder18} total={demographics.population} />
                    <DataBar label="18-64" value={demographics.age18to64} total={demographics.population} />
                    <DataBar label="65+" value={demographics.age65plus} total={demographics.population} />
                    <Divider sx={{ my: 0.75 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>Race</Typography>
                    <DataBar label="White" value={demographics.raceWhite} total={demographics.population} />
                    <DataBar label="Black" value={demographics.raceBlack} total={demographics.population} />
                    <DataBar label="Asian" value={demographics.raceAsian} total={demographics.population} />
                </Box>
            </Box>

            {/* Housing Content */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'primary.main', fontSize: 18 }}>
                    {React.cloneElement(<Apartment />, { color: 'primary', fontSize: 'inherit' })}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Housing</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <InfoItem label="Housing Units" value={formatNumber(demographics.housingUnits)} />
                    <InfoItem label="Median Rent" value={formatCurrency(demographics.medianRent)} />
                    <Divider sx={{ my: 0.75 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>Occupancy</Typography>
                    <DataBar label="Owner" value={demographics.ownerOccupied} total={demographics.housingUnits} />
                    <DataBar label="Renter" value={demographics.renterOccupied} total={demographics.housingUnits} />
                </Box>
            </Box>

            {/* Community Content */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'primary.main', fontSize: 18 }}>
                    {React.cloneElement(<LocationCity />, { color: 'primary', fontSize: 'inherit' })}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Community</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>Education</Typography>
                    <DataBar label="Bachelor's" value={demographics.educationBachelors} total={demographics.educationPopulation} />
                    <DataBar label="Graduate" value={demographics.educationGraduate} total={demographics.educationPopulation} />
                    <Divider sx={{ my: 0.75 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>Commute</Typography>
                    <DataBar label="Drive" value={demographics.commuteDrive} total={demographics.commuteTotal} />
                    <DataBar label="Transit" value={demographics.commutePublic} total={demographics.commuteTotal} />
                    <DataBar label="WFH" value={demographics.commuteWfh} total={demographics.commuteTotal} />
                </Box>
            </Box>

          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default DemographicsPanel;