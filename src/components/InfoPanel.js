import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider
} from '@mui/material';

export default function InfoPanel({ loadedData, parameters }) {
  if (!loadedData || !loadedData.success) {
    return (
      <Card>
        <CardHeader 
          title="Polar Diagram Info"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No data loaded
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Card sx={{ mb: 2 }}>
        <CardHeader 
          title="Polar Diagram Closest to Request"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Draft Category
              </Typography>
              <Typography variant="body1">
                {parameters.draft}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Metacentric Height (GM)
              </Typography>
              <Typography variant="body1">
                {loadedData.fittedGM.toFixed(1)} m
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Significant Wave Height (Hs)
              </Typography>
              <Typography variant="body1">
                {loadedData.fittedHs.toFixed(1)} m
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Mean Wave Period (Tz)
              </Typography>
              <Typography variant="body1">
                {loadedData.fittedTz.toFixed(1)} s
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardHeader 
          title="Data Statistics"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Number of Speeds
              </Typography>
              <Typography variant="body1">
                {loadedData.data.numSpeeds}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Number of Headings
              </Typography>
              <Typography variant="body1">
                {loadedData.data.numHeadings}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Speed Range
              </Typography>
              <Typography variant="body1">
                {Math.min(...loadedData.data.speeds).toFixed(1)} - {Math.max(...loadedData.data.speeds).toFixed(1)} kn
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Max Roll Angle in Data
              </Typography>
              <Typography variant="body1">
                {Math.max(...loadedData.data.rollMatrix.flat()).toFixed(1)}°
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}