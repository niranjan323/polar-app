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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
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
      overflow: 'hidden',
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
        <Box sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e4976' }}>
          Roll Angle Diagram
        </Box>
      </Box>

      {/* Chart Area - Scrollable Container */}
      <Box sx={{ 
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#6b7f95',
        p: 0
      }}>
        {loading ? (
          <CircularProgress sx={{ color: 'white' }} />
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

      {/* Bottom Bar - Saved Cases List with Generate Report */}
      <Box sx={{ 
        borderTop: '2px solid #d0d0d0',
        bgcolor: '#f5f5f5',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Top Section - Saved Cases */}
        <Box sx={{ 
          p: 1.2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: '50px',
          overflow: 'auto'
        }}>
          {/* Saved Cases Label */}
          <Box sx={{ 
            fontWeight: 700, 
            fontSize: '0.85rem', 
            color: '#1e4976',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            whiteSpace: 'nowrap'
          }}>
            Saved Cases:
          </Box>

          {/* Saved Cases Chips */}
          {savedCases.length === 0 ? (
            <Box sx={{ 
              color: '#999', 
              fontSize: '0.85rem',
              fontStyle: 'italic'
            }}>
              No saved cases yet
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {savedCases.map((caseItem, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedCase(caseItem)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '35px',
                    backgroundColor: selectedCase?.id === caseItem.id ? '#2196f3' : 'white',
                    borderRadius: '4px',
                    border: selectedCase?.id === caseItem.id ? '2px solid #2196f3' : '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    '&:hover': {
                      borderColor: '#2196f3',
                      boxShadow: '0 2px 6px rgba(33, 150, 243, 0.2)'
                    }
                  }}
                >
                  {/* Status Indicator Dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: caseItem.isInDangerZone ? '#e74c3c' : '#4caf50'
                    }}
                  />
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    fontWeight: selectedCase?.id === caseItem.id ? 700 : 600,
                    color: selectedCase?.id === caseItem.id ? 'white' : '#333'
                  }}>
                    {caseItem.id}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Divider Line */}
        <Divider sx={{ my: 0 }} />

        {/* Bottom Section - Generate Report */}
        <Box sx={{ 
          p: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.5,
          minHeight: '40px'
        }}>
          {/* Generate Report Button and Options */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleGenerateReport}
              disabled={savedCases.length === 0}
              sx={{
                bgcolor: '#e74c3c',
                color: 'white',
                '&:hover': { bgcolor: '#c0392b' },
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.6
              }}
            >
              Generate Report
            </Button>

            {/* Report Options - Radio Buttons */}
            <FormControl size="small">
              <RadioGroup
                row
                value={reportOption}
                onChange={(e) => setReportOption(e.target.value)}
                sx={{ gap: 1 }}
              >
                <FormControlLabel
                  value="current"
                  control={<Radio size="small" />}
                  label={<Typography sx={{ fontSize: '0.8rem' }}>Current Case</Typography>}
                  sx={{ m: 0 }}
                />
                <FormControlLabel
                  value="all"
                  control={<Radio size="small" />}
                  label={<Typography sx={{ fontSize: '0.8rem' }}>All Cases</Typography>}
                  sx={{ m: 0 }}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}