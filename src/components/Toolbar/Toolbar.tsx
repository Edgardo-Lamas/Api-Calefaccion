import { useRef, useState, useEffect } from 'react';
import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';
import { useCompanyStore } from '../../stores/companyStore';
import { saveToLocalStorage, downloadProjectAsJSON } from '../../utils/projectStorage';
import { generateAutoPipes } from '../../utils/pipeRouter';
import { dimensionPipes } from '../../utils/pipeDimensioning';
import { generateQuotePDF } from '../../utils/pdfGenerator';
import { FloorSelector } from '../FloorSelector/FloorSelector';
import './Toolbar.css';

export const Toolbar = () => {
  const { tool, setTool } = useToolsStore();
  const { 
    radiators, 
    boilers, 
    pipes,
    rooms,
    projectName,
    currentFloor,
    floorPlans,
    setPipes, 
    setFloorPlan,
    setFloorPlanOffset,
    clearAll,
  } = useElementsStore();
  const { companyInfo, getActivePromotions } = useCompanyStore();
  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Plano de fondo de la planta actual
  const currentFloorPlan = floorPlans[currentFloor];
  const backgroundImage = currentFloorPlan.image;
  const backgroundImageDimensions = currentFloorPlan.dimensions;

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

  const handleAutoConnect = () => {
    // Filtrar solo elementos de la planta actual
    const currentFloorRadiators = radiators.filter(r => r.floor === currentFloor);
    const currentFloorBoilers = boilers.filter(b => b.floor === currentFloor);
    
    if (currentFloorRadiators.length === 0) {
      alert(`⚠️ No hay radiadores en ${currentFloor === 'ground' ? 'Planta Baja' : 'Planta Alta'}.\n\nCrea radiadores en esta planta primero.`);
      return;
    }
    if (currentFloorBoilers.length === 0) {
      alert(`⚠️ No hay caldera en ${currentFloor === 'ground' ? 'Planta Baja' : 'Planta Alta'}.\n\n` +
        `Opción 1: Crea una caldera en esta planta.\n` +
        `Opción 2: Marca una tubería como "⇅ Vertical" para conectar con la caldera de otra planta.`);
      return;
    }

    const confirmed = confirm(
      `¿Generar tuberías automáticas en ${currentFloor === 'ground' ? 'Planta Baja' : 'Planta Alta'}?\n\n` +
      `Se conectarán ${currentFloorRadiators.length} radiador(es) a ${currentFloorBoilers.length} caldera(s).\n` +
      `Las tuberías de esta planta serán reemplazadas.\n\n` +
      `NOTA: Los radiadores NO se moverán. Colócalos manualmente donde quieras.`
    );

    if (!confirmed) return;

    console.log('🚀 Iniciando conexión automática:', {
      radiators: currentFloorRadiators.length,
      boilers: currentFloorBoilers.length,
      currentFloor,
      radiatorsData: currentFloorRadiators.map(r => ({ id: r.id.substring(0, 8), floor: r.floor, power: r.power, x: r.x, y: r.y })),
      boilersData: currentFloorBoilers.map(b => ({ id: b.id.substring(0, 8), floor: b.floor, x: b.x, y: b.y }))
    });

    // Solo generar routing desde caldera a cada radiador (sin mover)
    const result = generateAutoPipes(currentFloorRadiators, currentFloorBoilers);
    
    console.log('📊 Resultado de generateAutoPipes:', {
      pipes: result.pipes.length,
      firstPipe: result.pipes[0]
    });
    
    // Actualizar solo las tuberías de la planta actual
    // Mantener las tuberías de otras plantas
    const otherFloorPipes = pipes.filter(p => p.floor !== currentFloor && p.floor !== 'vertical');
    const verticalPipes = pipes.filter(p => p.floor === 'vertical');
    const newPipes = [...otherFloorPipes, ...verticalPipes, ...result.pipes];
    
    setPipes(newPipes);

    console.log('✅ Tuberías actualizadas en el store:', {
      total: newPipes.length,
      currentFloor: result.pipes.length,
      otherFloors: otherFloorPipes.length,
      vertical: verticalPipes.length
    });

    alert(
      `✅ ${result.pipes.length} tuberías generadas en ${currentFloor === 'ground' ? 'Planta Baja' : 'Planta Alta'} (${result.pipes.length / 2} pares IDA/RETORNO)\n\n` +
      `💡 IMPORTANTE: Las tuberías tienen diámetro por defecto (16mm).\n` +
      `Haz click en "📏 Dimensionar" para calcular los diámetros óptimos según la potencia.`
    );
  };

  const handleDimensionPipes = () => {
    if (pipes.length === 0) {
      alert('⚠️ No hay tuberías para dimensionar');
      return;
    }
    if (radiators.length === 0) {
      alert('⚠️ Necesitas radiadores con potencia definida para dimensionar');
      return;
    }

    // Verificar que al menos algunos radiadores tengan potencia
    const radiatorsWithPower = radiators.filter(r => r.power > 0);
    if (radiatorsWithPower.length === 0) {
      alert('⚠️ Los radiadores no tienen potencia asignada.\n\nAsigna radiadores a habitaciones primero para calcular su potencia.');
      return;
    }

    const confirmed = confirm(
      `¿Dimensionar tuberías automáticamente?\n\n` +
      `Se calcularán los diámetros óptimos según:\n` +
      `• Potencia de radiadores\n` +
      `• Caudal necesario (L/h)\n` +
      `• Velocidad óptima del agua\n\n` +
      `Los diámetros actuales serán reemplazados.`
    );

    if (!confirmed) return;

    const dimensionedPipes = dimensionPipes(pipes, radiators, boilers);
    setPipes(dimensionedPipes);

    alert(
      `✅ Tuberías dimensionadas automáticamente\n\n` +
      `Revisa el panel de propiedades para ver los detalles de cada tubería.`
    );
  };

  const handleLoadFloorPlan = () => {
    floorPlanInputRef.current?.click();
  };

  const handleMoveBackground = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 10; // pixels per step
    const currentOffset = currentFloorPlan.offset || { x: 0, y: 0 };
    
    switch (direction) {
      case 'up':
        setFloorPlanOffset(currentFloor, { x: currentOffset.x, y: currentOffset.y - step });
        break;
      case 'down':
        setFloorPlanOffset(currentFloor, { x: currentOffset.x, y: currentOffset.y + step });
        break;
      case 'left':
        setFloorPlanOffset(currentFloor, { x: currentOffset.x - step, y: currentOffset.y });
        break;
      case 'right':
        setFloorPlanOffset(currentFloor, { x: currentOffset.x + step, y: currentOffset.y });
        break;
    }
  };

  const handleResetBackground = () => {
    setFloorPlanOffset(currentFloor, { x: 0, y: 0 });
  };

  const handleRemoveFloorPlan = () => {
    const floorName = currentFloor === 'ground' ? 'Planta Baja' : 'Planta Alta';
    if (confirm(`¿Eliminar el plano de ${floorName}?`)) {
      setFloorPlan(currentFloor, null);
      setFloorPlanOffset(currentFloor, { x: 0, y: 0 });
      console.log(`🗑️ Plano de ${floorName} eliminado`);
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
      const floorName = currentFloor === 'ground' ? 'Planta Baja' : 'Planta Alta';
      setFloorPlan(currentFloor, imageDataUrl);
      console.log(`✅ Plano de ${floorName} cargado`);
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

  const handleGenerateQuote = () => {
    // Obtener el canvas
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('❌ No se encontró el canvas');
      return;
    }

    if (radiators.length === 0 && pipes.length === 0) {
      alert('⚠️ Debes agregar al menos radiadores y tuberías para generar un presupuesto');
      return;
    }

    const activePromotions = getActivePromotions();
    const name = projectName || 'Proyecto de Calefacción';

    try {
      generateQuotePDF(
        canvas,
        rooms,
        radiators,
        pipes,
        companyInfo,
        activePromotions,
        name
      );
      alert('✅ Presupuesto PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el presupuesto. Revisa la consola.');
    }
  };

  return (
    <div className="toolbar-container">
      <button
        onClick={() => setTool('select')}
        style={{
          backgroundColor: tool === 'select' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'select' ? 'white' : 'black',
          padding: '6px 12px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: '14px',
        }}
      >
        Seleccionar
      </button>
      <button
        onClick={() => setTool('radiator')}
        style={{
          backgroundColor: tool === 'radiator' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'radiator' ? 'white' : 'black',
          padding: '6px 12px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: '14px',
        }}
      >
        Radiador
      </button>
      <button
        onClick={() => setTool('boiler')}
        style={{
          backgroundColor: tool === 'boiler' ? '#4CAF50' : '#f0f0f0',
          color: tool === 'boiler' ? 'white' : 'black',
          padding: '6px 12px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: '14px',
        }}
      >
        Caldera
      </button>

      <button
        onClick={() => setTool('vertical-pipe')}
        style={{
          backgroundColor: tool === 'vertical-pipe' ? '#9C27B0' : '#f0f0f0',
          color: tool === 'vertical-pipe' ? 'white' : 'black',
          padding: '6px 12px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontSize: '14px',
        }}
        title="Marcar tubería que va a otra planta"
      >
        ⇅ Vertical
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
      
      <button
        onClick={handleDimensionPipes}
        style={{
          backgroundColor: '#9C27B0',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
        title="Calcular diámetros óptimos según potencia"
      >
        📏 Dimensionar
      </button>
      
      {/* Selector de Planta */}
      <FloorSelector />
      
      <div style={{ flex: 1 }} />
      
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
        onClick={handleGenerateQuote}
        style={{
          backgroundColor: '#00897B',
          color: 'white',
          padding: '8px 16px',
          border: '1px solid #ccc',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
        title="Generar presupuesto profesional en PDF"
      >
        📄 Presupuesto
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
        🗑️ Limpiar
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
