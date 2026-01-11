import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import DeleteIcon from '@mui/icons-material/Delete';

export default function PlotArea({
  parameters,
  chartData,
  loading,
  error,
  displayMode,
  directionMode,
  savedCases,
  setSavedCases,
  selectedCase,
  setSelectedCase
}) {
  
  const canvasRef = useRef(null);
  const [caseId, setCaseId] = useState('');
  const [reportOption, setReportOption] = useState('current');

  useEffect(() => {
    if (canvasRef.current) {
      renderPolarDiagram();
    }
  }, [parameters, displayMode, directionMode]);

  const handleSaveCase = () => {
    if (!caseId.trim() || caseId.length > 12) {
      alert('Case ID must be 1-12 characters');
      return;
    }

    const newCase = {
      id: caseId,
      parameters: { ...parameters },
      timestamp: new Date().toISOString(),
      isInDangerZone: false
    };

    setSavedCases([...savedCases, newCase]);
    setCaseId('');
  };

  const handleDeleteCase = (caseToDelete) => {
    setSavedCases(savedCases.filter(c => c.id !== caseToDelete.id));
    if (selectedCase?.id === caseToDelete.id) {
      setSelectedCase(null);
    }
  };

  const handleGenerateReport = () => {
    console.log('Generating report for:', reportOption);
  };

  const renderPolarDiagram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Use full container dimensions without forcing square
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.75;
    const minRadius = maxRadius * 0.1;

    // Background
    ctx.fillStyle = '#6b7f95';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw colored polar regions
    const drawPolarRegions = () => {
      const numSectors = 72;
      const numRings = 20;

      for (let ring = 0; ring < numRings; ring++) {
        const innerR = minRadius + (maxRadius - minRadius) * (ring / numRings);
        const outerR = minRadius + (maxRadius - minRadius) * ((ring + 1) / numRings);

        for (let sector = 0; sector < numSectors; sector++) {
          const angle1 = (sector / numSectors) * Math.PI * 2 - Math.PI / 2;
          const angle2 = ((sector + 1) / numSectors) * Math.PI * 2 - Math.PI / 2;

          const hue = (sector / numSectors) * 360;
          const saturation = 65 + (ring / numRings) * 25;
          const lightness = 45 + (ring / numRings) * 15;
          
          ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          
          ctx.beginPath();
          ctx.moveTo(centerX + innerR * Math.cos(angle1), centerY + innerR * Math.sin(angle1));
          ctx.lineTo(centerX + outerR * Math.cos(angle1), centerY + outerR * Math.sin(angle1));
          ctx.lineTo(centerX + outerR * Math.cos(angle2), centerY + outerR * Math.sin(angle2));
          ctx.lineTo(centerX + innerR * Math.cos(angle2), centerY + innerR * Math.sin(angle2));
          ctx.closePath();
          ctx.fill();
        }
      }
    };

    drawPolarRegions();

    // Draw grid circles
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const r = minRadius + (maxRadius - minRadius) * (i / 4);
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((i * 5) + ' kn', centerX, centerY - r - 8);
    }

    // Draw radial lines
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + maxRadius * Math.cos(rad), centerY + maxRadius * Math.sin(rad));
      ctx.stroke();

      const labelR = maxRadius * 1.13;
      const x = centerX + labelR * Math.cos(rad);
      const y = centerY + labelR * Math.sin(rad);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(angle + '°', x, y);
    }

    // Compass labels
    if (directionMode === 'northup') {
      const compass = [
        { angle: 0, label: 'N' },
        { angle: 90, label: 'E' },
        { angle: 180, label: 'S' },
        { angle: 270, label: 'W' }
      ];

      compass.forEach(c => {
        const rad = (c.angle - 90) * Math.PI / 180;
        const compassR = maxRadius * 1.27;
        const x = centerX + compassR * Math.cos(rad);
        const y = centerY + compassR * Math.sin(rad);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, x, y);
      });
    }

    // Draw vessel
    const vesselRad = (parameters.heading - 90) * Math.PI / 180;
    const vesselR = minRadius + (maxRadius - minRadius) * (parameters.speed / 20);
    const vx = centerX + vesselR * Math.cos(vesselRad);
    const vy = centerY + vesselR * Math.sin(vesselRad);

    ctx.save();
    ctx.translate(vx, vy);
    ctx.rotate(vesselRad + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-11, 11);
    ctx.lineTo(11, 11);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Draw wave direction
    const waveRad = (parameters.waveDirection - 90) * Math.PI / 180;
    const waveR = maxRadius * 1.06;
    const wx = centerX + waveR * Math.cos(waveRad);
    const wy = centerY + waveR * Math.sin(waveRad);

    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(waveRad + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(-9, 9);
    ctx.lineTo(9, 9);
    ctx.closePath();
    ctx.fillStyle = '#FF1493';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE', wx, wy - 22);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Roll Angle (deg)', centerX, 40);
  };

  return (
    <Paper sx={{ 
      height: '100%',
      bgcolor: 'white',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        px: 2.5, 
        py: 1.5, 
        borderBottom: '1px solid #e0e0e0',
        bgcolor: '#fafafa',
        flexShrink: 0
      }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
          Roll Angle
        </Typography>
      </Box>

      {/* Chart Area - Scrollable Container */}
      <Box sx={{ 
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 1
      }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                width: '100%',
                height: '100%',
                maxWidth: '1200px',
                maxHeight: '800px',
                display: 'block'
              }} 
            />
          </Box>
        )}
      </Box>

      {/* Bottom Bar - Scrollable if needed */}
      <Box sx={{ 
        borderTop: '2px solid #e0e0e0',
        bgcolor: '#f5f5f5',
        p: 2,
        flexShrink: 0,
        minHeight: 'auto',
        overflow: 'auto'
      }}>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', minWidth: 'min-content' }}>
          {/* Save Case Section */}
          <Box sx={{ minWidth: '200px' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Save to case ID
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="up to 12 characters"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              inputProps={{ maxLength: 12 }}
              sx={{ mb: 1, bgcolor: 'white' }}
            />
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={handleSaveCase}
              disabled={!caseId.trim()}
              sx={{
                bgcolor: '#e74c3c',
                '&:hover': { bgcolor: '#c0392b' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Save Case
            </Button>
          </Box>

          {/* Saved Cases List */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Saved Cases ({savedCases.length})
            </Typography>
            
            {savedCases.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No saved cases yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {savedCases.map((caseItem, index) => (
                  <Chip
                    key={index}
                    icon={
                      <FiberManualRecordIcon 
                        sx={{ 
                          fontSize: 14, 
                          color: caseItem.isInDangerZone ? '#e74c3c' : '#2ecc71'
                        }} 
                      />
                    }
                    label={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    onDelete={() => handleDeleteCase(caseItem)}
                    deleteIcon={<DeleteIcon />}
                    color={selectedCase?.id === caseItem.id ? 'primary' : 'default'}
                    variant={selectedCase?.id === caseItem.id ? 'filled' : 'outlined'}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: selectedCase?.id === caseItem.id ? 600 : 400
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Delete Case Dropdown */}
          <Box sx={{ minWidth: '180px' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Delete saved case
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value=""
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="" disabled>
                  Select a case
                </MenuItem>
                {savedCases.map((caseItem, index) => (
                  <MenuItem 
                    key={index} 
                    value={caseItem.id}
                    onClick={() => handleDeleteCase(caseItem)}
                  >
                    {caseItem.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Generate Report */}
          <Box sx={{ minWidth: '220px' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Generate report
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <Select
                value={reportOption}
                onChange={(e) => setReportOption(e.target.value)}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="current">current case (default)</MenuItem>
                <MenuItem value="all">all cases</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={handleGenerateReport}
              disabled={savedCases.length === 0}
              sx={{
                bgcolor: '#3498db',
                '&:hover': { bgcolor: '#2980b9' },
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Generate PDF Report
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}