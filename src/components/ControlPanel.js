import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ControlPanel({
  parameters,
  setParameters,
  vesselInfo,
  parameterBounds,
  displayMode,
  directionMode,
  onDisplayModeChange,
  onDirectionModeChange,
  onLoadData,
  onSaveCase,
  onExportReport,
  loading,
  hasData,
  savedCases,
  currentCaseIndex,
  onLoadCase,
  onDeleteCase,
  controlFileLoaded
}) {
  
  const handleChange = (field) => (event) => {
    setParameters({
      ...parameters,
      [field]: event.target.value
    });
  };

  const handleNumberChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setParameters({
      ...parameters,
      [field]: value
    });
  };

  return (
    <Box sx={{ 
      height: '100%', 
      overflowY: 'auto',
      overflowX: 'hidden',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#2a2a2a',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#555',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#777',
      },
      pb: 2
    }}>
      <Card sx={{ mb: 2 }}>
        <CardHeader 
          title="Vessel Operation Conditions"
          subheader={vesselInfo ? `IMO: ${vesselInfo.imo}` : 'No vessel loaded'}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          {/* Draft Category */}
          <FormControl fullWidth margin="normal" size="small">
            <FormLabel>Draft Category</FormLabel>
            <Select
              value={parameters.draft}
              onChange={handleChange('draft')}
            >
              <MenuItem value="scantling">Scantling</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
            </Select>
          </FormControl>

          {/* Draft Aft Peak */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Draft Aft Peak (m)"
            type="number"
            value={parameters.draftAftPeak}
            onChange={handleNumberChange('draftAftPeak')}
            inputProps={{ step: 0.1, min: 0, max: 30 }}
          />

          {/* Draft Fore Peak */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Draft Fore Peak (m)"
            type="number"
            value={parameters.draftForePeak}
            onChange={handleNumberChange('draftForePeak')}
            inputProps={{ step: 0.1, min: 0, max: 30 }}
          />

          {/* GM */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Metacentric Height, GM (m)"
            type="number"
            value={parameters.gm}
            onChange={handleNumberChange('gm')}
            inputProps={{ 
              step: 0.5, 
              min: parameterBounds?.gmLower || 0, 
              max: parameterBounds?.gmUpper || 10 
            }}
            helperText={parameterBounds ? 
              `Range: [${parameterBounds.gmLower}, ${parameterBounds.gmUpper}]` : ''
            }
          />

          {/* Heading */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Heading (degree)"
            type="number"
            value={parameters.heading}
            onChange={handleNumberChange('heading')}
            inputProps={{ step: 1, min: 0, max: 360 }}
            helperText="Clockwise from North to Bow"
          />

          {/* Speed */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Speed (kn)"
            type="number"
            value={parameters.speed}
            onChange={handleNumberChange('speed')}
            inputProps={{ step: 0.5, min: 0, max: 30 }}
          />

          {/* Max Roll Angle */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Maximum Allowed Roll Angle (degree)"
            type="number"
            value={parameters.maxRollAngle}
            onChange={handleNumberChange('maxRollAngle')}
            inputProps={{ step: 1, min: 0, max: 30 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardHeader 
          title="Sea State"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          {/* Significant Wave Height */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Significant Wave Height, Hs (m)"
            type="number"
            value={parameters.hs}
            onChange={handleNumberChange('hs')}
            inputProps={{ 
              step: 0.5, 
              min: parameterBounds?.hsLower || 0, 
              max: parameterBounds?.hsUpper || 20 
            }}
            helperText={parameterBounds ? 
              `Range: [${parameterBounds.hsLower}, ${parameterBounds.hsUpper}]` : ''
            }
          />

          {/* Mean Wave Period */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Mean Wave Period, Tz (s)"
            type="number"
            value={parameters.tz}
            onChange={handleNumberChange('tz')}
            inputProps={{ 
              step: 0.5, 
              min: parameterBounds?.tzLower || 0, 
              max: parameterBounds?.tzUpper || 20 
            }}
            helperText={parameterBounds ? 
              `Range: [${parameterBounds.tzLower}, ${parameterBounds.tzUpper}]` : ''
            }
          />

          {/* Wave Direction */}
          <TextField
            fullWidth
            margin="normal"
            size="small"
            label="Mean Wave Direction (degree)"
            type="number"
            value={parameters.waveDirection}
            onChange={handleNumberChange('waveDirection')}
            inputProps={{ step: 1, min: 0, max: 360 }}
            helperText="Clockwise from North"
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardHeader 
          title="Display Options"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          {/* Plot Mode */}
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Plot Mode</FormLabel>
            <RadioGroup
              value={displayMode}
              onChange={(e) => onDisplayModeChange(e.target.value)}
            >
              <FormControlLabel 
                value="continuous" 
                control={<Radio size="small" />} 
                label="Continuous" 
              />
              <FormControlLabel 
                value="trafficlight" 
                control={<Radio size="small" />} 
                label="Traffic Light" 
              />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          {/* Direction Mode */}
          <FormControl component="fieldset">
            <FormLabel component="legend">Direction</FormLabel>
            <RadioGroup
              value={directionMode}
              onChange={(e) => onDirectionModeChange(e.target.value)}
            >
              <FormControlLabel 
                value="northup" 
                control={<Radio size="small" />} 
                label="North Up" 
              />
              <FormControlLabel 
                value="headsup" 
                control={<Radio size="small" />} 
                label="Heads Up" 
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        mb: 2
      }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onLoadData}
          disabled={loading || !controlFileLoaded}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Loading...' : 'Load & Render'}
        </Button>

        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={onSaveCase}
          disabled={!hasData}
        >
          Save Case
        </Button>

        <Button
          variant="contained"
          color="info"
          fullWidth
          onClick={onExportReport}
          disabled={!hasData}
        >
          Generate Report
        </Button>
      </Box>

      {/* Saved Cases */}
      {savedCases.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardHeader 
            title="Saved Cases"
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent sx={{ p: 0 }}>
            <List dense>
              {savedCases.map((savedCase, index) => (
                <ListItem
                  key={index}
                  selected={currentCaseIndex === index}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => onDeleteCase(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  disablePadding
                >
                  <ListItemButton onClick={() => onLoadCase(index)}>
                    <ListItemText 
                      primary={savedCase.id}
                      secondary={`GM: ${savedCase.parameters.gm}m, Hs: ${savedCase.parameters.hs}m`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}