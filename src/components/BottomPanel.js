import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function BottomPanel({
  parameters,
  savedCases,
  setSavedCases,
  selectedCase,
  setSelectedCase
}) {
  
  const [caseId, setCaseId] = useState('');
  const [reportOption, setReportOption] = useState('current');

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

  return (
    <Paper sx={{ height: '100%', p: 2, bgcolor: 'white' }}>
      <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
        {/* Save Case Section */}
        <Box sx={{ width: '250px' }}>
          <Typography variant="subtitle2" gutterBottom>
            Save to case ID
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="up to 12 characters"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            inputProps={{ maxLength: 12 }}
            sx={{ mb: 1 }}
          />
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={handleSaveCase}
            disabled={!caseId.trim()}
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#45a049' },
              textTransform: 'none'
            }}
          >
            Save Case
          </Button>
        </Box>

        {/* Saved Cases List */}
        <Box sx={{ flex: 1, borderLeft: '1px solid #ddd', pl: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Saved Cases ({savedCases.length})
          </Typography>
          
          {savedCases.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No saved cases yet
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {savedCases.map((caseItem, index) => (
                <Chip
                  key={index}
                  icon={
                    <FiberManualRecordIcon 
                      sx={{ 
                        fontSize: 12, 
                        color: caseItem.isInDangerZone ? '#f44336' : '#4caf50'
                      }} 
                    />
                  }
                  label={caseItem.id}
                  onClick={() => setSelectedCase(caseItem)}
                  onDelete={() => handleDeleteCase(caseItem)}
                  color={selectedCase?.id === caseItem.id ? 'primary' : 'default'}
                  variant={selectedCase?.id === caseItem.id ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Delete Case */}
        <Box sx={{ width: '200px', borderLeft: '1px solid #ddd', pl: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Delete saved case
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              displayEmpty
              value=""
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
        <Box sx={{ width: '250px', borderLeft: '1px solid #ddd', pl: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Generate report
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <Select
              value={reportOption}
              onChange={(e) => setReportOption(e.target.value)}
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
              bgcolor: '#2196f3',
              '&:hover': { bgcolor: '#1976d2' },
              textTransform: 'none'
            }}
          >
            Generate PDF Report
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}