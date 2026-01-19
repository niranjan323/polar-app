import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';

export default function InitialSetupDialog({
  open,
  onComplete,
  logoPlaceholder = true
}) {
  const [folderPath, setFolderPath] = useState('');
  const [controlFilePath, setControlFilePath] = useState('');
  const [errors, setErrors] = useState({});

  const handleFolderClick = () => {
    // Placeholder: In production, this would open a folder picker
    // For now, allow manual input
  };

  const handleControlFileClick = () => {
    // Placeholder: In production, this would open a file picker
    // For now, allow manual input
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!folderPath.trim()) {
      newErrors.folder = 'Please select a folder';
    }
    if (!controlFilePath.trim()) {
      newErrors.controlFile = 'Please select a control file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      onComplete({
        projectFolder: folderPath,
        controlFile: controlFilePath
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {}}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '6px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Box sx={{ mb: 2 }}>
          {logoPlaceholder && (
            <Box 
              sx={{ 
                fontWeight: 700, 
                color: '#1e4976',
                letterSpacing: 1,
                fontSize: '1.3rem'
              }}
            >
              [ABS Logo Placeholder]
            </Box>
          )}
        </Box>
        <Box 
          sx={{ 
            fontWeight: 600, 
            color: '#333',
            mb: 1,
            fontSize: '1.1rem'
          }}
        >
          Welcome to ABS | PROLL App
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            fontSize: '0.9rem'
          }}
        >
          Select a project folder and control file to begin
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Folder Selection */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                mb: 1, 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <FolderOpenIcon sx={{ fontSize: 20 }} />
              Project Folder
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Select project folder..."
              value={folderPath}
              onChange={(e) => {
                setFolderPath(e.target.value);
                if (errors.folder) {
                  setErrors({ ...errors, folder: null });
                }
              }}
              error={!!errors.folder}
              helperText={errors.folder}
              sx={{ bgcolor: '#f9f9f9' }}
            />
          </Box>

          {/* Control File Selection */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                mb: 1, 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <DescriptionIcon sx={{ fontSize: 20 }} />
              Control File (.ctl)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Select control file..."
              value={controlFilePath}
              onChange={(e) => {
                setControlFilePath(e.target.value);
                if (errors.controlFile) {
                  setErrors({ ...errors, controlFile: null });
                }
              }}
              error={!!errors.controlFile}
              helperText={errors.controlFile}
              sx={{ bgcolor: '#f9f9f9' }}
            />
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: '#2196f3',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            '&:hover': {
              bgcolor: '#1976d2'
            }
          }}
        >
          Load Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}
