/**
 * Polar Calculations Service
 * Utility functions for polar coordinate transformations and calculations
 */

export class PolarCalculations {
  
  /**
   * Convert angle from degrees to radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert angle from radians to degrees
   */
  static toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Normalize angle to 0-360 range
   */
  static normalizeAngle(angle) {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
  }

  /**
   * Calculate angle difference (shortest path)
   */
  static angleDifference(angle1, angle2) {
    let diff = angle2 - angle1;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  }

  /**
   * Convert vessel coordinates to North-up display coordinates
   * @param {number} vesselAngle - Angle in vessel coordinates (0 = bow)
   * @param {number} vesselHeading - Vessel heading (degrees from North)
   * @returns {number} - Display angle (degrees from North, clockwise)
   */
  static toNorthUp(vesselAngle, vesselHeading) {
    let displayAngle = 180 + (vesselHeading - vesselAngle);
    return this.normalizeAngle(displayAngle);
  }

  /**
   * Convert vessel coordinates to Heads-up display coordinates
   * @param {number} vesselAngle - Angle in vessel coordinates
   * @returns {number} - Display angle relative to vessel heading
   */
  static toHeadsUp(vesselAngle) {
    let displayAngle = 180 - vesselAngle;
    return this.normalizeAngle(displayAngle);
  }

  /**
   * Convert wave direction for display
   * @param {number} waveDirection - Wave direction (meteorological convention)
   * @param {number} vesselHeading - Vessel heading
   * @param {string} mode - 'northup' or 'headsup'
   * @returns {number} - Display angle
   */
  static convertWaveDirection(waveDirection, vesselHeading, mode) {
    if (mode === 'northup') {
      return this.normalizeAngle(waveDirection);
    } else {
      return this.normalizeAngle(waveDirection - vesselHeading);
    }
  }

  /**
   * Bilinear interpolation for roll angle
   * @param {Array} data - 2D array of roll values [speed][heading]
   * @param {Array} speeds - Array of speed values
   * @param {Array} headings - Array of heading values
   * @param {number} targetSpeed - Target speed for interpolation
   * @param {number} targetHeading - Target heading for interpolation
   * @returns {number} - Interpolated roll angle
   */
  static interpolateRoll(data, speeds, headings, targetSpeed, targetHeading) {
    // Find surrounding speed indices
    let speedIdx1 = 0, speedIdx2 = speeds.length - 1;
    for (let i = 0; i < speeds.length - 1; i++) {
      if (targetSpeed >= speeds[i] && targetSpeed <= speeds[i + 1]) {
        speedIdx1 = i;
        speedIdx2 = i + 1;
        break;
      }
    }

    // Find surrounding heading indices (considering circular nature)
    let headingIdx1 = 0, headingIdx2 = 0;
    let minDiff = 360;

    for (let i = 0; i < headings.length; i++) {
      let diff = Math.abs(this.angleDifference(headings[i], targetHeading));
      if (diff < minDiff) {
        minDiff = diff;
        headingIdx1 = i;
      }
    }

    // Find second nearest heading
    minDiff = 360;
    for (let i = 0; i < headings.length; i++) {
      if (i === headingIdx1) continue;
      let diff = Math.abs(this.angleDifference(headings[i], targetHeading));
      if (diff < minDiff) {
        minDiff = diff;
        headingIdx2 = i;
      }
    }

    // Calculate interpolation factors
    const speedFactor = speeds[speedIdx2] > speeds[speedIdx1]
      ? (targetSpeed - speeds[speedIdx1]) / (speeds[speedIdx2] - speeds[speedIdx1])
      : 0;

    // Interpolate along speed dimension
    const v1 = data[speedIdx1][headingIdx1] * (1 - speedFactor) +
               data[speedIdx2][headingIdx1] * speedFactor;
    const v2 = data[speedIdx1][headingIdx2] * (1 - speedFactor) +
               data[speedIdx2][headingIdx2] * speedFactor;

    // Average the two heading values
    return (v1 + v2) / 2;
  }

  /**
   * Calculate polar coordinates from cartesian
   */
  static cartesianToPolar(x, y) {
    const r = Math.sqrt(x * x + y * y);
    const theta = Math.atan2(y, x);
    return { r, theta: this.toDegrees(theta) };
  }

  /**
   * Calculate cartesian coordinates from polar
   */
  static polarToCartesian(r, theta) {
    const rad = this.toRadians(theta);
    return {
      x: r * Math.cos(rad),
      y: r * Math.sin(rad)
    };
  }

