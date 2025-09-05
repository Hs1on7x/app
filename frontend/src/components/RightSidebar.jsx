import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

export const RightSidebar = ({ config, onConfigChange }) => {
  const handleVisualizationChange = (key, value) => {
    onConfigChange({
      ...config,
      visualization: {
        ...config.visualization,
        [key]: value
      }
    });
  };

  const handleDimensionChange = (key, value) => {
    onConfigChange({
      ...config,
      dimensions: {
        ...config.dimensions,
        [key]: value[0]
      }
    });
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-medium text-sm">Visualization</h3>
      </div>

      {/* Visualization Controls */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Visualization Options */}
          {[
            { key: 'edges', label: 'Edges' },
            { key: 'faces', label: 'Faces' },
            { key: 'mainParts', label: 'Main parts' },
            { key: 'dimensions', label: 'Dimensions' },
            { key: 'panels', label: 'Panels' },
            { key: 'solidWalls', label: 'Solid walls' },
            { key: 'openings', label: 'Openings' },
            { key: 'frames', label: 'Frames' },
            { key: 'purlins', label: 'Purlins' },
            { key: 'girts', label: 'Girts' },
            { key: 'flashing', label: 'Flashing' },
            { key: 'accessories', label: 'Accessories' },
            { key: 'basePlate', label: 'Base plate' },
            { key: 'volumes', label: 'Volumes' },
            { key: 'roads', label: 'Roads' },
            { key: 'decorations', label: 'Decorations' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-1">
              <Label htmlFor={item.key} className="text-sm text-gray-300">
                {item.label}
              </Label>
              <Switch
                id={item.key}
                checked={config.visualization[item.key] || false}
                onCheckedChange={(checked) => handleVisualizationChange(item.key, checked)}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Dimensions Controls */}
        <Card className="m-4 p-4 bg-gray-700 border-gray-600">
          <h4 className="font-medium text-sm mb-4">Dimensions</h4>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-400">Width (m)</Label>
              <Slider
                value={[config.dimensions.width]}
                onValueChange={(value) => handleDimensionChange('width', value)}
                min={10}
                max={30}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-gray-400">{config.dimensions.width}m</span>
            </div>
            
            <div>
              <Label className="text-xs text-gray-400">Depth (m)</Label>
              <Slider
                value={[config.dimensions.depth]}
                onValueChange={(value) => handleDimensionChange('depth', value)}
                min={8}
                max={20}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-gray-400">{config.dimensions.depth}m</span>
            </div>
            
            <div>
              <Label className="text-xs text-gray-400">Height (m)</Label>
              <Slider
                value={[config.dimensions.height]}
                onValueChange={(value) => handleDimensionChange('height', value)}
                min={4}
                max={12}
                step={0.1}
                className="mt-2"
              />
              <span className="text-xs text-gray-400">{config.dimensions.height}m</span>
            </div>
          </div>
        </Card>

        {/* Panel Configuration */}
        <Card className="m-4 p-4 bg-gray-700 border-gray-600">
          <h4 className="font-medium text-sm mb-4">Panels</h4>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-400">Panel Count</Label>
              <Slider
                value={[config.panels.count]}
                onValueChange={(value) => onConfigChange({
                  ...config,
                  panels: { ...config.panels, count: value[0] }
                })}
                min={8}
                max={24}
                step={1}
                className="mt-2"
              />
              <span className="text-xs text-gray-400">{config.panels.count} panels</span>
            </div>
            
            <div>
              <Label className="text-xs text-gray-400">Panel Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {['#e2e8f0', '#cbd5e0', '#a0aec0', '#718096'].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => onConfigChange({
                      ...config,
                      panels: { ...config.panels, color }
                    })}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};