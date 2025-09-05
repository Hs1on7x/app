import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const HangarModel = ({ config }) => {
  const hangarGeometry = useMemo(() => {
    const group = new THREE.Group();
    
    // Hangar dimensions from config
    const width = config.dimensions.width || 52.00;
    const depth = config.dimensions.depth || 36.00;
    const height = config.dimensions.height || 5.50; // eave height
    const baseHeight = 0.5;

    // Base/Foundation (only if enabled)
    if (config.visualization.basePlate) {
      const baseGeometry = new THREE.BoxGeometry(width + 1, baseHeight, depth + 1);
      const baseMaterial = new THREE.MeshLambertMaterial({ color: '#e2e8f0' });
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.position.y = baseHeight / 2;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);
    }

    // Main structure walls (only if solidWalls enabled)
    if (config.visualization.solidWalls) {
      const wallThickness = 0.2;
      
      // Wall material with edges or faces
      let wallMaterial;
      if (config.visualization.faces) {
        wallMaterial = new THREE.MeshLambertMaterial({ 
          color: '#cbd5e0',
          transparent: true,
          opacity: 0.9
        });
      } else {
        wallMaterial = new THREE.MeshBasicMaterial({ 
          color: '#cbd5e0',
          wireframe: config.visualization.edges,
          transparent: true,
          opacity: 0.7
        });
      }
      
      // Front and back walls
      const frontWallGeometry = new THREE.BoxGeometry(width, height, wallThickness);
      
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
    }

    // Corrugated siding panels (only if panels enabled)
    if (config.visualization.panels) {
      for (let i = 0; i < config.panels.count; i++) {
        const panelWidth = width / config.panels.count;
        const panelGeometry = new THREE.PlaneGeometry(panelWidth - 0.05, height);
        
        let panelMaterial;
        if (config.visualization.faces) {
          panelMaterial = new THREE.MeshLambertMaterial({ 
            color: config.panels.color,
            side: THREE.DoubleSide
          });
        } else {
          panelMaterial = new THREE.MeshBasicMaterial({ 
            color: config.panels.color,
            wireframe: config.visualization.edges,
            side: THREE.DoubleSide
          });
        }
        
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
    }

    // Roof structure - Duo Pitch
    if (config.roof.type === 'duo-pitch') {
      const roofPitchRad = (config.roof.pitch * Math.PI) / 180;
      const ridgeHeight = config.roof.ridgeHeight || 2.5;
      const overhang = config.roof.overhang || 0.5;
      
      // Create duo pitch roof geometry
      const roofGeometry = new THREE.BufferGeometry();
      const roofVertices = [];
      const roofIndices = [];
      
      // Roof dimensions with overhang
      const roofWidth = width + (overhang * 2);
      const roofDepth = depth + (overhang * 2);
      
      // Define roof vertices (duo pitch creates a ridge down the center)
      // Ridge line runs along the width direction
      const ridgeY = height + baseHeight + ridgeHeight;
      const eaveY = height + baseHeight;
      
      // Front slope vertices
      roofVertices.push(
        // Ridge line
        -roofWidth / 2, ridgeY, -roofDepth / 2,  // 0
        roofWidth / 2, ridgeY, -roofDepth / 2,   // 1
        
        // Front eave
        -roofWidth / 2, eaveY, -roofDepth / 2 - Math.tan(roofPitchRad) * ridgeHeight,  // 2
        roofWidth / 2, eaveY, -roofDepth / 2 - Math.tan(roofPitchRad) * ridgeHeight   // 3
      );
      
      // Back slope vertices  
      roofVertices.push(
        // Ridge line (same as front)
        -roofWidth / 2, ridgeY, roofDepth / 2,   // 4
        roofWidth / 2, ridgeY, roofDepth / 2,    // 5
        
        // Back eave
        -roofWidth / 2, eaveY, roofDepth / 2 + Math.tan(roofPitchRad) * ridgeHeight,   // 6
        roofWidth / 2, eaveY, roofDepth / 2 + Math.tan(roofPitchRad) * ridgeHeight     // 7
      );
      
      // Define triangles for both roof slopes
      roofIndices.push(
        // Front slope
        0, 2, 1,  1, 2, 3,
        // Back slope  
        4, 5, 6,  5, 7, 6,
        // Left gable end
        0, 4, 2,  4, 6, 2,
        // Right gable end
        1, 3, 5,  3, 7, 5
      );
      
      roofGeometry.setIndex(roofIndices);
      roofGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roofVertices, 3));
      roofGeometry.computeVertexNormals();
      
      const roofMaterial = new THREE.MeshLambertMaterial({ 
        color: config.roof.color,
        side: THREE.DoubleSide 
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.castShadow = true;
      roof.receiveShadow = true;
      group.add(roof);
      
      // Add ridge cap
      const ridgeGeometry = new THREE.BoxGeometry(roofWidth, 0.1, 0.2);
      const ridgeMaterial = new THREE.MeshLambertMaterial({ color: '#2d3748' });
      const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
      ridge.position.y = ridgeY + 0.05;
      ridge.castShadow = true;
      group.add(ridge);
      
    } else if (config.roof.type === 'flat') {
      // Flat roof
      const roofGeometry = new THREE.BoxGeometry(width, 0.2, depth);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: '#4a5568' });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = height + baseHeight + 0.1;
      roof.castShadow = true;
      group.add(roof);
    }

    // Gable ends for duo-pitch roof
    if (config.roof.type === 'duo-pitch') {
      const roofPitchRad = (config.roof.pitch * Math.PI) / 180;
      const ridgeHeight = config.roof.ridgeHeight || 2.5;
      
      // Front gable end
      const frontGableGeometry = new THREE.BufferGeometry();
      const gableVertices = [
        // Triangle for gable end
        -width / 2, height + baseHeight, 0,  // bottom left
        width / 2, height + baseHeight, 0,   // bottom right  
        0, height + baseHeight + ridgeHeight, 0  // top peak
      ];
      
      frontGableGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gableVertices, 3));
      frontGableGeometry.setIndex([0, 1, 2]);
      frontGableGeometry.computeVertexNormals();
      
      const gableMaterial = new THREE.MeshLambertMaterial({ 
        color: config.panels.color,
        side: THREE.DoubleSide 
      });
      
      const frontGable = new THREE.Mesh(frontGableGeometry, gableMaterial);
      frontGable.position.z = depth / 2;
      group.add(frontGable);
      
      // Back gable end
      const backGable = new THREE.Mesh(frontGableGeometry, gableMaterial);
      backGable.position.z = -depth / 2;
      backGable.rotation.y = Math.PI;
      group.add(backGable);
    }

    // Structural frames (if enabled)
    if (config.visualization.frames) {
      const frameSpacing = config.structure.frameSpacing || 6;
      const frameCount = Math.floor(depth / frameSpacing) + 1;
      
      for (let i = 0; i < frameCount; i++) {
        const frameZ = -depth / 2 + (i * frameSpacing);
        
        // Vertical columns
        const columnGeometry = new THREE.BoxGeometry(0.2, height, 0.2);
        const frameMaterial = new THREE.MeshLambertMaterial({ color: '#2d3748' });
        
        // Left column
        const leftColumn = new THREE.Mesh(columnGeometry, frameMaterial);
        leftColumn.position.set(-width / 2, height / 2 + baseHeight, frameZ);
        group.add(leftColumn);
        
        // Right column  
        const rightColumn = new THREE.Mesh(columnGeometry, frameMaterial);
        rightColumn.position.set(width / 2, height / 2 + baseHeight, frameZ);
        group.add(rightColumn);
        
        // Horizontal beam
        const beamGeometry = new THREE.BoxGeometry(width, 0.3, 0.2);
        const beam = new THREE.Mesh(beamGeometry, frameMaterial);
        beam.position.set(0, height + baseHeight, frameZ);
        group.add(beam);
      }
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