import React from 'react';
import { Box, Typography } from '@mui/material';

interface InfoItemProps {
  label: string;
  value: string | number;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="subtitle1" color="text.primary">{value}</Typography>
  </Box>
);

export default InfoItem;

