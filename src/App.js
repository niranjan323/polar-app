import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Box,
  Grid,
  Paper
} from '@mui/material';
import ControlPanel from './components/ControlPanel';
import PolarChart from './components/PolarChart';
import InfoPanel from './components/InfoPanel';
import { FileSystemService } from './utils/fileSystem';
import { DataLoader } from './services/dataLoader';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  // Services
  const [fileSystem] = useState(() => new FileSystemService());
  const [dataLoader] = useState(() => new DataLoader(fileSystem));

  // State
  const [controlFileLoaded, setControlFileLoaded] = useState(false);
  const [vesselInfo, setVesselInfo] = useState(null);
  const [parameterBounds, setParameterBounds] = useState(null);
  
  // User inputs
  const [parameters, setParameters] = useState({
    draft: 'scantling',
    draftAftPeak: 0,
    draftForePeak: 0,
    gm: 1.5,
    heading: 5,
    speed: 10,
    maxRollAngle: 15,
    hs: 5.5,
    tz: 7.5,
    waveDirection: 0
  });

  // Display options
  const [displayMode, setDisplayMode] = useState('continuous');
  const [directionMode, setDirectionMode] = useState('northup');

  // Chart data
  const [chartData, setChartData] = useState(null);
  const [loadedData, setLoadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Saved cases
  const [savedCases, setSavedCases] = useState([]);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(-1);

  // Load control file on startup
  useEffect(() => {
    loadControlFile();
  }, []);

  const loadControlFile = async () => {
    try {
      const result = await dataLoader.loadControlFile('PolarData/proll.ctl');
      if (result.success) {
        setControlFileLoaded(true);
        setVesselInfo(result.vesselInfo);
        setParameterBounds(result.parameterBounds);
      } else {
        setError('Failed to load control file');
      }
    } catch (err) {
      setError(`Error loading control file: ${err.message}`);
    }
  };

  const handleLoadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 3: Search database for matching file
      const filePath = dataLoader.findDataFile(parameters);
      
      // Step 4: Read binary data
      const result = await dataLoader.loadPolarData(filePath, parameters);
      
      if (result.success) {
        setLoadedData(result);
        
        // Step 5: Prepare data for plotting
        const prepared = prepareChartData(result.data, parameters);
        setChartData(prepared);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (data, params) => {
    // Convert vessel coordinates to display coordinates
    const displayAngles = data.headings.map(beta => {
      let angle;
      if (directionMode === 'northup') {
        angle = 180 + (params.heading - beta);
      } else {
        angle = 180 - beta;
      }
      
      while (angle < 0) angle += 360;
      while (angle >= 360) angle -= 360;
      
      return angle;
    });

    // Calculate wave direction for display
    let waveDisplayAngle;
    if (directionMode === 'northup') {
      waveDisplayAngle = params.waveDirection;
    } else {
      waveDisplayAngle = params.waveDirection - params.heading;
      while (waveDisplayAngle < 0) waveDisplayAngle += 360;
      while (waveDisplayAngle >= 360) waveDisplayAngle -= 360;
    }

    return {
      angles: displayAngles,
      speeds: data.speeds,
      rollMatrix: data.rollMatrix,
      maxRoll: params.maxRollAngle,
      mode: displayMode,
      directionMode: directionMode,
      vesselHeading: params.heading,
      vesselSpeed: params.speed,
      waveDirection: waveDisplayAngle
    };
  };

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    if (loadedData) {
      const prepared = prepareChartData(loadedData.data, parameters);
      setChartData(prepared);
    }
  };

  const handleDirectionModeChange = (mode) => {
    setDirectionMode(mode);
    if (loadedData) {
      const prepared = prepareChartData(loadedData.data, parameters);
      setChartData(prepared);
    }
  };

  const handleSaveCase = () => {
    const newCase = {
      id: `Case ${savedCases.length + 1}`,
      parameters: { ...parameters },
      data: loadedData,
      chartData: chartData,
      timestamp: new Date().toISOString()
    };
    
    setSavedCases([...savedCases, newCase]);
    setCurrentCaseIndex(savedCases.length);
  };

  const handleLoadCase = (index) => {
    if (index >= 0 && index < savedCases.length) {
      const savedCase = savedCases[index];
      setParameters(savedCase.parameters);
      setLoadedData(savedCase.data);
      setChartData(savedCase.chartData);
      setCurrentCaseIndex(index);
    }
  };

  const handleDeleteCase = (index) => {
    const newCases = savedCases.filter((_, i) => i !== index);
    setSavedCases(newCases);
    if (currentCaseIndex === index) {
      setCurrentCaseIndex(-1);
      setChartData(null);
      setLoadedData(null);
    } else if (currentCaseIndex > index) {
      setCurrentCaseIndex(currentCaseIndex - 1);
    }
  };

  const handleExportReport = async () => {
    // Step 8: Generate PDF report
    try {
      // Implementation for PDF export
      console.log('Exporting report...');
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh', 
        overflow: 'hidden',
        bgcolor: 'background.default',
        p: 2
      }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Left Panel - Controls */}
          <Grid item xs={12} md={3} lg={2.5} sx={{ 
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <ControlPanel
              parameters={parameters}
              setParameters={setParameters}
              vesselInfo={vesselInfo}
              parameterBounds={parameterBounds}
              displayMode={displayMode}
              directionMode={directionMode}
              onDisplayModeChange={handleDisplayModeChange}
              onDirectionModeChange={handleDirectionModeChange}
              onLoadData={handleLoadData}
              onSaveCase={handleSaveCase}
              onExportReport={handleExportReport}
              loading={loading}
              hasData={chartData !== null}
              savedCases={savedCases}
              currentCaseIndex={currentCaseIndex}
              onLoadCase={handleLoadCase}
              onDeleteCase={handleDeleteCase}
              controlFileLoaded={controlFileLoaded}
            />
          </Grid>

          {/* Center Panel - Chart */}
          <Grid item xs={12} md={6} lg={7}>
            <Paper 
              elevation={3} 
              sx={{ 
                height: '100%', 
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <PolarChart
                chartData={chartData}
                loading={loading}
                error={error}
                savedCases={savedCases}
                currentCaseIndex={currentCaseIndex}
                onLoadCase={handleLoadCase}
              />
            </Paper>
          </Grid>

          {/* Right Panel - Info */}
          <Grid item xs={12} md={3} lg={2.5}>
            <InfoPanel
              loadedData={loadedData}
              parameters={parameters}
            />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App;