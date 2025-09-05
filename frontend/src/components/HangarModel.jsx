import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const HangarModel = ({ config }) => {
  const hangarGeometry = useMemo(() => {
    const group = new THREE.Group();
    
    // Hangar dimensions from config
    const width = config.dimensions.width || 18.49;
    const depth = config.dimensions.depth || 12;
    const height = config.dimensions.height || 6;
    const baseHeight = 0.5;

    // Base/Foundation
    const baseGeometry = new THREE.BoxGeometry(width + 1, baseHeight, depth + 1);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: '#e2e8f0' });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = baseHeight / 2;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Main structure walls
    const wallThickness = 0.1;
    
    // Front and back walls
    const frontWallGeometry = new THREE.BoxGeometry(width, height, wallThickness);
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: '#cbd5e0',
      transparent: true,
      opacity: 0.9
    });
    
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, height / 2 + baseHeight, depth / 2);
    frontWall.castShadow = true;
    group.add(frontWall);

    const backWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    backWall.position.set(0, height / 2 + baseHeight, -depth / 2);
    backWall.castShadow = true;
    group.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, height, depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-width / 2, height / 2 + baseHeight, 0);
    leftWall.castShadow = true;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(width / 2, height / 2 + baseHeight, 0);
    rightWall.castShadow = true;
    group.add(rightWall);

    // Corrugated siding panels
    for (let i = 0; i < config.panels.count; i++) {
      const panelWidth = width / config.panels.count;
      const panelGeometry = new THREE.PlaneGeometry(panelWidth - 0.05, height);
      const panelMaterial = new THREE.MeshLambertMaterial({ 
        color: config.panels.color,
        side: THREE.DoubleSide
      });
      
      // Front panels
      const frontPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      frontPanel.position.set(
        (i - config.panels.count / 2 + 0.5) * panelWidth,
        height / 2 + baseHeight,
        depth / 2 + 0.01
      );
      group.add(frontPanel);

      // Back panels
      const backPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      backPanel.position.set(
        (i - config.panels.count / 2 + 0.5) * panelWidth,
        height / 2 + baseHeight,
        -depth / 2 - 0.01
      );
      backPanel.rotation.y = Math.PI;
      group.add(backPanel);
    }

    // Roof structure
    if (config.roof.type === 'pitched') {
      const roofGeometry = new THREE.ConeGeometry(width * 0.7, 2, 4);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: '#4a5568' });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = height + baseHeight + 1;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      group.add(roof);
    } else {
      // Flat roof
      const roofGeometry = new THREE.BoxGeometry(width, 0.2, depth);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: '#4a5568' });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = height + baseHeight + 0.1;
      roof.castShadow = true;
      group.add(roof);
    }

    // Add door if configured
    if (config.openings.door.enabled) {
      const doorGeometry = new THREE.PlaneGeometry(
        config.openings.door.width,
        config.openings.door.height
      );
      const doorMaterial = new THREE.MeshLambertMaterial({ 
        color: '#8b5cf6',
        transparent: true,
        opacity: 0.7
      });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(
        config.openings.door.x,
        config.openings.door.height / 2 + baseHeight,
        depth / 2 + 0.02
      );
      group.add(door);
    }

    return group;
  }, [config]);

  return <primitive object={hangarGeometry} />;
};