import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Box,
  Button
} from '@mui/material';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import PlotArea from './components/PlotArea';
import InitialSetupDialog from './components/InitialSetupDialog';
import { FileSystemService } from './utils/fileSystem';
import { DataLoader } from './services/dataLoader';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#d4dce6',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
  },
});

function App() {
  // Services
  const [fileSystem] = useState(() => new FileSystemService());
  const [dataLoader] = useState(() => new DataLoader(fileSystem));

  // Initial setup state
  const [showInitialDialog, setShowInitialDialog] = useState(true);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // Project state
  const [projectFolder, setProjectFolder] = useState(null);
  const [controlFile, setControlFile] = useState(null);
  const [controlFileLoaded, setControlFileLoaded] = useState(false);
  
  // Control file data
  const [vesselInfo, setVesselInfo] = useState(null);
  const [parameterBounds, setParameterBounds] = useState(null);
  const [representativeDrafts, setRepresentativeDrafts] = useState(null);

  // User inputs
  const [parameters, setParameters] = useState({
    draft: 'design',
    draftAftPeak: 10,
    draftForePeak: 10,
    gm: 2,
    heading: 18,
    speed: 12,
    maxRollAngle: 20,
    hs: 5,
    tz: 10,
    waveDirection: 130,
    wavePeriodType: 'tz'
  });

  // Display state
  const [activeTab, setActiveTab] = useState('project');
  const [displayMode, setDisplayMode] = useState('continuous');
  const [directionMode, setDirectionMode] = useState('northup');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cases
  const [savedCases, setSavedCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  // Load control file when project is selected
  useEffect(() => {
    if (projectFolder) {
      loadControlFile();
    }
  }, [projectFolder]);

  const loadControlFile = async () => {
    try {
      const result = await dataLoader.loadControlFile('PolarData/proll.ctl');
      if (result.success) {
        setControlFileLoaded(true);
        setVesselInfo(result.vesselInfo);
        setParameterBounds(result.parameterBounds);
        setRepresentativeDrafts(result.representativeDrafts);
        setControlFile('proll.ctl');
        setActiveTab('userdata');
      } else {
        setError('Failed to load control file');
      }
    } catch (err) {
      setError(`Error loading control file: ${err.message}`);
    }
  };

  const handleProjectFolderSelect = () => {
    setProjectFolder('raw');
  };

  const handleControlFileSelect = () => {
    loadControlFile();
  };

  const handleInitialSetupComplete = (setupData) => {
    setProjectFolder(setupData.projectFolder);
    setControlFile(setupData.controlFile);
    setShowInitialDialog(false);
    setInitialSetupComplete(true);
    // Attempt to load the control file
    loadControlFile();
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      
      {/* Initial Setup Dialog */}
      <InitialSetupDialog
        open={showInitialDialog}
        onComplete={handleInitialSetupComplete}
      />

      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#d4dce6',
        overflow: 'hidden'
      }}>
        {/* Top Bar */}
        <TopBar
          projectFolder={projectFolder}
          controlFile={controlFile}
          onProjectFolderSelect={handleProjectFolderSelect}
          onControlFileSelect={handleControlFileSelect}
          vesselInfo={vesselInfo}
        />

        {/* Tabs Bar */}
        {/* <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          padding: '12px 16px',
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #ddd',
          height: '48px',
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}>
          <Button
            onClick={() => setActiveTab('project')}
            sx={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'project' ? 600 : 400,
              color: activeTab === 'project' ? '#1e4976' : '#666',
              backgroundColor: activeTab === 'project' ? 'rgba(30, 73, 118, 0.1)' : 'transparent',
              border: activeTab === 'project' ? '2px solid #1e4976' : '1px solid #ddd',
              borderRadius: '4px',
              textTransform: 'capitalize',
              '&:hover': {
                backgroundColor: 'rgba(30, 73, 118, 0.05)'
              }
            }}
          >
            Project
          </Button>
          <Button
            onClick={() => setActiveTab('userdata')}
            sx={{
              padding: '8px 20px',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'userdata' ? 600 : 400,
              color: activeTab === 'userdata' ? '#1e4976' : '#666',
              backgroundColor: activeTab === 'userdata' ? 'rgba(30, 73, 118, 0.1)' : 'transparent',
              border: activeTab === 'userdata' ? '2px solid #1e4976' : '1px solid #ddd',
              borderRadius: '4px',
              textTransform: 'capitalize',
              '&:hover': {
                backgroundColor: 'rgba(30, 73, 118, 0.05)'
              }
            }}
          >
            User Data Input
          </Button>
        </Box> */}

        {/* Main Content - Sidebar + Content + Plot */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          minHeight: 0
        }}>
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            controlFileLoaded={controlFileLoaded}
          />

          {/* Main Area - Content + Plot with Bottom Bar */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            gap: 2,
            p: 2,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* Content Area - Left side (narrower) */}
            <Box sx={{ 
              width: '28%',
              minWidth: '320px',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
               <ContentArea
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                parameters={parameters}
                setParameters={setParameters}
                vesselInfo={vesselInfo}
                parameterBounds={parameterBounds}
                representativeDrafts={representativeDrafts}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                directionMode={directionMode}
                setDirectionMode={setDirectionMode}
                controlFileLoaded={controlFileLoaded}
                savedCases={savedCases}
                setSavedCases={setSavedCases}
                selectedCase={selectedCase}
                setSelectedCase={setSelectedCase}
              />
            </Box>

            {/* Plot Area - Right side (wider) with its own bottom bar */}
            <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
              <PlotArea
                parameters={parameters}
                chartData={chartData}
                loading={loading}
                error={error}
                displayMode={displayMode}
                directionMode={directionMode}
                savedCases={savedCases}
                setSavedCases={setSavedCases}
                selectedCase={selectedCase}
                setSelectedCase={setSelectedCase}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;