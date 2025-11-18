import { useRef, useState, useEffect } from 'react';
import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';
import { saveToLocalStorage, downloadProjectAsJSON, loadProjectFromFile } from '../../utils/projectStorage';
import './Toolbar.css';

export const Toolbar = () => {
  const { tool, setTool, pipeType, setPipeType } = useToolsStore();
  const { radiators, boilers, pipes, projectName, clearAll, loadProject, setProjectName } = useElementsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Autoguardado cada 30 segundos
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (radiators.length > 0 || boilers.length > 0 || pipes.length > 0) {
        setIsSaving(true);
        saveToLocalStorage(radiators, boilers, pipes, projectName);
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 1000);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [radiators, boilers, pipes, projectName]);

  // Formatear tiempo desde último guardado
  const getTimeSinceLastSave = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return `hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `hace ${minutes}m`;
  };

  const handleShare = async () => {
    const name = projectName || 'Proyecto_Calefaccion';
    const projectData = {
      projectName: name,
      version: '1.0',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      radiators,
      boilers,
      pipes,
      scale: 50,
    };

    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], `${name.replace(/\s+/g, '_')}.json`, { type: 'application/json' });

    // Verificar si el navegador soporta Web Share API
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `Proyecto: ${name}`,
          text: `Proyecto de calefacción: ${name}`,
          files: [file],
        });
        console.log('✅ Proyecto compartido exitosamente');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error al compartir:', error);
          // Fallback: descargar archivo
          downloadProjectAsJSON(radiators, boilers, pipes, name);
        }
      }
    } else {
      // Fallback para navegadores sin Web Share API (PC)
      downloadProjectAsJSON(radiators, boilers, pipes, name);
      alert('✅ Proyecto descargado (tu navegador no soporta compartir archivos)');
    }
  };

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
    <div className="toolbar-container">
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
        onClick={handleShare}
        style={{
          backgroundColor: '#9C27B0',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          minWidth: '44px',
        }}
        title="Compartir proyecto"
      >
        📤 Compartir
      </button>
      
      <button
        onClick={handleSave}
        style={{
          backgroundColor: '#2196F3',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          minWidth: '44px',
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
          minWidth: '44px',
        }}
      >
        Limpiar Todo
      </button>

      {/* Indicador de autoguardado */}
      {lastSaved && (
        <div 
          className={`autosave-indicator ${isSaving ? 'saving' : ''}`}
          style={{
            marginLeft: '10px',
            padding: '8px 12px',
            fontSize: '11px',
            borderRadius: '4px',
            backgroundColor: isSaving ? '#2196F3' : '#4CAF50',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {isSaving ? '💾 Guardando...' : `✅ ${getTimeSinceLastSave()}`}
        </div>
      )}
    </div>
  );
};
