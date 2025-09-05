import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HangarViewer } from "./components/HangarViewer";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { mockHangarConfig } from "./data/mockData";

const Home = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [hangarConfig, setHangarConfig] = useState(mockHangarConfig);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      <LeftSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        config={hangarConfig}
        onConfigChange={setHangarConfig}
      />
      
      {/* Main 3D Viewer */}
      <div className="flex-1 relative">
        <HangarViewer 
          config={hangarConfig}
          onConfigChange={setHangarConfig}
        />
        
        {/* Brand Logo */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg">Kirby</span>
            <span className="bg-orange-500 text-white px-1 text-xs font-bold">X</span>
            <span className="text-sm text-gray-600">BUILDING SYSTEMS</span>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <RightSidebar 
        config={hangarConfig}
        onConfigChange={setHangarConfig}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
