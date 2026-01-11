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
        borderBottom: '1px solid #ddd'
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* App Logo/Name */}
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Polar App
        </Typography>

        <Box sx={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', ml: 4 }}>
          {/* Select Project Folder */}
          <Button
            variant="contained"
            size="small"
            startIcon={<FolderOpenIcon />}
            onClick={onProjectFolderSelect}
            sx={{
              bgcolor: '#2196f3',
              color: 'white',
              textTransform: 'none',
              '&:hover': { bgcolor: '#1976d2' }
            }}
          >
            Select project folder
          </Button>
          {projectFolder && (
            <Chip 
              label={`✓ ${projectFolder}`}
              size="small"
              sx={{ bgcolor: '#4caf50', color: 'white' }}
            />
          )}

          {/* Load Control File */}
          <Button
            variant="contained"
            size="small"
            startIcon={<DescriptionIcon />}
            onClick={onControlFileSelect}
            disabled={!projectFolder}
            sx={{
              bgcolor: projectFolder ? '#2196f3' : '#666',
              color: 'white',
              textTransform: 'none',
              '&:hover': { bgcolor: projectFolder ? '#1976d2' : '#666' }
            }}
          >
            Load control file
          </Button>
          {controlFile && (
            <Chip 
              label={`✓ ${controlFile}`}
              size="small"
              sx={{ bgcolor: '#4caf50', color: 'white' }}
            />
          )}

          {/* Vessel Info */}
          {vesselInfo && (
            <Box sx={{ ml: 3, display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Vessel: <strong>{vesselInfo.name || 'Unknown'}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                IMO: <strong>{vesselInfo.imo || 'Unknown'}</strong>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Side - User Icon */}
        <AccountCircleIcon sx={{ color: 'white', fontSize: 32 }} />
      </Toolbar>
    </AppBar>
  );
}