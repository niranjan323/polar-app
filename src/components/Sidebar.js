import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
        width: '60px',
        bgcolor: '#2c5282',
        display: 'flex',
        flexDirection: 'column',
        pt: 1
      }}
    >
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.id} title={item.label} placement="right">
            <ListItemButton
              selected={activeTab === item.id}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
              sx={{
                flexDirection: 'column',
                py: 2,
                color: 'white',
                '&.Mui-selected': {
                  bgcolor: '#1e4976',
                  borderLeft: '4px solid #2196f3'
                },
                '&:hover': {
                  bgcolor: '#1e4976'
                },
                '&.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 0, 
                color: 'inherit',
                justifyContent: 'center'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  mt: 0.5
                }}
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );
}