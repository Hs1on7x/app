export const mockHangarConfig = {
  dimensions: {
    width: 52.00,
    depth: 36.00,
    height: 5.50 // eave height
  },
  visualization: {
    edges: true,
    faces: true,
    mainParts: true,
    buttons: false,
    dimensions: false,
    panels: true,
    solidWalls: true,
    openings: true,
    frames: true,
    bracing: true,
    purlins: true,
    girts: true,
    flashing: false,
    accessories: false,
    basePlate: true,
    volumes: false,
    roads: false,
    decorations: false
  },
  panels: {
    count: 20,
    color: '#cbd5e0',
    type: 'corrugated'
  },
  roof: {
    type: 'duo-pitch', // 'flat', 'duo-pitch', 'mono-pitch'
    pitch: 15, // degrees (converted from 1.00 x/12)
    slope: 1.00, // x/12 format
    material: 'metal',
    color: '#4a5568',
    overhang: 0.5, // meters
    gutterType: 'box',
    ridgeHeight: 2.5 // additional height at ridge
  },
  structure: {
    colors: {
      basePlate: '#9ca3af', // RAL 7035 equivalent
      primaryStructure: '#1e40af', // RAL 5012 equivalent (blue)
      secondaryStructure: '#6b7280', // RAL 5007 equivalent (gray)
      otherFrames: '#1e40af', // RAL 5012
      bracing: '#dc2626' // RAL 3003 (red)
    },
    frameSpacing: 6,
    foundationType: 'concrete',
    frameType: 'rigid'
  },
  openings: {
    door: {
      enabled: true,
      width: 2.5,
      height: 3,
      x: 0,
      y: 0
    },
    windows: []
  }
};

export const mockBuildingOptions = {
  purposes: [
    'Production hall',
    'Storage facility',
    'Workshop',
    'Agricultural building',
    'Warehouse'
  ],
  years: [
    '2025',
    '2024',
    '2023'
  ],
  findUsOptions: [
    'Google search',
    'Referral',
    'Social media',
    'Trade show',
    'Other'
  ]
};