import { useRef, useState, useEffect } from 'react';
import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';
import { saveToLocalStorage, downloadProjectAsJSON, loadProjectFromFile } from '../../utils/projectStorage';
import { generateAutoPipes } from '../../utils/pipeRouter';
import './Toolbar.css';

export const Toolbar = () => {
  const { tool, setTool } = useToolsStore();
  const { 
    radiators, 
    boilers, 
    pipes, 
    projectName, 
    backgroundImage,
    backgroundImageDimensions,
    backgroundImageOffset,
    clearAll, 
    loadProject, 
    setProjectName, 
    setPipes, 
    setBackgroundImage,
    setBackgroundImageOffset,
    updateRadiatorPosition 
  } = useElementsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);
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

    // Intentar Web Share API con archivos
    if (navigator.share) {
      try {
        // Primero intentar compartir con archivo
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Proyecto: ${name}`,
            text: `Proyecto de calefacción: ${name}`,
            files: [file],
          });
          console.log('✅ Proyecto compartido con archivo exitosamente');
          return;
        }
        
        // Si no soporta archivos, compartir solo texto con instrucción
        await navigator.share({
          title: `Proyecto: ${name}`,
          text: `Proyecto de calefacción: ${name}\n\nDescarga el archivo JSON desde la app para cargarlo.`,
        });
        // Después del share de texto, descargar el archivo
        downloadProjectAsJSON(radiators, boilers, pipes, name);
        console.log('✅ Link compartido y archivo descargado');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error al compartir:', error);
          // Fallback: solo descargar archivo
          downloadProjectAsJSON(radiators, boilers, pipes, name);
        }
      }
    } else {
      // Fallback para navegadores sin Web Share API (PC)
      downloadProjectAsJSON(radiators, boilers, pipes, name);
      alert('✅ Proyecto descargado');
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

  const handleAutoConnect = () => {
    if (radiators.length === 0) {
      alert('⚠️ No hay radiadores para conectar');
      return;
    }
    if (boilers.length === 0) {
      alert('⚠️ No hay calderas para conectar');
      return;
    }

    const confirmed = confirm(
      `¿Generar tuberías automáticas?\n\n` +
      `Se conectarán ${radiators.length} radiador(es) a ${boilers.length} caldera(s).\n` +
      `Los radiadores se reubicarán en paredes exteriores.\n` +
      `Las tuberías actuales serán reemplazadas.`
    );

    if (!confirmed) return;

    // Usar dimensiones del plano si existe, sino dimensiones del canvas
    const workWidth = backgroundImageDimensions?.width || 1200;
    const workHeight = backgroundImageDimensions?.height || 800;
    const offsetX = backgroundImageOffset?.x || 0;
    const offsetY = backgroundImageOffset?.y || 0;

    // Generar tuberías automáticas y obtener nuevas posiciones
    const result = generateAutoPipes(radiators, boilers, workWidth, workHeight, offsetX, offsetY);
    
    // Actualizar tuberías
    setPipes(result.pipes);
    
    // Reubicar radiadores en paredes exteriores con orientación correcta
    result.repositionedRadiators.forEach(({ id, x, y, width, height }) => {
      updateRadiatorPosition(id, x, y, width, height);
    });

    alert(
      `✅ ${result.pipes.length} tuberías generadas (${result.pipes.length / 2} pares IDA/RETORNO)\n` +
      `📍 ${result.repositionedRadiators.length} radiadores reubicados en paredes exteriores`
    );
  };

  const handleLoadFloorPlan = () => {
    floorPlanInputRef.current?.click();
  };

  const handleMoveBackground = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 10; // pixels per step
    const currentOffset = backgroundImageOffset || { x: 0, y: 0 };
    
    switch (direction) {
      case 'up':
        setBackgroundImageOffset({ x: currentOffset.x, y: currentOffset.y - step });
        break;
      case 'down':
        setBackgroundImageOffset({ x: currentOffset.x, y: currentOffset.y + step });
        break;
      case 'left':
        setBackgroundImageOffset({ x: currentOffset.x - step, y: currentOffset.y });
        break;
      case 'right':
        setBackgroundImageOffset({ x: currentOffset.x + step, y: currentOffset.y });
        break;
    }
  };

  const handleResetBackground = () => {
    setBackgroundImageOffset({ x: 0, y: 0 });
  };

  const handleRemoveFloorPlan = () => {
    if (confirm('¿Eliminar el plano de fondo actual?')) {
      setBackgroundImage(null);
      setBackgroundImageOffset({ x: 0, y: 0 });
      console.log('🗑️ Plano de fondo eliminado');
    }
  };

  const handleFloorPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Solo se permiten imágenes (PNG, JPG, JPEG)');
      return;
    }

    // Leer imagen como Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setBackgroundImage(imageDataUrl);
      console.log('✅ Plano de fondo cargado');
    };
    reader.onerror = () => {
      alert('❌ Error al cargar la imagen');
    };
    reader.readAsDataURL(file);

    // Resetear input
    if (floorPlanInputRef.current) {
      floorPlanInputRef.current.value = '';
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
        onClick={handleAutoConnect}
        style={{
          backgroundColor: '#FF6F00',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
        title="Generar tuberías automáticamente"
      >
        ⚡ Conectar Auto
      </button>
      
      <div style={{ flex: 1 }} />
      
      {/* Input oculto para cargar archivos JSON */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {/* Input oculto para cargar imagen de plano */}
      <input
        ref={floorPlanInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: 'none' }}
        onChange={handleFloorPlanChange}
      />
      
      {/* Botón Cargar Plano */}
      <button
        onClick={handleLoadFloorPlan}
        style={{
          backgroundColor: '#00897B',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        title="Cargar imagen de plano de fondo"
      >
        📁 Cargar Plano
      </button>
      
      {/* Botón Eliminar Plano (solo si hay plano cargado) */}
      {backgroundImage && (
        <button
          onClick={handleRemoveFloorPlan}
          style={{
            backgroundColor: '#F44336',
            color: 'white',
            padding: '8px 16px',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          title="Eliminar plano de fondo"
        >
          🗑️ Quitar Plano
        </button>
      )}
      
      {/* Controles de ajuste del plano (solo si hay plano cargado) */}
      {backgroundImageDimensions && (
        <div style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          padding: '4px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}>
          <span style={{ fontSize: '11px', marginRight: '4px' }}>Ajustar plano:</span>
          <button
            onClick={() => handleMoveBackground('up')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              padding: '4px',
              fontSize: '14px',
            }}
            title="Mover plano arriba"
          >
            ⬆️
          </button>
          <button
            onClick={() => handleMoveBackground('down')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              padding: '4px',
              fontSize: '14px',
            }}
            title="Mover plano abajo"
          >
            ⬇️
          </button>
          <button
            onClick={() => handleMoveBackground('left')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              padding: '4px',
              fontSize: '14px',
            }}
            title="Mover plano izquierda"
          >
            ⬅️
          </button>
          <button
            onClick={() => handleMoveBackground('right')}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              padding: '4px',
              fontSize: '14px',
            }}
            title="Mover plano derecha"
          >
            ➡️
          </button>
          <button
            onClick={handleResetBackground}
            style={{
              backgroundColor: '#FF5722',
              color: 'white',
              border: '1px solid #ccc',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '11px',
              marginLeft: '4px',
            }}
            title="Centrar plano"
          >
            ⟲ Reset
          </button>
        </div>
      )}
      
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
