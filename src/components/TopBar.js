import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  Chip
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function TopBar({
  projectFolder,
  controlFile,
  onProjectFolderSelect,
  onControlFileSelect,
  vesselInfo
}) {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: '#1e4976',
        borderBottom: '2px solid #15354d',
        height: '56px'
      }}
    >
      <Toolbar sx={{ 
        gap: 2, 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Logo and branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: 0.5,
              textTransform: 'uppercase'
            }}
          >
            [LOGO] ABS PROLL
          </Typography>
        </Box>

        {/* Center: Project and Control File Status */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, ml: 4 }}>
          {/* Project Folder */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpenIcon sx={{ fontSize: 20, color: '#90caf9' }} />
            {projectFolder ? (
              <Chip 
                label={`✓ ${projectFolder}`}
                size="small"
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  fontWeight: 600,
                  height: 24
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                No folder selected
              </Typography>
            )}
          </Box>

          {/* Control File */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <DescriptionIcon sx={{ fontSize: 20, color: '#90caf9' }} />
            {controlFile ? (
              <Chip 
                label={`✓ ${controlFile}`}
                size="small"
                sx={{ 
                  bgcolor: '#4caf50', 
                  color: 'white',
                  fontWeight: 600,
                  height: 24
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                No file selected
              </Typography>
            )}
          </Box>

          {/* Vessel Info */}
          {vesselInfo && (
            <Box sx={{ ml: 3, display: 'flex', gap: 3, borderLeft: '1px solid rgba(255,255,255,0.3)', pl: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                  Vessel
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {vesselInfo.name || 'Unknown'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                  IMO
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {vesselInfo.imo || 'Unknown'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right: User Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountCircleIcon sx={{ color: 'white', fontSize: 32, cursor: 'pointer' }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}