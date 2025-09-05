import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { HangarModel } from './HangarModel';
import { Card } from './ui/card';

export const HangarViewer = ({ config, onConfigChange }) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-blue-100 to-green-100">
      <Canvas
        camera={{ 
          position: [15, 10, 15], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        shadows
        className="bg-gradient-to-b from-sky-200 to-green-200"
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 20, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <HangarModel config={config} />
          
          {/* Ground/Floor - solid color instead of grid */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshLambertMaterial color="#99af55" />
          </mesh>
          
          <Environment preset="dawn" />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={100}
          />
        </Suspense>
      </Canvas>

      {/* 3D Navigation Controls */}
      <Card className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">3D</div>
          <span className="text-gray-600">+Y +Y +X X -Z</span>
        </div>
      </Card>

      {/* View Controls */}
      <div className="absolute top-4 right-20 flex gap-2">
        <button className="p-2 bg-white/90 backdrop-blur-sm rounded hover:bg-white transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
          </svg>
        </button>
        <button className="p-2 bg-white/90 backdrop-blur-sm rounded hover:bg-white transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>
    </div>
  );
};