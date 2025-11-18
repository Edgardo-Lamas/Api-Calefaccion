import { useRef } from 'react';
import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';
import { saveToLocalStorage, downloadProjectAsJSON, loadProjectFromFile } from '../../utils/projectStorage';

export const Toolbar = () => {
  const { tool, setTool, pipeType, setPipeType } = useToolsStore();
  const { radiators, boilers, pipes, projectName, clearAll, loadProject, setProjectName } = useElementsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const name = prompt('Nombre del proyecto:', projectName);
    if (name) {
      setProjectName(name);
      saveToLocalStorage(radiators, boilers, pipes, name);
      alert('✅ Proyecto guardado en el navegador');
    }
  };

  const handleDownload = () => {
    const name = prompt('Nombre del archivo:', projectName);
    if (name) {
      downloadProjectAsJSON(radiators, boilers, pipes, name);
      alert('✅ Proyecto descargado como JSON');
    }
  };

  const handleLoadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const project = await loadProjectFromFile(file);
      if (confirm(`¿Cargar proyecto "${project.projectName}"? Esto reemplazará el proyecto actual.`)) {
        loadProject(project);
        alert('✅ Proyecto cargado exitosamente');
      }
    } catch (error) {
      alert('❌ Error al cargar el archivo. Verifica que sea un proyecto válido.');
    }

    // Resetear input para permitir cargar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ 
      padding: '10px', 
      borderBottom: '1px solid #ccc',
      display: 'flex',
      gap: '10px'
    }}>
      <button
        onClick={() => setTool('select')}
        style={{
          backgroundColor: tool === 'select' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'select' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Seleccionar
      </button>
      <button
        onClick={() => setTool('radiator')}
        style={{
          backgroundColor: tool === 'radiator' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'radiator' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Radiador
      </button>
      <button
        onClick={() => setTool('boiler')}
        style={{
          backgroundColor: tool === 'boiler' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'boiler' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Caldera
      </button>
      <button
        onClick={() => setTool('pipe')}
        style={{
          backgroundColor: tool === 'pipe' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'pipe' ? 'white' : 'black',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Tubería
      </button>
      {tool === 'pipe' && (
        <>
          <button
            onClick={() => setPipeType('supply')}
            style={{
              backgroundColor: pipeType === 'supply' ? '#D32F2F' : '#f0f0f0',
              color: pipeType === 'supply' ? 'white' : 'black',
              padding: '8px 16px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: pipeType === 'supply' ? 'bold' : 'normal',
              minWidth: '100px',
            }}
          >
            🔴 IDA
          </button>
          <button
            onClick={() => setPipeType('return')}
            style={{
              backgroundColor: pipeType === 'return' ? '#29B6F6' : '#f0f0f0',
              color: pipeType === 'return' ? 'white' : 'black',
              padding: '8px 16px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: pipeType === 'return' ? 'bold' : 'normal',
              minWidth: '100px',
            }}
          >
            🔵 RETORNO
          </button>
        </>
      )}
      <div style={{ flex: 1 }} />
      
      {/* Input oculto para cargar archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {/* Botones de Proyecto */}
      <button
        onClick={handleSave}
        style={{
          backgroundColor: '#2196F3',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        title="Guardar en navegador"
      >
        💾 Guardar
      </button>
      
      <button
        onClick={handleDownload}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        title="Descargar como JSON"
      >
        ⬇️ Descargar
      </button>
      
      <button
        onClick={handleLoadFile}
        style={{
          backgroundColor: '#FF9800',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        title="Cargar desde archivo"
      >
        📂 Cargar
      </button>
      
      <button
        onClick={() => {
          if (confirm('¿Estás seguro de que quieres borrar todo el proyecto?')) {
            clearAll();
          }
        }}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        Limpiar Todo
      </button>
    </div>
  );
};
