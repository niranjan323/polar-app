import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Alert, ButtonGroup, Button, Chip } from '@mui/material';

export default function PolarChart({ 
  chartData, 
  loading, 
  error,
  savedCases,
  currentCaseIndex,
  onLoadCase
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (chartData && canvasRef.current) {
      renderChart(canvasRef.current, chartData);
    }
  }, [chartData]);

  const renderChart = (canvas, data) => {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight - 100);
    canvas.width = size;
    canvas.height = size;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.75;
    const minRadius = maxRadius * 0.1;

    // Helper functions
    const toRadians = (deg) => (deg - 90) * Math.PI / 180;
    
    const getColor = (rollValue, maxRoll, mode) => {
      if (mode === 'trafficlight') {
        if (rollValue <= maxRoll - 5) return '#2ecc71';
        if (rollValue <= maxRoll) return '#f39c12';
        return '#e74c3c';
      } else {
        // Continuous gradient
        const ratio = Math.min(rollValue / maxRoll, 1);
        if (ratio < 0.2) return `hsl(210, 80%, ${30 + ratio * 250}%)`;
        if (ratio < 0.4) return `hsl(200, 80%, ${50 + (ratio - 0.2) * 250}%)`;
        if (ratio < 0.6) return `hsl(180, 70%, ${50 + (ratio - 0.4) * 200}%)`;
        if (ratio < 0.8) return `hsl(60, 100%, ${50 + (ratio - 0.6) * 200}%)`;
        return `hsl(0, 100%, 50%)`;
      }
    };

    const interpolateValue = (angle, radius) => {
      // Find nearest angles
      let a1 = 0;
      let minDiff = 360;
      
      for (let i = 0; i < data.angles.length; i++) {
        let diff = Math.abs(data.angles[i] - angle);
        if (diff > 180) diff = 360 - diff;
        if (diff < minDiff) {
          minDiff = diff;
          a1 = i;
        }
      }

      // Find nearest radii
      let r1 = 0, r2 = data.speeds.length - 1;
      for (let i = 0; i < data.speeds.length - 1; i++) {
        if (radius >= data.speeds[i] && radius <= data.speeds[i + 1]) {
          r1 = i;
          r2 = i + 1;
          break;
        }
      }

      const rFactor = data.speeds[r2] > data.speeds[r1] ? 
        (radius - data.speeds[r1]) / (data.speeds[r2] - data.speeds[r1]) : 0;
      
      return data.rollMatrix[r1][a1] * (1 - rFactor) + data.rollMatrix[r2][a1] * rFactor;
    };

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw filled contours
    const numAngularSegments = 360;
    const numRadialSegments = 50;
    const maxSpeed = Math.max(...data.speeds);

    for (let r = 0; r < numRadialSegments; r++) {
      const innerRatio = r / numRadialSegments;
      const outerRatio = (r + 1) / numRadialSegments;
      const innerSpeed = maxSpeed * innerRatio;
      const outerSpeed = maxSpeed * outerRatio;

      for (let a = 0; a < numAngularSegments; a++) {
        const angle1 = (a / numAngularSegments) * 360;
        const angle2 = ((a + 1) / numAngularSegments) * 360;
        const midAngle = (angle1 + angle2) / 2;
        const midRadius = (innerSpeed + outerSpeed) / 2;
        
        const rollValue = interpolateValue(midAngle, midRadius);
        const color = getColor(rollValue, data.maxRoll, data.mode);

        const innerRadius = minRadius + (maxRadius - minRadius) * innerRatio;
        const outerRadius = minRadius + (maxRadius - minRadius) * outerRatio;

        ctx.beginPath();
        const rad1 = toRadians(angle1);
        const rad2 = toRadians(angle2);

        ctx.moveTo(centerX + innerRadius * Math.cos(rad1), centerY + innerRadius * Math.sin(rad1));
        ctx.lineTo(centerX + outerRadius * Math.cos(rad1), centerY + outerRadius * Math.sin(rad1));
        ctx.lineTo(centerX + outerRadius * Math.cos(rad2), centerY + outerRadius * Math.sin(rad2));
        ctx.lineTo(centerX + innerRadius * Math.cos(rad2), centerY + innerRadius * Math.sin(rad2));
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    // Draw grid lines
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;

    // Radial grid
    for (let i = 1; i <= 4; i++) {
      const ratio = i / 4;
      const r = minRadius + (maxRadius - minRadius) * ratio;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      // Speed labels
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(i * 5 + ' kn', centerX + 5, centerY - r);
    }

    // Angular grid
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = toRadians(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + maxRadius * Math.cos(rad), centerY + maxRadius * Math.sin(rad));
      ctx.stroke();

      const labelRadius = maxRadius * 1.15;
      const x = centerX + labelRadius * Math.cos(rad);
      const y = centerY + labelRadius * Math.sin(rad);

      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(angle + '°', x, y);
    }

    // Draw compass labels (North Up mode)
    if (data.directionMode === 'northup') {
      const compass = [
        { angle: 0, label: 'N', color: '#FFD700' },
        { angle: 90, label: 'E', color: '#C0C0C0' },
        { angle: 180, label: 'S', color: '#C0C0C0' },
        { angle: 270, label: 'W', color: '#C0C0C0' }
      ];

      compass.forEach(c => {
        const rad = toRadians(c.angle);
        const compassRadius = maxRadius * 1.25;
        const x = centerX + compassRadius * Math.cos(rad);
        const y = centerY + compassRadius * Math.sin(rad);

        ctx.fillStyle = c.color;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.label, x, y);
      });
    }

    // Draw vessel position
    if (data.vesselSpeed > 0) {
      const vesselAngle = data.directionMode === 'northup' ? data.vesselHeading : 0;
      const vesselRad = toRadians(vesselAngle);
      const vesselR = minRadius + (maxRadius - minRadius) * (data.vesselSpeed / maxSpeed);

      const vx = centerX + vesselR * Math.cos(vesselRad);
      const vy = centerY + vesselR * Math.sin(vesselRad);

      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(vesselRad + Math.PI / 2);

      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(-10, 10);
      ctx.lineTo(10, 10);
      ctx.closePath();

      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VESSEL', vx, vy - 25);
    }

    // Draw wave direction
    const waveRad = toRadians(data.waveDirection);
    const waveR = maxRadius * 1.08;
    const wx = centerX + waveR * Math.cos(waveRad);
    const wy = centerY + waveR * Math.sin(waveRad);

    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(waveRad + Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(-8, 8);
    ctx.lineTo(8, 8);
    ctx.closePath();

    ctx.fillStyle = '#FF1493';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE', wx, wy - 22);

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Roll Angle (deg)', centerX, 30);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!chartData && !loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Configure parameters and click "Load & Render"
          </Typography>
        </Box>
      )}

      {chartData && (
        <>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </Box>

          {savedCases.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {savedCases.map((savedCase, index) => (
                <Chip
                  key={index}
                  label={`Case ${index + 1}`}
                  color={currentCaseIndex === index ? 'primary' : 'default'}
                  onClick={() => onLoadCase(index)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}