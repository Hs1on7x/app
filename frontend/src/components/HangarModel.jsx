import React, { useMemo } from 'react';
import * as THREE from 'three';

export const HangarModel = ({ config }) => {
  const hangarGeometry = useMemo(() => {
    const group = new THREE.Group();
    
    // Hangar dimensions from config
    const width = config.dimensions.width || 52.00;
    const depth = config.dimensions.depth || 36.00;
    const height = config.dimensions.height || 5.50; // eave height
    const baseHeight = 0.3;
    const frameSpacing = config.structure.frameSpacing || 6;
    const ridgeHeight = config.roof.ridgeHeight || 2.5;

    // Helper function for material creation based on visualization settings
    const createMaterial = (color, isStructural = false) => {
      if (!config.visualization.faces && config.visualization.edges) {
        return new THREE.MeshBasicMaterial({ 
          color: color,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        });
      } else if (config.visualization.faces) {
        return new THREE.MeshLambertMaterial({ 
          color: color,
          transparent: isStructural ? false : true,
          opacity: isStructural ? 1.0 : 0.9
        });
      } else {
        return new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: true,
          opacity: 0.3
        });
      }
    };

    // Base plates and foundation (only if basePlate enabled)
    if (config.visualization.basePlate) {
      const baseGeometry = new THREE.BoxGeometry(width + 2, baseHeight, depth + 2);
      const baseMaterial = createMaterial(config.structure.colors.basePlate);
      const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
      baseMesh.position.y = baseHeight / 2;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Individual base plates under columns
      const frameCount = Math.floor(depth / frameSpacing) + 1;
      for (let i = 0; i < frameCount; i++) {
        const frameZ = -depth / 2 + (i * frameSpacing);
        
        // Left base plate
        const leftBasePlate = new THREE.Mesh(
          new THREE.BoxGeometry(1, baseHeight * 0.8, 1),
          createMaterial(config.structure.colors.basePlate, true)
        );
        leftBasePlate.position.set(-width / 2, baseHeight * 0.4, frameZ);
        group.add(leftBasePlate);
        
        // Right base plate
        const rightBasePlate = new THREE.Mesh(
          new THREE.BoxGeometry(1, baseHeight * 0.8, 1),
          createMaterial(config.structure.colors.basePlate, true)
        );
        rightBasePlate.position.set(width / 2, baseHeight * 0.4, frameZ);
        group.add(rightBasePlate);
      }
    }

    // Triangular Steel Frames (Primary Structure) - controlled by mainParts
    if (config.visualization.mainParts) {
      const frameCount = Math.floor(depth / frameSpacing) + 1;
      const primaryMaterial = createMaterial(config.structure.colors.primaryStructure, true);
      
      for (let i = 0; i < frameCount; i++) {
        const frameZ = -depth / 2 + (i * frameSpacing);
        
        // Left column
        const leftColumnGeometry = new THREE.BoxGeometry(0.4, height, 0.4);
        const leftColumn = new THREE.Mesh(leftColumnGeometry, primaryMaterial);
        leftColumn.position.set(-width / 2, height / 2 + baseHeight, frameZ);
        leftColumn.castShadow = true;
        group.add(leftColumn);
        
        // Right column
        const rightColumn = new THREE.Mesh(leftColumnGeometry, primaryMaterial);
        rightColumn.position.set(width / 2, height / 2 + baseHeight, frameZ);
        rightColumn.castShadow = true;
        group.add(rightColumn);
        
        // Triangular roof frame (Duo Pitch) - properly oriented to align with Main parts roof
        if (config.roof.type === 'duo-pitch') {
          const rafterLength = Math.sqrt((width / 2) ** 2 + ridgeHeight ** 2);
          const rafterAngle = Math.atan(ridgeHeight / (width / 2));
          
          // Left rafter - correctly positioned from eave to ridge
          const leftRafterGeometry = new THREE.BoxGeometry(rafterLength, 0.4, 0.4);
          const leftRafter = new THREE.Mesh(leftRafterGeometry, primaryMaterial);
          
          // Position from left eave to ridge peak
          const leftRafterCenterX = -width / 4;
          const leftRafterCenterY = height + baseHeight + (ridgeHeight / 2);
          
          leftRafter.position.set(leftRafterCenterX, leftRafterCenterY, frameZ);
          leftRafter.rotation.z = rafterAngle; // Positive angle for left side
          group.add(leftRafter);
          
          // Right rafter - correctly positioned from eave to ridge  
          const rightRafterGeometry = new THREE.BoxGeometry(rafterLength, 0.4, 0.4);
          const rightRafter = new THREE.Mesh(rightRafterGeometry, primaryMaterial);
          
          // Position from right eave to ridge peak
          const rightRafterCenterX = width / 4;
          const rightRafterCenterY = height + baseHeight + (ridgeHeight / 2);
          
          rightRafter.position.set(rightRafterCenterX, rightRafterCenterY, frameZ);
          rightRafter.rotation.z = -rafterAngle; // Negative angle for right side
          group.add(rightRafter);
          
          // Ridge beam at the peak
          const ridgeBeamGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
          const ridgeBeam = new THREE.Mesh(ridgeBeamGeometry, primaryMaterial);
          ridgeBeam.position.set(0, height + baseHeight + ridgeHeight, frameZ);
          group.add(ridgeBeam);
        }
        
        // Horizontal tie beam
        const tieBeamGeometry = new THREE.BoxGeometry(width, 0.4, 0.4);
        const tieBeam = new THREE.Mesh(tieBeamGeometry, primaryMaterial);
        tieBeam.position.set(0, height + baseHeight - 0.2, frameZ);
        group.add(tieBeam);
      }
    }

    // X-Bracing between frames (only if bracing enabled)
    if (config.visualization.bracing) {
      const bracingMaterial = createMaterial(config.structure.colors.bracing, true);
      const frameCount = Math.floor(depth / frameSpacing) + 1;
      
    // Enhanced Bracing System - 5 horizontal braces between each frame (only if bracing enabled)
    if (config.visualization.bracing) {
      const bracingMaterial = createMaterial(config.structure.colors.bracing, true);
      const frameCount = Math.floor(depth / frameSpacing) + 1;
      
      for (let i = 0; i < frameCount - 1; i++) {
        const frameZ1 = -depth / 2 + (i * frameSpacing);
        const frameZ2 = -depth / 2 + ((i + 1) * frameSpacing);
        
        // Create 5 horizontal bracing elements between each pair of frames
        for (let braceLevel = 1; braceLevel <= 5; braceLevel++) {
          const braceY = baseHeight + (braceLevel * height / 6); // Distribute 5 braces evenly in height
          
          // Left side horizontal bracing
          const leftBraceGeometry = new THREE.BoxGeometry(0.15, 0.15, frameSpacing);
          const leftBrace = new THREE.Mesh(leftBraceGeometry, bracingMaterial);
          leftBrace.position.set(-width / 2, braceY, (frameZ1 + frameZ2) / 2);
          group.add(leftBrace);
          
          // Right side horizontal bracing
          const rightBraceGeometry = new THREE.BoxGeometry(0.15, 0.15, frameSpacing);
          const rightBrace = new THREE.Mesh(rightBraceGeometry, bracingMaterial);
          rightBrace.position.set(width / 2, braceY, (frameZ1 + frameZ2) / 2);
          group.add(rightBrace);
        }
        
        // Add vertical connecting elements between the horizontal braces for structural appearance
        for (let side = 0; side < 2; side++) {
          const sideX = side === 0 ? -width / 2 : width / 2;
          
          // Create vertical connectors between horizontal braces
          for (let connector = 1; connector <= 4; connector++) {
            const connectorY1 = baseHeight + (connector * height / 6);
            const connectorY2 = baseHeight + ((connector + 1) * height / 6);
            const connectorHeight = connectorY2 - connectorY1;
            
            const verticalConnectorGeometry = new THREE.BoxGeometry(0.1, connectorHeight, 0.1);
            const verticalConnector = new THREE.Mesh(verticalConnectorGeometry, bracingMaterial);
            verticalConnector.position.set(sideX, (connectorY1 + connectorY2) / 2, frameZ1);
            group.add(verticalConnector);
            
            // Add connector at the second frame position too
            const verticalConnector2 = new THREE.Mesh(verticalConnectorGeometry, bracingMaterial);
            verticalConnector2.position.set(sideX, (connectorY1 + connectorY2) / 2, frameZ2);
            group.add(verticalConnector2);
          }
        }
      }
    }
    }

    // Girts (Horizontal wall supports) - only if girts enabled  
    if (config.visualization.girts) {
      const girtMaterial = createMaterial(config.structure.colors.secondaryStructure, true);
      const girtCount = 3; // Number of horizontal levels
      
      for (let level = 1; level <= girtCount; level++) {
        const girtY = baseHeight + (level * height / (girtCount + 1));
        
        // Front girts
        const frontGirtGeometry = new THREE.BoxGeometry(width, 0.2, 0.2);
        const frontGirt = new THREE.Mesh(frontGirtGeometry, girtMaterial);
        frontGirt.position.set(0, girtY, depth / 2);
        group.add(frontGirt);
        
        // Back girts
        const backGirt = new THREE.Mesh(frontGirtGeometry, girtMaterial);
        backGirt.position.set(0, girtY, -depth / 2);
        group.add(backGirt);
      }
    }

    // Purlins (Horizontal roof supports aligned with roof slope) - controlled by mainParts
    if (config.visualization.mainParts && config.roof.type === 'duo-pitch') {
      const purlinMaterial = createMaterial(config.structure.colors.secondaryStructure, true);
      const purlinSpacing = 3; // Every 3 meters along roof slope
      const roofSlope = ridgeHeight / (width / 2); // Calculate roof slope
      const rafterLength = Math.sqrt((width / 2) ** 2 + ridgeHeight ** 2);
      const rafterAngle = Math.atan(ridgeHeight / (width / 2));
      
      // Calculate number of purlins per side based on rafter length
      const purlinsPerSide = Math.floor(rafterLength / purlinSpacing);
      
      // Left side purlins (aligned with left roof slope)
      for (let i = 1; i <= purlinsPerSide; i++) {
        const distanceAlongRafter = (i * rafterLength) / (purlinsPerSide + 1);
        
        // Calculate position along the sloped roof
        const purlinX = -width / 2 + (distanceAlongRafter * Math.cos(rafterAngle));
        const purlinY = height + baseHeight + (distanceAlongRafter * Math.sin(rafterAngle));
        
        const purlinGeometry = new THREE.BoxGeometry(0.2, 0.2, depth);
        const leftPurlin = new THREE.Mesh(purlinGeometry, purlinMaterial);
        leftPurlin.position.set(purlinX, purlinY, 0);
        group.add(leftPurlin);
      }
      
      // Right side purlins (aligned with right roof slope)
      for (let i = 1; i <= purlinsPerSide; i++) {
        const distanceAlongRafter = (i * rafterLength) / (purlinsPerSide + 1);
        
        // Calculate position along the sloped roof
        const purlinX = width / 2 - (distanceAlongRafter * Math.cos(rafterAngle));
        const purlinY = height + baseHeight + (distanceAlongRafter * Math.sin(rafterAngle));
        
        const purlinGeometry = new THREE.BoxGeometry(0.2, 0.2, depth);
        const rightPurlin = new THREE.Mesh(purlinGeometry, purlinMaterial);
        rightPurlin.position.set(purlinX, purlinY, 0);
        group.add(rightPurlin);
      }
      
      // Ridge purlin at the peak
      const ridgePurlinGeometry = new THREE.BoxGeometry(0.2, 0.2, depth);
      const ridgePurlin = new THREE.Mesh(ridgePurlinGeometry, purlinMaterial);
      ridgePurlin.position.set(0, height + baseHeight + ridgeHeight, 0);
      group.add(ridgePurlin);
    }

    // Triangular Gable Roof (Duo Pitch) - matching reference image
    if (config.visualization.mainParts && config.roof.type === 'duo-pitch') {
      const roofPitchRad = (config.roof.pitch * Math.PI) / 180;
      const ridgeHeight = config.roof.ridgeHeight || 2.5;
      const overhang = config.roof.overhang || 0.5;
      
      // Create simple triangular roof geometry matching reference image
      const roofGeometry = new THREE.BufferGeometry();
      const roofVertices = [];
      const roofIndices = [];
      
      // Improved roof dimensions - centered on building
      const roofWidth = width + (overhang * 2);
      const roofDepth = depth + (overhang * 2);
      
      // Calculate roof geometry for isosceles triangle profile
      const ridgeY = height + baseHeight + ridgeHeight;
      const eaveY = height + baseHeight;
      
      // Create vertices for the triangular gable roof
      // Ridge line (peak) runs along the length of the building (Z-axis)
      roofVertices.push(
        // Ridge line vertices (peak of triangle)
        0, ridgeY, -roofDepth / 2,  // 0 - Front ridge peak
        0, ridgeY, roofDepth / 2,   // 1 - Back ridge peak
        
        // Left eave line (bottom left of triangle)
        -roofWidth / 2, eaveY, -roofDepth / 2,  // 2 - Front left eave
        -roofWidth / 2, eaveY, roofDepth / 2,   // 3 - Back left eave
        
        // Right eave line (bottom right of triangle)
        roofWidth / 2, eaveY, -roofDepth / 2,   // 4 - Front right eave
        roofWidth / 2, eaveY, roofDepth / 2     // 5 - Back right eave
      );
      
      // Define triangular roof faces
      roofIndices.push(
        // Left roof slope (triangle side)
        0, 2, 1,  1, 2, 3,
        // Right roof slope (triangle side)  
        0, 1, 4,  1, 5, 4
      );
      
      roofGeometry.setIndex(roofIndices);
      roofGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roofVertices, 3));
      roofGeometry.computeVertexNormals();
      
      // Create roof material based on visualization settings
      let roofMaterial;
      if (config.visualization.faces) {
        roofMaterial = new THREE.MeshLambertMaterial({ 
          color: config.roof.color || '#4a5568',
          side: THREE.DoubleSide 
        });
      } else {
        roofMaterial = new THREE.MeshBasicMaterial({ 
          color: config.roof.color || '#4a5568',
          wireframe: config.visualization.edges,
          side: THREE.DoubleSide 
        });
      }
      
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.castShadow = true;
      roof.receiveShadow = true;
      group.add(roof);
      
      // Add ridge cap along the peak
      const ridgeGeometry = new THREE.BoxGeometry(0.2, 0.15, roofDepth);
      const ridgeMaterial = new THREE.MeshLambertMaterial({ color: '#2d3748' });
      const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
      ridge.position.set(0, ridgeY + 0.075, 0);
      ridge.castShadow = true;
      group.add(ridge);
      
    } else if (config.visualization.mainParts && config.roof.type === 'flat') {
      // Flat roof
      const roofGeometry = new THREE.BoxGeometry(width, 0.2, depth);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: '#4a5568' });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = height + baseHeight + 0.1;
      roof.castShadow = true;
      group.add(roof);
    }

    // Gable ends for duo-pitch roof (only if panels enabled)
    if (config.visualization.panels && config.roof.type === 'duo-pitch') {
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
      
      let gableMaterial;
      if (config.visualization.faces) {
        gableMaterial = new THREE.MeshLambertMaterial({ 
          color: config.panels.color,
          side: THREE.DoubleSide 
        });
      } else {
        gableMaterial = new THREE.MeshBasicMaterial({ 
          color: config.panels.color,
          wireframe: config.visualization.edges,
          side: THREE.DoubleSide 
        });
      }
      
      const frontGable = new THREE.Mesh(frontGableGeometry, gableMaterial);
      frontGable.position.z = depth / 2;
      group.add(frontGable);
      
      // Back gable end
      const backGable = new THREE.Mesh(frontGableGeometry, gableMaterial);
      backGable.position.z = -depth / 2;
      backGable.rotation.y = Math.PI;
      group.add(backGable);
    }

    // Complete Wall Panels - Cover entire structure on sides (only if panels enabled)
    if (config.visualization.panels || config.visualization.solidWalls) {
      let wallPanelMaterial;
      if (config.visualization.faces) {
        wallPanelMaterial = new THREE.MeshLambertMaterial({ 
          color: config.panels.color || '#cbd5e0',
          side: THREE.DoubleSide 
        });
      } else {
        wallPanelMaterial = new THREE.MeshBasicMaterial({ 
          color: config.panels.color || '#cbd5e0',
          wireframe: config.visualization.edges,
          side: THREE.DoubleSide 
        });
      }

      // Left side wall panel - covers entire structure from ground to roof
      const leftWallGeometry = new THREE.BoxGeometry(0.05, height + ridgeHeight, depth);
      const leftWallPanel = new THREE.Mesh(leftWallGeometry, wallPanelMaterial);
      leftWallPanel.position.set(-width / 2 - 0.1, (height + ridgeHeight) / 2 + baseHeight, 0);
      leftWallPanel.castShadow = true;
      leftWallPanel.receiveShadow = true;
      group.add(leftWallPanel);

      // Right side wall panel - covers entire structure from ground to roof
      const rightWallGeometry = new THREE.BoxGeometry(0.05, height + ridgeHeight, depth);
      const rightWallPanel = new THREE.Mesh(rightWallGeometry, wallPanelMaterial);
      rightWallPanel.position.set(width / 2 + 0.1, (height + ridgeHeight) / 2 + baseHeight, 0);
      rightWallPanel.castShadow = true;
      rightWallPanel.receiveShadow = true;
      group.add(rightWallPanel);

      // Add vertical corrugation lines to simulate panel ribs
      const corrugationSpacing = 1.2; // Every 1.2 meters
      const corrugationCount = Math.floor(depth / corrugationSpacing);
      
      for (let i = 0; i <= corrugationCount; i++) {
        const corrugationZ = -depth / 2 + (i * corrugationSpacing);
        
        // Left side corrugation lines
        const leftCorrugationGeometry = new THREE.BoxGeometry(0.02, height + ridgeHeight, 0.02);
        const leftCorrugation = new THREE.Mesh(leftCorrugationGeometry, wallPanelMaterial);
        leftCorrugation.position.set(-width / 2 - 0.12, (height + ridgeHeight) / 2 + baseHeight, corrugationZ);
        group.add(leftCorrugation);
        
        // Right side corrugation lines  
        const rightCorrugationGeometry = new THREE.BoxGeometry(0.02, height + ridgeHeight, 0.02);
        const rightCorrugation = new THREE.Mesh(rightCorrugationGeometry, wallPanelMaterial);
        rightCorrugation.position.set(width / 2 + 0.12, (height + ridgeHeight) / 2 + baseHeight, corrugationZ);
        group.add(rightCorrugation);
      }
    }

    // Girts (horizontal wall supports) - only if girts enabled  
    if (config.visualization.girts) {
      const girtHeight = height / 3;
      for (let i = 1; i < 3; i++) {
        const girtY = baseHeight + (i * girtHeight);
        
        // Front and back girts
        const girtGeometry = new THREE.BoxGeometry(width, 0.2, 0.2);
        const girtMaterial = new THREE.MeshLambertMaterial({ color: '#4a5568' });
        
        const frontGirt = new THREE.Mesh(girtGeometry, girtMaterial);
        frontGirt.position.set(0, girtY, depth / 2);
        group.add(frontGirt);
        
        const backGirt = new THREE.Mesh(girtGeometry, girtMaterial);
        backGirt.position.set(0, girtY, -depth / 2);
        group.add(backGirt);
      }
    }
    // Add door if configured (only if openings enabled)
    if (config.visualization.openings && config.openings.door.enabled) {
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

    // Add dimensions display (only if dimensions enabled)
    if (config.visualization.dimensions) {
      // Add dimension lines and text - simplified for now
      const dimensionMaterial = new THREE.LineBasicMaterial({ color: '#ff0000' });
      
      // Width dimension line
      const widthPoints = [
        new THREE.Vector3(-width / 2, -0.5, depth / 2 + 2),
        new THREE.Vector3(width / 2, -0.5, depth / 2 + 2)
      ];
      const widthGeometry = new THREE.BufferGeometry().setFromPoints(widthPoints);
      const widthLine = new THREE.Line(widthGeometry, dimensionMaterial);
      group.add(widthLine);
      
      // Depth dimension line
      const depthPoints = [
        new THREE.Vector3(-width / 2 - 2, -0.5, -depth / 2),
        new THREE.Vector3(-width / 2 - 2, -0.5, depth / 2)
      ];
      const depthGeometry = new THREE.BufferGeometry().setFromPoints(depthPoints);
      const depthLine = new THREE.Line(depthGeometry, dimensionMaterial);
      group.add(depthLine);
    }

    return group;
  }, [config]);

  return <primitive object={hangarGeometry} />;
};