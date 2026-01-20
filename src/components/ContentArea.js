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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Button,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ContentArea({
  activeTab,
  setActiveTab,
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
        borderRadius: '8px'
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

  const InputFieldRow = ({ label, field, step, unit, helper }) => {
    const isValid = validators[field]();
    
    return (
      <Box sx={{ 
        py: 1.2,
        px: 2,
        '&:last-child': {
          borderBottom: 'none'
        }
      }}>
        {/* Main Row */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 0.5
        }}>
          {/* Label */}
          <Typography sx={{ 
            fontSize: '0.9rem', 
            color: '#666',
            fontWeight: 400,
            minWidth: '140px'
          }}>
            {label}
          </Typography>

          {/* Validation Icon */}
          <ValidationIcon isValid={isValid} />

          {/* Input Field Container */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            position: 'relative'
          }}>
            <TextField
              type="number"
              value={parameters[field]}
              onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
              inputProps={{ step, style: { textAlign: 'center', paddingRight: '50px' } }}
              size="small"
              sx={{
                flex: 1,
                maxWidth: '280px',
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  borderRadius: '6px',
                  '& fieldset': {
                    borderColor: '#ccc',
                    borderWidth: '1.5px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#999',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2196f3',
                    borderWidth: '1.5px',
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '1rem',
                  padding: '8px 12px',
                  color: '#2196f3',
                  fontWeight: 500
                }
              }}
            />
            
            {/* Unit - Positioned inside input field on the right */}
            <Typography sx={{ 
              fontSize: '0.75rem', 
              color: '#ccc',
              position: 'absolute',
              right: '12px',
              fontWeight: 400,
              pointerEvents: 'none'
            }}>
              {unit}
            </Typography>
          </Box>
        </Box>

        {/* Helper Text */}
        <Typography sx={{ 
          fontSize: '0.7rem', 
          color: '#999',
          ml: 'auto',
          mr: 0,
          textAlign: 'right',
          mt: 0.5
        }}>
          {helper}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper sx={{ 
      height: '100%', 
      overflow: 'hidden',
      bgcolor: 'white',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }}>
      {/* Tab Buttons Header */}
      <Box sx={{ 
        px: 2, 
        py: 1.5,
        borderBottom: '1px solid #e8e8e8',
        bgcolor: '#f8f8f8',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}>
        <Button
          onClick={() => setActiveTab('project')}
          sx={{
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'project' ? 600 : 400,
            color: activeTab === 'project' ? '#333' : '#999',
            padding: 0,
            '&:hover': {
              backgroundColor: 'transparent'
            },
            borderBottom: activeTab === 'project' ? '3px solid #2196f3' : 'none',
            paddingBottom: 0.5
          }}
        >
          Project
        </Button>
        <Button
          onClick={() => setActiveTab('userdata')}
          sx={{
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'userdata' ? 600 : 400,
            color: activeTab === 'userdata' ? '#2196f3' : '#999',
            padding: 0,
            '&:hover': {
              backgroundColor: 'transparent'
            },
            borderBottom: activeTab === 'userdata' ? '3px solid #2196f3' : 'none',
            paddingBottom: 0.5
          }}
        >
          User Data Input
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        
        {/* Vessel Operation Conditions Title */}
        <Typography sx={{ 
          fontSize: '0.95rem', 
          fontWeight: 600, 
          color: '#333',
          px: 2,
          pt: 2,
          pb: 1
        }}>
          Vessel Operation Conditions
        </Typography>

        {/* Vessel Operation Fields Container */}
        <Box sx={{
          mx: 2,
          mb: 2.5,
          border: '1px solid #ddd',
          borderRadius: '6px',
          overflow: 'hidden',
          bgcolor: '#fafafa'
        }}>
          <InputFieldRow 
            label="Draft Aft Peak" 
            field="draftAftPeak" 
            step={0.1}
            unit="[m]"
            helper="value range [000, 000]"
          />

          <InputFieldRow 
            label="Draft Fore Peak" 
            field="draftForePeak" 
            step={0.1}
            unit="[m]"
            helper="value range [000, 000]"
          />

          <InputFieldRow 
            label="GM" 
            field="gm" 
            step={0.5}
            unit="[m]"
            helper={parameterBounds ? `value range [${parameterBounds.gmLower}, ${parameterBounds.gmUpper}]` : "value range [000, 000]"}
          />

          <InputFieldRow 
            label="Heading" 
            field="heading" 
            step={1}
            unit="[degree]"
            helper="Clockwise from the North to the Bow - value range [0, 360]"
          />

          <InputFieldRow 
            label="Speed" 
            field="speed" 
            step={0.5}
            unit="[kn]"
            helper="value range [000, 000]"
          />

          <InputFieldRow 
            label="Max Allowed Roll" 
            field="maxRollAngle" 
            step={1}
            unit="[degree]"
            helper="value range [000, 000]"
          />
        </Box>

        {/* Draft Category */}
        <Box sx={{ px: 2, mb: 2.5 }}>
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
        </Box>

        {representativeDrafts && (
          <Box sx={{ px: 2, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
              S:{representativeDrafts.scantling.toFixed(0)}m / 
              D:{representativeDrafts.design.toFixed(0)}m / 
              I:{representativeDrafts.intermediate.toFixed(0)}m
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2, mx: 2 }} />

        {/* Sea State Section */}
        <Typography sx={{ 
          fontSize: '0.95rem', 
          fontWeight: 600, 
          color: '#333',
          px: 2,
          pb: 1
        }}>
          Sea State
        </Typography>

        <Box sx={{
          mx: 2,
          mb: 2.5,
          border: '1px solid #ddd',
          borderRadius: '6px',
          overflow: 'hidden',
          bgcolor: '#fafafa'
        }}>
          <InputFieldRow 
            label="Mean Wave Direction" 
            field="waveDirection" 
            step={1}
            unit="[degree]"
            helper="Clockwise from the North to the coming wave - value range [0, 360]"
          />

          <InputFieldRow 
            label="Significant Wave Height" 
            field="hs" 
            step={0.5}
            unit="[m]"
            helper={parameterBounds ? `value range [${parameterBounds.hsLower}, ${parameterBounds.hsUpper}]` : "value range [000, 000]"}
          />

          {/* Wave Period Dropdown */}
          <Box sx={{ 
            py: 1.2,
            px: 2,
            borderBottom: '1px solid #e8e8e8'
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 0.5
            }}>
              <Typography sx={{ 
                fontSize: '0.9rem', 
                color: '#2196f3',
                fontWeight: 400,
                minWidth: '140px'
              }}>
                Wave Period
              </Typography>
              
              <Box />
              
              <FormControl size="small" sx={{ flex: 1, maxWidth: '280px' }}>
                <Select
                  value={parameters.wavePeriodType}
                  onChange={(e) => handleChange('wavePeriodType', e.target.value)}
                  sx={{ 
                    fontSize: '0.85rem', 
                    height: '40px', 
                    borderRadius: '6px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ccc',
                        borderWidth: '1.5px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#999',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                        borderWidth: '1.5px',
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#2196f3',
                      fontWeight: 500
                    }
                  }}
                >
                  <MenuItem value="tz">Zero Up-crossing, Tz</MenuItem>
                  <MenuItem value="tp_pierson">Peak – Pierson-Moskowitz, Tp</MenuItem>
                  <MenuItem value="tm_pierson">Mean – Pierson-Moskowitz, Tm</MenuItem>
                  <MenuItem value="tp_jonswap">Peak – JONSWAP, Tp</MenuItem>
                  <MenuItem value="tm_jonswap">Mean – JONSWAP, Tm</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Wave Period Value Input */}
          <Box sx={{ 
            py: 1.2,
            px: 2,
            borderBottom: 'none'
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 0.5
            }}>
              {/* Label */}
              <Typography sx={{ 
                fontSize: '0.9rem', 
                color: '#666',
                fontWeight: 400,
                minWidth: '140px'
              }}>
                Wave Period
              </Typography>

              {/* Validation Icon */}
              <ValidationIcon isValid={validators.tz()} />

              {/* Input Field Container */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                position: 'relative'
              }}>
                <TextField
                  type="number"
                  value={parameters.tz}
                  onChange={(e) => handleChange('tz', parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 0.5, style: { textAlign: 'center', paddingRight: '50px' } }}
                  size="small"
                  sx={{
                    flex: 1,
                    maxWidth: '280px',
                    '& .MuiOutlinedInput-root': {
                      height: '40px',
                      borderRadius: '6px',
                      '& fieldset': {
                        borderColor: '#ccc',
                        borderWidth: '1.5px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#999',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                        borderWidth: '1.5px',
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '8px 12px',
                      color: '#2196f3',
                      fontWeight: 500
                    }
                  }}
                />
                
                {/* Unit - Positioned inside input field on the right */}
                <Typography sx={{ 
                  fontSize: '0.75rem', 
                  color: '#ccc',
                  position: 'absolute',
                  right: '12px',
                  fontWeight: 400,
                  pointerEvents: 'none'
                }}>
                  [s]
                </Typography>
              </Box>
            </Box>

            {/* Helper Text */}
            <Typography sx={{ 
              fontSize: '0.7rem', 
              color: '#999',
              ml: 'auto',
              mr: 0,
              textAlign: 'right',
              mt: 0.5
            }}>
              {parameterBounds ? `value range [${parameterBounds.tzLower}, ${parameterBounds.tzUpper}]` : "value range [000, 000]"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, mx: 2 }} />

        {/* Display Options */}
        <Box sx={{ px: 2 }}>
          <Typography sx={{ 
            fontSize: '0.95rem', 
            fontWeight: 600, 
            color: '#333',
            mb: 1.5
          }}>
            Display Options
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ fontSize: '0.85rem', color: '#333', mb: 0.8 }}>Plot Mode</FormLabel>
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
            <FormLabel component="legend" sx={{ fontSize: '0.85rem', color: '#333', mb: 0.8 }}>Direction</FormLabel>
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
        </Box>

        <Divider sx={{ my: 2, mx: 2 }} />

        {/* Case Files Section - Only show in User Data Input tab */}
        {activeTab === 'userdata' && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography sx={{ 
              fontSize: '0.95rem', 
              fontWeight: 600, 
              color: '#333',
              mb: 1.5
            }}>
              Case Files
            </Typography>

            {/* Save to Case ID Input */}
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.8, color: '#333' }}>
                Save to case ID
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter case ID"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  sx={{ 
                    fontSize: '0.9rem',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ddd',
                      }
                    }
                  }}
                />
                <IconButton
                  size="small"
                  sx={{ color: '#2ecc71', flexShrink: 0 }}
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
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.8, color: '#333' }}>
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
                    '&:disabled': { color: '#ccc' },
                    flexShrink: 0
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
          </Box>
        )}
      </Box>
    </Paper>
  );
}