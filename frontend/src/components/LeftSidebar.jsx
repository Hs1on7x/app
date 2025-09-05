import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Building, Home, DoorOpen, Wrench, Quote } from 'lucide-react';

const sidebarItems = [
  { id: 'building', icon: Building, label: 'BUILDING', color: 'bg-blue-500' },
  { id: 'bays', icon: Home, label: 'BAYS', color: 'bg-blue-400' },
  { id: 'greeting', icon: Home, label: 'GREETING', color: 'bg-teal-400' },
  { id: 'openings', icon: DoorOpen, label: 'OPENINGS', color: 'bg-green-500' },
  { id: 'accessory', icon: Wrench, label: 'ACCESSORY', color: 'bg-blue-600' },
  { id: 'structure', icon: Building, label: 'STRUCTURE', color: 'bg-blue-700' },
  { id: 'quote', icon: Quote, label: 'QUOTE', color: 'bg-orange-500' },
];

export const LeftSidebar = ({ activeSection, onSectionChange, config, onConfigChange }) => {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <div key={item.id} className="px-2 mb-2">
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`w-full h-12 flex flex-col items-center justify-center p-1 text-xs
                  ${isActive ? item.color + ' text-white hover:opacity-90' : 'text-gray-600 hover:bg-gray-100'}
                  transition-all duration-200`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[8px] font-medium leading-none">
                  {item.label}
                </span>
              </Button>
            </div>
          );
        })}
      </div>

      {/* Configuration Panel for Building */}
      {activeSection === 'building' && (
        <Card className="absolute left-16 top-0 w-80 h-full bg-white border-r border-gray-200 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Building Configuration</h3>
              <Button variant="ghost" size="sm" onClick={() => onSectionChange(null)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Building Type</label>
                <select className="w-full p-2 border border-gray-300 rounded text-sm">
                  <option>Standard Hangar</option>
                  <option>Clear Span Hangar</option>
                  <option>Multi-Bay Hangar</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Roof System</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={config.roof.type}
                  onChange={(e) => onConfigChange({
                    ...config,
                    roof: { ...config.roof, type: e.target.value }
                  })}
                >
                  <option value="duo-pitch">Duo Pitch</option>
                  <option value="mono-pitch">Mono Pitch</option>
                  <option value="flat">Flat Roof</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Width (m)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={config.dimensions.width}
                    min="3"
                    max="100"
                    step="0.1"
                    onChange={(e) => onConfigChange({
                      ...config,
                      dimensions: { ...config.dimensions, width: parseFloat(e.target.value) }
                    })}
                  />
                  <span className="text-xs text-gray-500">3-100m</span>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Length (m)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    value={config.dimensions.depth}
                    min="6"
                    max="200"
                    step="0.1"
                    onChange={(e) => onConfigChange({
                      ...config,
                      dimensions: { ...config.dimensions, depth: parseFloat(e.target.value) }
                    })}
                  />
                  <span className="text-xs text-gray-500">6-200m</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Building eave height (m)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  value={config.dimensions.height}
                  min="3"
                  max="15"
                  step="0.1"
                  onChange={(e) => onConfigChange({
                    ...config,
                    dimensions: { ...config.dimensions, height: parseFloat(e.target.value) }
                  })}
                />
                <span className="text-xs text-gray-500">3-15m</span>
              </div>
              
              {config.roof.type !== 'flat' && (
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Slope: {config.roof.slope} x/12</label>
                  <input 
                    type="range"
                    min="0"
                    max="12"
                    step="0.25"
                    value={config.roof.slope}
                    className="w-full"
                    onChange={(e) => {
                      const slope = parseFloat(e.target.value);
                      const pitch = Math.atan(slope / 12) * (180 / Math.PI); // Convert to degrees
                      onConfigChange({
                        ...config,
                        roof: { 
                          ...config.roof, 
                          slope: slope,
                          pitch: pitch
                        }
                      });
                    }}
                  />
                  <span className="text-xs text-gray-500">0-12 x/12</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Configuration Panel for Quote */}
      {activeSection === 'quote' && (
        <Card className="absolute left-16 top-0 w-80 h-full bg-white border-r border-gray-200 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Quote</h3>
              <Button variant="ghost" size="sm" onClick={() => onSectionChange(null)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Send Inquiry</label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Building purpose</label>
                    <select className="w-full p-2 border border-gray-300 rounded text-sm">
                      <option>Production hall</option>
                      <option>Storage</option>
                      <option>Workshop</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500">Building realization year</label>
                    <select className="w-full p-2 border border-gray-300 rounded text-sm">
                      <option>2025</option>
                      <option>2024</option>
                      <option>2023</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500">How did you find us?</label>
                    <select className="w-full p-2 border border-gray-300 rounded text-sm">
                      <option>Choose option</option>
                      <option>Google</option>
                      <option>Referral</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white">
                Send Inquiry
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};