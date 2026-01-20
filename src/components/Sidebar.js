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
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        gap: 0.5,
        px: 1,
        height: '100vh',
        justifyContent: 'center',
        bgcolor: '#fff',
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
              padding: '1rem',
              bgcolor: activeTab === item.id ? '#FFF' : '#FFF',
              color: '#626266',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              borderLeft: activeTab === item.id ? '2px solid #2196f3' : '2px solid transparent',
              pl: 'calc(1rem - 4px)',
              boxShadow: activeTab === item.id ? '0 2px 8px rgba(33, 150, 243, 0.25)' : 'none',
              '&:hover': {
                bgcolor: item.disabled ? '#FFF' : '#FFF',
                transform: item.disabled ? 'none' : 'translateY(-1px)',
                boxShadow: item.disabled ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Box
              sx={{
                fontSize: '2rem',
                mb: 0.8,
                color: '#626266',
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
                padding: '0.5rem',
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