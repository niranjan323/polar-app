import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ContentArea({
  activeTab,
  parameters,
  setParameters,
  vesselInfo,
  parameterBounds,
  representativeDrafts,
  displayMode,
  setDisplayMode,
  directionMode,
  setDirectionMode,
  controlFileLoaded
}) {
  
  if (activeTab === 'project') {
    return (
      <Paper sx={{ 
        height: '100%', 
        p: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'white'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Welcome to Polar Response Visualization
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please select a project folder and load the control file to begin.
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Validation functions
  const isInRange = (value, min, max) => value >= min && value <= max;
  
  const validators = {
    draftAftPeak: () => isInRange(parameters.draftAftPeak, 0, 30),
    draftForePeak: () => isInRange(parameters.draftForePeak, 0, 30),
    gm: () => parameterBounds ? isInRange(parameters.gm, parameterBounds.gmLower, parameterBounds.gmUpper) : true,
    heading: () => isInRange(parameters.heading, 0, 360),
    speed: () => isInRange(parameters.speed, 0, 30),
    maxRollAngle: () => isInRange(parameters.maxRollAngle, 0, 30),
    hs: () => parameterBounds ? isInRange(parameters.hs, parameterBounds.hsLower, parameterBounds.hsUpper) : true,
    tz: () => parameterBounds ? isInRange(parameters.tz, parameterBounds.tzLower, parameterBounds.tzUpper) : true,
    waveDirection: () => isInRange(parameters.waveDirection, 0, 360),
  };

  const handleChange = (field, value) => {
    setParameters({ ...parameters, [field]: value });
  };

  const ValidationIcon = ({ isValid }) => (
    isValid ? 
      <CheckCircleIcon sx={{ color: '#2ecc71', fontSize: 22 }} /> : 
      <CancelIcon sx={{ color: '#e74c3c', fontSize: 22 }} />
  );

  const InputField = ({ label, field, step, helperText }) => {
    const isValid = validators[field]();
    
    return (
      <TextField
        fullWidth
        size="small"
        label={label}
        type="number"
        value={parameters[field]}
        onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
        inputProps={{ step }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isValid ? '#2ecc71' : '#e74c3c',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: isValid ? '#27ae60' : '#c0392b',
            },
            '&.Mui-focused fieldset': {
              borderColor: isValid ? '#2ecc71' : '#e74c3c',
            }
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <ValidationIcon isValid={isValid} />
            </InputAdornment>
          ),
        }}
        helperText={helperText}
        FormHelperTextProps={{
          sx: { fontSize: '0.7rem', color: 'text.secondary' }
        }}
      />
    );
  };

  return (
    <Paper sx={{ 
      height: '100%', 
      overflow: 'auto', 
      bgcolor: 'white',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }}>
      {/* Simple Header - NO blue background */}
      <Box sx={{ 
        px: 2.5, 
        py: 1.5, 
        borderBottom: '1px solid #e0e0e0',
        bgcolor: '#fafafa'
      }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
          Vessel Operation Conditions
        </Typography>
        {vesselInfo && (
          <Typography variant="caption" color="text.secondary">
            IMO: {vesselInfo.imo}
          </Typography>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <Grid container spacing={1.5}>
          {/* Draft Category */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Draft Category</InputLabel>
              <Select
                value={parameters.draft}
                onChange={(e) => handleChange('draft', e.target.value)}
                label="Draft Category"
              >
                <MenuItem value="scantling">Scantling</MenuItem>
                <MenuItem value="design">Design</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {representativeDrafts && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                S:{representativeDrafts.scantling.toFixed(0)}m / 
                D:{representativeDrafts.design.toFixed(0)}m / 
                I:{representativeDrafts.intermediate.toFixed(0)}m
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <InputField 
              label="Draft Aft Peak (m)" 
              field="draftAftPeak" 
              step={0.1}
              helperText="value range [0, 30]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Draft Fore Peak (m)" 
              field="draftForePeak" 
              step={0.1}
              helperText="value range [0, 30]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="GM (m)" 
              field="gm" 
              step={0.5}
              helperText={parameterBounds ? 
                `value range [${parameterBounds.gmLower}, ${parameterBounds.gmUpper}]` : 
                'Loading...'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Heading (degree)" 
              field="heading" 
              step={1}
              helperText="Clockwise from North to Bow [0, 360]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Speed (kn)" 
              field="speed" 
              step={0.5}
              helperText="value range [0, 30]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Max Roll Angle (degree)" 
              field="maxRollAngle" 
              step={1}
              helperText="value range [0, 30]"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Sea State */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Sea State
        </Typography>

        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <InputField 
              label="Hs (m)" 
              field="hs" 
              step={0.5}
              helperText={parameterBounds ? 
                `value range [${parameterBounds.hsLower}, ${parameterBounds.hsUpper}]` : 
                'Loading...'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Wave Period Type</InputLabel>
              <Select
                value={parameters.wavePeriodType}
                onChange={(e) => handleChange('wavePeriodType', e.target.value)}
                label="Wave Period Type"
              >
                <MenuItem value="tz">Zero Up-crossing, Tz (s)</MenuItem>
                <MenuItem value="tp_pierson">Peak – Pierson-Moskowitz, Tp (s)</MenuItem>
                <MenuItem value="tm_pierson">Mean – Pierson-Moskowitz, Tm (s)</MenuItem>
                <MenuItem value="tp_jonswap">Peak – JONSWAP, Tp (s)</MenuItem>
                <MenuItem value="tm_jonswap">Mean – JONSWAP, Tm (s)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Tz (s)" 
              field="tz" 
              step={0.5}
              helperText={parameterBounds ? 
                `value range [${parameterBounds.tzLower}, ${parameterBounds.tzUpper}]` : 
                'Loading...'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Wave Direction (degree)" 
              field="waveDirection" 
              step={1}
              helperText="value range [0, 360]"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Display Options */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Display Options
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 1.5 }}>
          <FormLabel component="legend" sx={{ fontSize: '0.85rem' }}>Plot Mode</FormLabel>
          <RadioGroup
            row
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
          >
            <FormControlLabel value="continuous" control={<Radio size="small" />} label="Continuous" />
            <FormControlLabel value="trafficlight" control={<Radio size="small" />} label="Traffic Light" />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ fontSize: '0.85rem' }}>Direction</FormLabel>
          <RadioGroup
            row
            value={directionMode}
            onChange={(e) => setDirectionMode(e.target.value)}
          >
            <FormControlLabel value="northup" control={<Radio size="small" />} label="North Up" />
            <FormControlLabel value="headsup" control={<Radio size="small" />} label="Heads Up" />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Parameter Summary */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Case Files
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Draft: <strong>{parameters.draft}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            GM: <strong>{parameters.gm}m</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Hs: <strong>{parameters.hs}m</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Tp: <strong>{parameters.tz}s</strong>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}