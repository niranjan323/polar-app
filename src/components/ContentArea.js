import React, { useState } from 'react';
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
  Grid,
  Button,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

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
  controlFileLoaded,
  savedCases = [],
  setSavedCases = () => {},
  selectedCase = null,
  setSelectedCase = () => {}
}) {
  const [caseId, setCaseId] = useState('');
  const [caseToDelete, setCaseToDelete] = useState('');
  
  if (activeTab === 'project') {
    return (
      <Paper sx={{ 
        height: '100%', 
        p: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '2px'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
            Welcome to Polar Response Visualization
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.9rem' }}>
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
      <CheckCircleIcon sx={{ color: '#2ecc71', fontSize: 20 }} /> : 
      <CancelIcon sx={{ color: '#e74c3c', fontSize: 20 }} />
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
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: isValid ? '#27ae60' : '#c0392b',
            },
            '&.Mui-focused fieldset': {
              borderColor: isValid ? '#2ecc71' : '#e74c3c',
              borderWidth: '1.5px',
            }
          },
          '& .MuiInputBase-root': {
            fontSize: '0.9rem'
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
          sx: { fontSize: '0.75rem', color: 'text.secondary' }
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
      minHeight: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderRadius: '2px'
    }}>
      {/* Header */}
      <Box sx={{ 
        px: 1.5, 
        py: 1.2, 
        borderBottom: '2px solid #d0d0d0',
        bgcolor: '#f5f5f5',
        flexShrink: 0
      }}>
        <Box sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e4976', mb: 0.3 }}>
          Vessel Operation Conditions
        </Box>
        {vesselInfo && (
          <Box sx={{ fontSize: '0.75rem', color: '#999' }}>
            IMO: {vesselInfo.imo}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <Grid container spacing={1.2}>
          {/* Draft Category */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.9rem' }}>Draft Category</InputLabel>
              <Select
                value={parameters.draft}
                onChange={(e) => handleChange('draft', e.target.value)}
                label="Draft Category"
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="scantling">Scantling</MenuItem>
                <MenuItem value="design">Design</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {representativeDrafts && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
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
              helperText="[0, 30]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Draft Fore Peak (m)" 
              field="draftForePeak" 
              step={0.1}
              helperText="[0, 30]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="GM (m)" 
              field="gm" 
              step={0.5}
              helperText={parameterBounds ? 
                `[${parameterBounds.gmLower}, ${parameterBounds.gmUpper}]` : 
                'Loading...'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Heading (degree)" 
              field="heading" 
              step={1}
              helperText="[0, 360]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Speed (kn)" 
              field="speed" 
              step={0.5}
              helperText="[0, 30]"
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Max Roll Angle (degree)" 
              field="maxRollAngle" 
              step={1}
              helperText="[0, 30]"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Sea State */}
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e4976' }}>
          Sea State
        </Typography>

        <Grid container spacing={1.2}>
          <Grid item xs={12}>
            <InputField 
              label="Hs (m)" 
              field="hs" 
              step={0.5}
              helperText={parameterBounds ? 
                `[${parameterBounds.hsLower}, ${parameterBounds.hsUpper}]` : 
                'Loading...'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.9rem' }}>Wave Period Type</InputLabel>
              <Select
                value={parameters.wavePeriodType}
                onChange={(e) => handleChange('wavePeriodType', e.target.value)}
                label="Wave Period Type"
                sx={{ fontSize: '0.9rem' }}
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
                `[${parameterBounds.tzLower}, ${parameterBounds.tzUpper}]` : 
                'Loading...'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <InputField 
              label="Wave Direction (degree)" 
              field="waveDirection" 
              step={1}
              helperText="[0, 360]"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Display Options */}
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e4976' }}>
          Display Options
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 1.5 }}>
          <FormLabel component="legend" sx={{ fontSize: '0.85rem', color: '#333' }}>Plot Mode</FormLabel>
          <RadioGroup
            row
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
          >
            <FormControlLabel 
              value="continuous" 
              control={<Radio size="small" />} 
              label={<Typography sx={{ fontSize: '0.85rem' }}>Continuous</Typography>}
            />
            <FormControlLabel 
              value="trafficlight" 
              control={<Radio size="small" />} 
              label={<Typography sx={{ fontSize: '0.85rem' }}>Traffic Light</Typography>}
            />
          </RadioGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ fontSize: '0.85rem', color: '#333' }}>Direction</FormLabel>
          <RadioGroup
            row
            value={directionMode}
            onChange={(e) => setDirectionMode(e.target.value)}
          >
            <FormControlLabel 
              value="northup" 
              control={<Radio size="small" />} 
              label={<Typography sx={{ fontSize: '0.85rem' }}>North Up</Typography>}
            />
            <FormControlLabel 
              value="headsup" 
              control={<Radio size="small" />} 
              label={<Typography sx={{ fontSize: '0.85rem' }}>Heads Up</Typography>}
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Case Files Section - Only show in User Data Input tab */}
        {activeTab === 'userdata' && (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e4976' }}>
              Case Files
            </Typography>

            {/* Save to Case ID Input */}
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5, color: '#333' }}>
                Save to case ID
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter case ID"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  sx={{ fontSize: '0.9rem' }}
                />
                <IconButton
                  size="small"
                  sx={{ color: '#2ecc71' }}
                  onClick={() => {
                    if (caseId.trim()) {
                      const newCase = {
                        id: caseId,
                        draft: parameters.draft,
                        gm: parameters.gm,
                        hs: parameters.hs,
                        tz: parameters.tz,
                        heading: parameters.heading,
                        speed: parameters.speed,
                        waveDirection: parameters.waveDirection,
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setSavedCases([...savedCases, newCase]);
                      setCaseId('');
                    }
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Delete Saved Case Dropdown */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5, color: '#333' }}>
                Delete saved case
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={caseToDelete}
                    onChange={(e) => setCaseToDelete(e.target.value)}
                    displayEmpty
                    sx={{ fontSize: '0.9rem' }}
                  >
                    <MenuItem value="" disabled>
                      Select case to delete
                    </MenuItem>
                    {savedCases.map((caseItem) => (
                      <MenuItem key={caseItem.id} value={caseItem.id}>
                        {caseItem.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  size="small"
                  disabled={!caseToDelete}
                  sx={{ 
                    color: '#e74c3c',
                    '&:disabled': { color: '#ccc' }
                  }}
                  onClick={() => {
                    if (caseToDelete) {
                      setSavedCases(savedCases.filter(c => c.id !== caseToDelete));
                      if (selectedCase?.id === caseToDelete) {
                        setSelectedCase(null);
                      }
                      setCaseToDelete('');
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Box>
    </Paper>
  );
}