export class DataLoader {
  constructor(fileSystemService) {
    this.fs = fileSystemService;
    this.controlData = null;
  }

  /**
   * Load and parse the control file
   */
  async loadControlFile(path) {
    try {
      const buffer = this.fs.readBinaryFile(path);
      const text = new TextDecoder('utf-8').decode(buffer);
      
      // Parse control file (format based on your C# code)
      const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      
      const vesselInfo = {
        imo: this.extractValue(lines, 'IMO') || 'Unknown',
        name: this.extractValue(lines, 'VesselName') || 'Unknown'
      };

      const parameterBounds = {
        gmLower: parseFloat(this.extractValue(lines, 'GM_lower')) || 0.5,
        gmUpper: parseFloat(this.extractValue(lines, 'GM_upper')) || 5.0,
        hsLower: parseFloat(this.extractValue(lines, 'Hs_lower')) || 3.0,
        hsUpper: parseFloat(this.extractValue(lines, 'Hs_upper')) || 12.0,
        tzLower: parseFloat(this.extractValue(lines, 'Tz_lower')) || 5.0,
        tzUpper: parseFloat(this.extractValue(lines, 'Tz_upper')) || 18.0
      };

      const representativeDrafts = {
        scantling: parseFloat(this.extractValue(lines, 'Ts')) || 0,
        design: parseFloat(this.extractValue(lines, 'Td')) || 0,
        intermediate: parseFloat(this.extractValue(lines, 'Ti')) || 0
      };

      this.controlData = {
        vesselInfo,
        parameterBounds,
        representativeDrafts
      };

      return {
        success: true,
        vesselInfo,
        parameterBounds,
        representativeDrafts
      };
    } catch (error) {
      console.error('Error loading control file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  extractValue(lines, key) {
    const line = lines.find(l => l.startsWith(key));
    if (!line) return null;
    
    const parts = line.split('=');
    if (parts.length < 2) return null;
    
    return parts[1].trim();
  }

  /**
   * Find the data file that best matches the input parameters
   * Step 3 from requirements
   */
  findDataFile(parameters) {
    try {
      // Calculate average draft
      const avgDraft = (parameters.draftAftPeak + parameters.draftForePeak) / 2;
      
      // 1st search: Find draft subfolder
      const draftFolder = parameters.draft; // scantling, design, or intermediate
      const draftPath = `PolarData/${draftFolder}`;
      
      console.log('Looking for files with parameters:', { hs: parameters.hs, tz: parameters.tz, gm: parameters.gm, draft: parameters.draft });
      console.log('Draft path:', draftPath);
      
      // 2nd search: Find GM subfolder
      const gmFolders = this.fs.listDirectory(draftPath);
      console.log('Available GM folders:', gmFolders);
      
      const gmFolder = this.findClosestMatch(gmFolders, parameters.gm, 'GM');
      console.log('Selected GM folder:', gmFolder);
      
      if (!gmFolder) {
        throw new Error('No matching GM folder found');
      }
      
      const gmPath = `${draftPath}/${gmFolder}`;
      
      // 3rd search: Find Hs/Tz data file in bin subfolder
      const binPath = `${gmPath}/bin`;
      const dataFiles = this.fs.listDirectory(binPath);
      console.log('Available data files:', dataFiles.slice(0, 5)); // Log first 5 files
      
      // Find file matching Hs and Tz
      const matchingFile = this.findMatchingDataFile(dataFiles, parameters.hs, parameters.tz);
      console.log('Selected data file:', matchingFile);
      
      if (!matchingFile) {
        throw new Error('No matching data file found');
      }
      
      return `${binPath}/${matchingFile}`;
    } catch (error) {
      console.error('Error finding data file:', error);
      throw error;
    }
  }

  findClosestMatch(folders, targetValue, prefix) {
    let closest = null;
    let minDiff = Infinity;
    
    for (const folder of folders) {
      // Extract numeric value from folder name (e.g., "GM=1.5m" -> 1.5)
      const match = folder.match(/[\d.]+/);
      if (!match) continue;
      
      const value = parseFloat(match[0]);
      const diff = Math.abs(value - targetValue);
      
      if (diff < minDiff) {
        minDiff = diff;
        closest = folder;
      }
    }
    
    return closest;
  }

  findMatchingDataFile(files, hs, tz) 
  {
    let bestMatch = null;
    let minDiff = Infinity;
    
    for (const file of files) {
      // Parse filename like "MAXROLL_H10.0_T10.5.bpolar"
      // H = Significant Wave Height (Hs)
      // T = Mean Wave Period (Tz)
      const hMatch = file.match(/_H([\d.]+)_/);
      const tMatch = file.match(/_T([\d.]+)\./);
      
      if (!hMatch || !tMatch) continue;
      
      const fileHs = parseFloat(hMatch[1]);
      const fileTz = parseFloat(tMatch[1]);
      
      // Calculate distance in parameter space
      const diff = Math.sqrt(
        Math.pow(fileHs - hs, 2) + 
        Math.pow(fileTz - tz, 2)
      );
      
      if (diff < minDiff) {
        minDiff = diff;
        bestMatch = file;
      }
    }
    
    return bestMatch;
  }

  /**
   * Load and parse binary polar data file
   * Step 4 from requirements
   */
  async loadPolarData(filePath, parameters) {
    try {
      const buffer = this.fs.readBinaryFile(filePath);
      const dataView = new DataView(buffer.buffer);
      
      let offset = 0;
      
      // Read header information
      // Assuming binary format: int32 for counts, double (float64) for data
      const numSpeeds = dataView.getInt32(offset, true); // little-endian
      offset += 4;
      
      const numHeadings = dataView.getInt32(offset, true);
      offset += 4;
      
      const numParameters = dataView.getInt32(offset, true);
      offset += 4;
      
      // Read speed array
      const speeds = [];
      for (let i = 0; i < numSpeeds; i++) {
        speeds.push(dataView.getFloat64(offset, true));
        offset += 8;
      }
      
      // Read heading array (in vessel coordinates)
      const headings = [];
      for (let i = 0; i < numHeadings; i++) {
        headings.push(dataView.getFloat64(offset, true));
        offset += 8;
      }
      
      // Read roll angle matrix [speed][heading]
      const rollMatrix = [];
      for (let i = 0; i < numSpeeds; i++) {
        const row = [];
        for (let j = 0; j < numHeadings; j++) {
          row.push(dataView.getFloat64(offset, true));
          offset += 8;
        }
        rollMatrix.push(row);
      }
      
      // Extract fitted values from filename
      // Filename format: MAXROLL_H{value}_T{value}.bpolar
      const filenameMatch = filePath.match(/_H([\d.]+)_T([\d.]+)/);
      const fittedHs = filenameMatch ? parseFloat(filenameMatch[1]) : parameters.hs;
      const fittedTz = filenameMatch ? parseFloat(filenameMatch[2]) : parameters.tz;
      
      return {
        success: true,
        data: {
          speeds,
          headings,
          rollMatrix,
          numSpeeds,
          numHeadings,
          numParameters
        },
        fittedGM: parameters.gm,
        fittedHs: fittedHs,
        fittedTz: fittedTz
      };
    } catch (error) {
      console.error('Error loading polar data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Interpolate roll angle for a given speed and heading
   */
  interpolateRollAngle(data, speed, heading) {
    const { speeds, headings, rollMatrix } = data;
    
    // Find surrounding speed indices
    let speedIdx1 = 0, speedIdx2 = speeds.length - 1;
    for (let i = 0; i < speeds.length - 1; i++) {
      if (speed >= speeds[i] && speed <= speeds[i + 1]) {
        speedIdx1 = i;
        speedIdx2 = i + 1;
        break;
      }
    }
    
    // Find surrounding heading indices
    let headingIdx1 = 0, headingIdx2 = 0;
    let minDiff = 360;
    
    for (let i = 0; i < headings.length; i++) {
      let diff = Math.abs(headings[i] - heading);
      if (diff > 180) diff = 360 - diff;
      
      if (diff < minDiff) {
        minDiff = diff;
        headingIdx1 = i;
      }
    }
    
    // Find second nearest heading
    minDiff = 360;
    for (let i = 0; i < headings.length; i++) {
      if (i === headingIdx1) continue;
      
      let diff = Math.abs(headings[i] - heading);
      if (diff > 180) diff = 360 - diff;
      
      if (diff < minDiff) {
        minDiff = diff;
        headingIdx2 = i;
      }
    }
    
    // Bilinear interpolation
    const speedFactor = speeds[speedIdx2] > speeds[speedIdx1] ?
      (speed - speeds[speedIdx1]) / (speeds[speedIdx2] - speeds[speedIdx1]) : 0;
    
    const v1 = rollMatrix[speedIdx1][headingIdx1] * (1 - speedFactor) + 
               rollMatrix[speedIdx2][headingIdx1] * speedFactor;
    const v2 = rollMatrix[speedIdx1][headingIdx2] * (1 - speedFactor) + 
               rollMatrix[speedIdx2][headingIdx2] * speedFactor;
    
    return (v1 + v2) / 2;
  }
}