  /**
   * Check if vessel is in danger zone
   * @param {number} rollAngle - Current roll angle
   * @param {number} maxAllowed - Maximum allowed roll angle
   * @returns {boolean} - True if in danger zone
   */
  static isInDangerZone(rollAngle, maxAllowed) {
    return rollAngle > maxAllowed;
  }

  /**
   * Get traffic light color based on roll angle
   * @param {number} rollAngle - Current roll angle
   * @param {number} maxAllowed - Maximum allowed roll angle
   * @returns {string} - Color: 'green', 'yellow', or 'red'
   */
  static getTrafficLightColor(rollAngle, maxAllowed) {
    if (rollAngle <= maxAllowed - 5) return 'green';
    if (rollAngle <= maxAllowed) return 'yellow';
    return 'red';
  }

  /**
   * Calculate average draft
   */
  static calculateAverageDraft(aftDraft, foreDraft) {
    return (aftDraft + foreDraft) / 2;
  }

  /**
   * Calculate distance between two parameter points (for finding closest match)
   */
  static parameterDistance(params1, params2, weights = { hs: 1, tz: 1, gm: 1 }) {
    const hsDistSq = Math.pow((params1.hs - params2.hs) * weights.hs, 2);
    const tzDistSq = Math.pow((params1.tz - params2.tz) * weights.tz, 2);
    const gmDistSq = Math.pow((params1.gm - params2.gm) * weights.gm, 2);
    
    return Math.sqrt(hsDistSq + tzDistSq + gmDistSq);
  }

  /**
   * Find closest value in array
   */
  static findClosestValue(array, target) {
    if (!array || array.length === 0) return null;
    
    let closest = array[0];
    let minDiff = Math.abs(array[0] - target);
    
    for (let i = 1; i < array.length; i++) {
      const diff = Math.abs(array[i] - target);
      if (diff < minDiff) {
        minDiff = diff;
        closest = array[i];
      }
    }
    
    return closest;
  }

  /**
   * Find closest index in array
   */
  static findClosestIndex(array, target) {
    if (!array || array.length === 0) return -1;
    
    let closestIdx = 0;
    let minDiff = Math.abs(array[0] - target);
    
    for (let i = 1; i < array.length; i++) {
      const diff = Math.abs(array[i] - target);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    
    return closestIdx;
  }

  /**
   * Generate contour levels for continuous plot
   */
  static generateContourLevels(maxValue, numLevels = 10) {
    const levels = [];
    const step = maxValue / numLevels;
    
    for (let i = 0; i <= numLevels; i++) {
      levels.push(i * step);
    }
    
    return levels;
  }

  /**
   * Get color for continuous plot based on value
   */
  static getContinuousColor(value, maxValue) {
    const ratio = Math.min(value / maxValue, 1);
    
    // Blue -> Cyan -> Green -> Yellow -> Orange -> Red
    if (ratio < 0.2) {
      const t = ratio / 0.2;
      return this.interpolateColor([13, 71, 161], [25, 118, 210], t);
    } else if (ratio < 0.4) {
      const t = (ratio - 0.2) / 0.2;
      return this.interpolateColor([25, 118, 210], [0, 188, 212], t);
    } else if (ratio < 0.6) {
      const t = (ratio - 0.4) / 0.2;
      return this.interpolateColor([0, 188, 212], [255, 235, 59], t);
    } else if (ratio < 0.8) {
      const t = (ratio - 0.6) / 0.2;
      return this.interpolateColor([255, 235, 59], [255, 152, 0], t);
    } else {
      const t = (ratio - 0.8) / 0.2;
      return this.interpolateColor([255, 152, 0], [244, 67, 54], t);
    }
  }

  /**
   * Interpolate between two RGB colors
   */
  static interpolateColor(color1, color2, factor) {
    const r = Math.round(color1[0] + (color2[0] - color1[0]) * factor);
    const g = Math.round(color1[1] + (color2[1] - color1[1]) * factor);
    const b = Math.round(color1[2] + (color2[2] - color1[2]) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Format angle for display
   */
  static formatAngle(angle) {
    return `${this.normalizeAngle(angle).toFixed(0)}°`;
  }

  /**
   * Format speed for display
   */
  static formatSpeed(speed) {
    return `${speed.toFixed(1)} kn`;
  }
}