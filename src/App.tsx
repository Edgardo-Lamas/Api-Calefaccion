import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { RoomPanel } from './components/RoomPanel/RoomPanel';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Toolbar />
      <div className="main-content">
        <Canvas />
        <PropertiesPanel />
        <RoomPanel />
      </div>
    </div>
  );
}

export default App;
