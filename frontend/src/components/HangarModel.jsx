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

    // Triangular Steel Frames (Primary Structure) - only if frames enabled
    if (config.visualization.frames) {
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
        
        // Triangular roof frame (Duo Pitch)
        if (config.roof.type === 'duo-pitch') {
          // Left rafter
          const rafterLength = Math.sqrt((width / 2) ** 2 + ridgeHeight ** 2);
          const rafterAngle = Math.atan(ridgeHeight / (width / 2));
          
          const leftRafterGeometry = new THREE.BoxGeometry(rafterLength, 0.4, 0.4);
          const leftRafter = new THREE.Mesh(leftRafterGeometry, primaryMaterial);
          leftRafter.position.set(-width / 4, height + baseHeight + ridgeHeight / 2, frameZ);
          leftRafter.rotation.z = -rafterAngle;
          group.add(leftRafter);
          
          // Right rafter
          const rightRafter = new THREE.Mesh(leftRafterGeometry, primaryMaterial);
          rightRafter.position.set(width / 4, height + baseHeight + ridgeHeight / 2, frameZ);
          rightRafter.rotation.z = rafterAngle;
          group.add(rightRafter);
          
          // Ridge beam
          const ridgeGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
          const ridge = new THREE.Mesh(ridgeGeometry, primaryMaterial);
          ridge.position.set(0, height + baseHeight + ridgeHeight, frameZ);
          group.add(ridge);
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
      
      for (let i = 0; i < frameCount - 1; i++) {
        const frameZ1 = -depth / 2 + (i * frameSpacing);
        const frameZ2 = -depth / 2 + ((i + 1) * frameSpacing);
        const bracingZ = (frameZ1 + frameZ2) / 2;
        
        // Left side X-bracing
        const leftBracingLength = Math.sqrt(frameSpacing ** 2 + height ** 2);
        const leftBracingAngle = Math.atan(height / frameSpacing);
        
        // Left diagonal 1 (bottom to top)
        const leftBrace1 = new THREE.Mesh(
          new THREE.BoxGeometry(leftBracingLength, 0.15, 0.15),
          bracingMaterial
        );
        leftBrace1.position.set(-width / 2, height / 2 + baseHeight, bracingZ);
        leftBrace1.rotation.x = leftBracingAngle;
        group.add(leftBrace1);
        
        // Left diagonal 2 (top to bottom)
        const leftBrace2 = new THREE.Mesh(
          new THREE.BoxGeometry(leftBracingLength, 0.15, 0.15),
          bracingMaterial
        );
        leftBrace2.position.set(-width / 2, height / 2 + baseHeight, bracingZ);
        leftBrace2.rotation.x = -leftBracingAngle;
        group.add(leftBrace2);
        
        // Right side X-bracing
        const rightBrace1 = new THREE.Mesh(
          new THREE.BoxGeometry(leftBracingLength, 0.15, 0.15),
          bracingMaterial
        );
        rightBrace1.position.set(width / 2, height / 2 + baseHeight, bracingZ);
        rightBrace1.rotation.x = leftBracingAngle;
        group.add(rightBrace1);
        
        const rightBrace2 = new THREE.Mesh(
          new THREE.BoxGeometry(leftBracingLength, 0.15, 0.15),
          bracingMaterial
        );
        rightBrace2.position.set(width / 2, height / 2 + baseHeight, bracingZ);
        rightBrace2.rotation.x = -leftBracingAngle;
        group.add(rightBrace2);
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

    // Purlins (Horizontal roof supports aligned with roof slope) - only if purlins enabled
    if (config.visualization.purlins && config.roof.type === 'duo-pitch') {
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

    // Structural frames (only if frames enabled)
    if (config.visualization.frames) {
      const frameSpacing = config.structure.frameSpacing || 6;
      const frameCount = Math.floor(depth / frameSpacing) + 1;
      
      for (let i = 0; i < frameCount; i++) {
        const frameZ = -depth / 2 + (i * frameSpacing);
        
        // Vertical columns
        const columnGeometry = new THREE.BoxGeometry(0.3, height, 0.3);
        let frameMaterial;
        if (config.visualization.faces) {
          frameMaterial = new THREE.MeshLambertMaterial({ color: '#2d3748' });
        } else {
          frameMaterial = new THREE.MeshBasicMaterial({ 
            color: '#2d3748',
            wireframe: config.visualization.edges
          });
        }
        
        // Left column
        const leftColumn = new THREE.Mesh(columnGeometry, frameMaterial);
        leftColumn.position.set(-width / 2, height / 2 + baseHeight, frameZ);
        group.add(leftColumn);
        
        // Right column  
        const rightColumn = new THREE.Mesh(columnGeometry, frameMaterial);
        rightColumn.position.set(width / 2, height / 2 + baseHeight, frameZ);
        group.add(rightColumn);
        
        // Horizontal beam
        const beamGeometry = new THREE.BoxGeometry(width, 0.4, 0.3);
        const beam = new THREE.Mesh(beamGeometry, frameMaterial);
        beam.position.set(0, height + baseHeight, frameZ);
        group.add(beam);
      }
    }

    // Purlins (horizontal roof supports) - only if purlins enabled
    if (config.visualization.purlins && config.roof.type === 'duo-pitch') {
      const purlinCount = Math.floor(width / 3); // Every 3 meters
      for (let i = 0; i <= purlinCount; i++) {
        const purlinX = -width / 2 + (i * (width / purlinCount));
        const purlinGeometry = new THREE.BoxGeometry(0.2, 0.2, depth);
        const purlinMaterial = new THREE.MeshLambertMaterial({ color: '#4a5568' });
        const purlin = new THREE.Mesh(purlinGeometry, purlinMaterial);
        purlin.position.set(purlinX, height + baseHeight + 1, 0);
        group.add(purlin);
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