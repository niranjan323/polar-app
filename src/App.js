import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Box
} from '@mui/material';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import PlotArea from './components/PlotArea';
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

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
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
            gap: 2.5,
            p: 2.5,
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* Content Area - Left side (narrower) */}
            <Box sx={{ 
              width: '27%',
              minWidth: '300px',
              maxWidth: '380px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <ContentArea
                activeTab={activeTab}
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