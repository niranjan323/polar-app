import React from 'react';
import {
  Box,
  Tooltip
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';

export default function Sidebar({ activeTab, setActiveTab, controlFileLoaded }) {
  const menuItems = [
    { id: 'project', label: 'Project', icon: <FolderIcon />, disabled: false },
    { id: 'userdata', label: 'User Data Input', icon: <EditIcon />, disabled: !controlFileLoaded }
  ];

  return (
    <Box 
      sx={{ 
        width: '90px',
        bgcolor: '#2c5282',
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        gap: 0.5,
        px: 1,
        borderRight: '4px solid #1e4976'
      }}
    >
      {menuItems.map((item) => (
        <Tooltip key={item.id} title={item.label} placement="right">
          <Box
            onClick={() => !item.disabled && setActiveTab(item.id)}
            disabled={item.disabled}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2.5,
              px: 1,
              bgcolor: activeTab === item.id ? '#1e4976' : '#2c5282',
              color: item.disabled ? 'rgba(255,255,255,0.3)' : 'white',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderLeft: activeTab === item.id ? '4px solid #2196f3' : '4px solid transparent',
              pl: activeTab === item.id ? 'calc(1rem - 4px)' : '1rem',
              boxShadow: activeTab === item.id ? '0 2px 8px rgba(33, 150, 243, 0.25)' : 'none',
              '&:hover': {
                bgcolor: item.disabled ? '#2c5282' : '#34588c',
                transform: item.disabled ? 'none' : 'translateY(-1px)',
                boxShadow: item.disabled ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Box
              sx={{
                fontSize: '2rem',
                mb: 0.8,
                color: activeTab === item.id ? '#2196f3' : 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {item.icon}
            </Box>
            <Box
              sx={{
                fontSize: '0.7rem',
                textAlign: 'center',
                fontWeight: activeTab === item.id ? 700 : 500,
                lineHeight: 1.1,
                color: 'inherit',
                textTransform: activeTab === item.id ? 'uppercase' : 'capitalize'
              }}
            >
              {item.label}
            </Box>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}