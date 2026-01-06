const fs = window.require('fs');
const path = window.require('path');

export class FileSystemService {
  constructor() {
    // Determine base path for data files
    try {
      // Access global variables set by main process
      const remote = window.require('electron').remote;
      
      // For development: use current working directory
      // For production: use resources path
      if (remote) {
        const app = remote.app;
        this.basePath = app.isPackaged 
          ? path.join(process.resourcesPath, 'raw')
          : path.join(process.cwd(), 'raw');
      } else {
        // Fallback if remote is not available
        this.basePath = path.join(process.cwd(), 'raw');
      }
      
      console.log('FileSystem initialized with base path:', this.basePath);
      
      // Verify the path exists
      if (!fs.existsSync(this.basePath)) {
        console.warn('Base path does not exist:', this.basePath);
        console.log('Current working directory:', process.cwd());
        console.log('__dirname:', __dirname);
        
        // Try alternative paths
        const alternatives = [
          path.join(process.cwd(), 'raw'),
          path.join(__dirname, '..', '..', 'raw'),
          path.join(__dirname, '..', '..', 'public', 'raw')
        ];
        
        for (const altPath of alternatives) {
          if (fs.existsSync(altPath)) {
            console.log('Found alternative path:', altPath);
            this.basePath = altPath;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error initializing FileSystem:', error);
      // Fallback to current directory
      this.basePath = path.join(process.cwd(), 'raw');
    }
  }

  readBinaryFile(filePath) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      console.log('Reading file:', fullPath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      
      return fs.readFileSync(fullPath);
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  readTextFile(filePath) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      console.log('Reading text file:', fullPath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      
      return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      console.error('Error reading text file:', error);
      throw error;
    }
  }

  listDirectory(dirPath) {
    try {
      const fullPath = path.join(this.basePath, dirPath);
      console.log('Listing directory:', fullPath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Directory not found: ${fullPath}`);
      }
      
      return fs.readdirSync(fullPath);
    } catch (error) {
      console.error('Error listing directory:', error);
      throw error;
    }
  }

  fileExists(filePath) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      return fs.existsSync(fullPath);
    } catch (error) {
      return false;
    }
  }

  directoryExists(dirPath) {
    try {
      const fullPath = path.join(this.basePath, dirPath);
      return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
    } catch (error) {
      return false;
    }
  }

  getBasePath() {
    return this.basePath;
  }

  // Helper to list all available data folders for debugging
  debugListStructure() {
    try {
      console.log('=== File Structure Debug ===');
      console.log('Base path:', this.basePath);
      
      if (fs.existsSync(this.basePath)) {
        const items = fs.readdirSync(this.basePath);
        console.log('Items in base path:', items);
        
        items.forEach(item => {
          const itemPath = path.join(this.basePath, item);
          const stats = fs.statSync(itemPath);
          console.log(`  ${item}: ${stats.isDirectory() ? 'DIR' : 'FILE'}`);
        });
      } else {
        console.log('Base path does not exist!');
      }
      console.log('===========================');
    } catch (error) {
      console.error('Error in debug:', error);
    }
  }
}