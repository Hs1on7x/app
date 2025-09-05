export const mockHangarConfig = {
  dimensions: {
    width: 18.49,
    depth: 12,
    height: 6
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
    count: 16,
    color: '#cbd5e0',
    type: 'corrugated'
  },
  roof: {
    type: 'pitched', // 'flat' or 'pitched'
    material: 'metal',
    color: '#4a5568'
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