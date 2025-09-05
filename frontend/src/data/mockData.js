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
    dimensions: false,
    panels: true,
    solidWalls: true,
    openings: true,
    frames: false,
    purlins: false,
    girts: false,
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
  openings: {
    door: {
      enabled: true,
      width: 2.5,
      height: 3,
      x: 0,
      y: 0
    },
    windows: []
  },
  structure: {
    frameSpacing: 6,
    foundationType: 'concrete',
    frameType: 'rigid'
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