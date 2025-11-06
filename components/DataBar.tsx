import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { formatNumber, formatPercent } from '../utils/formatters';

interface DataBarProps {
  label: string;
  value: number;
  total: number;
}

const DataBar: React.FC<DataBarProps> = ({ label, value, total }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body1">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatNumber(value)} ({formatPercent(percentage)})
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

export default DataBar;

