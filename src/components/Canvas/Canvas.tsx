import { useRef, useState, useEffect } from 'react';
import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';
import { Radiator } from '../../models/Radiator';
import { Boiler } from '../../models/Boiler';
import { Point } from '../../models/PipeSegment';
import { isPointNearElement, isPointNearPipe } from '../../utils/geometry';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
  const { tool } = useToolsStore();
  const { 
    radiators, 
    boilers,
    pipes,
    tempPipe,
    addRadiator, 
    addBoiler,
    selectedElementId, 
    setSelectedElement, 
    updateRadiatorPosition,
    updateBoilerPosition,
    removeElement,
    startPipe,
    addPipePoint,
    finishPipe,
    cancelPipe,
  } = useElementsStore();

  // Función helper para verificar si un punto está dentro de un radiador
  const isPointInsideRadiator = (x: number, y: number, radiator: Radiator): boolean => {
    return (
      x >= radiator.x &&
      x <= radiator.x + radiator.width &&
      y >= radiator.y &&
      y <= radiator.y + radiator.height
    );
  };

  // Función helper para verificar si un punto está dentro de una caldera
  const isPointInsideBoiler = (x: number, y: number, boiler: Boiler): boolean => {
    return (
      x >= boiler.x &&
      x <= boiler.x + boiler.width &&
      y >= boiler.y &&
      y <= boiler.y + boiler.height
    );
  };

  // Función para dibujar todos los radiadores
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar el tamaño del canvas al contenedor
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar todos los radiadores
    radiators.forEach((radiator) => {
      // Dibujar rectángulo del radiador
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(radiator.x, radiator.y, radiator.width, radiator.height);

      // Si está seleccionado, dibujar borde resaltado
      if (radiator.id === selectedElementId) {
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 3;
        ctx.strokeRect(radiator.x - 2, radiator.y - 2, radiator.width + 4, radiator.height + 4);
      }

      // Dibujar aletas internas (simulación)
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      const numFins = 5;
      const finSpacing = radiator.width / (numFins + 1);
      for (let i = 1; i <= numFins; i++) {
        const finX = radiator.x + finSpacing * i;
        ctx.beginPath();
        ctx.moveTo(finX, radiator.y);
        ctx.lineTo(finX, radiator.y + radiator.height);
        ctx.stroke();
      }

      // Opcional: mostrar potencia
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.fillText(
        `${radiator.power}W`,
        radiator.x + 5,
        radiator.y + radiator.height / 2
      );
    });

    // Dibujar todas las calderas
    boilers.forEach((boiler) => {
      // Dibujar rectángulo de la caldera (cuadrado)
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(boiler.x, boiler.y, boiler.width, boiler.height);
      
      ctx.strokeStyle = '#D84315';
      ctx.lineWidth = 2;
      ctx.strokeRect(boiler.x, boiler.y, boiler.width, boiler.height);

      // Si está seleccionada, dibujar borde resaltado
      if (boiler.id === selectedElementId) {
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 3;
        ctx.strokeRect(boiler.x - 2, boiler.y - 2, boiler.width + 4, boiler.height + 4);
      }

      // Dibujar símbolo de fuego (triángulo simple)
      ctx.fillStyle = '#FFC107';
      ctx.beginPath();
      ctx.moveTo(boiler.x + boiler.width / 2, boiler.y + 15);
      ctx.lineTo(boiler.x + 15, boiler.y + boiler.height - 15);
      ctx.lineTo(boiler.x + boiler.width - 15, boiler.y + boiler.height - 15);
      ctx.closePath();
      ctx.fill();

      // Mostrar potencia
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(
        `${boiler.power}W`,
        boiler.x + 5,
        boiler.y + boiler.height - 5
      );
    });

    // Dibujar tuberías finalizadas
    pipes.forEach((pipe) => {
      if (pipe.points.length < 2) return;

      const isSelected = pipe.id === selectedElementId;
      ctx.strokeStyle = isSelected ? '#FF9800' : '#607D8B';
      ctx.lineWidth = pipe.diameter / 8; // Ancho visual basado en diámetro
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(pipe.points[0].x, pipe.points[0].y);
      for (let i = 1; i < pipe.points.length; i++) {
        ctx.lineTo(pipe.points[i].x, pipe.points[i].y);
      }
      ctx.stroke();

      // Si está seleccionada, dibujar puntos de control
      if (isSelected) {
        pipe.points.forEach((point) => {
          ctx.fillStyle = '#FF9800';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });

    // Dibujar tubería temporal (preview)
    if (tempPipe && tempPipe.points.length > 0) {
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = tempPipe.diameter / 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([5, 5]); // Línea punteada

      ctx.beginPath();
      ctx.moveTo(tempPipe.points[0].x, tempPipe.points[0].y);
      for (let i = 1; i < tempPipe.points.length; i++) {
        ctx.lineTo(tempPipe.points[i].x, tempPipe.points[i].y);
      }
      
      // Si hay punto preview, dibujarlo también
      if (previewPoint) {
        ctx.lineTo(previewPoint.x, previewPoint.y);
      }
      
      ctx.stroke();
      ctx.setLineDash([]); // Restaurar línea sólida

      // Dibujar puntos de la tubería temporal
      tempPipe.points.forEach((point, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#2196F3';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  // Redibujar cuando cambien los radiadores, calderas, pipes, tempPipe, preview o la selección
  useEffect(() => {
    draw();
  }, [radiators, boilers, pipes, tempPipe, previewPoint, selectedElementId]);

  // Redibujar al montar y al redimensionar
  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  // Listener de teclado para eliminar elementos y cancelar tuberías
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detectar teclas Delete o Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault(); // Evitar navegación hacia atrás en el navegador
        removeElement(selectedElementId);
        console.log('Elemento eliminado:', selectedElementId);
      }
      
      // Detectar tecla Escape para cancelar tubería en progreso
      if (e.key === 'Escape' && tempPipe) {
        e.preventDefault();
        cancelPipe(tempPipe.id);
        setPreviewPoint(null);
        console.log('Tubería cancelada');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, tempPipe, removeElement, cancelPipe]);

  const getMouseCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoordinates(e);
    setMousePos(coords);

    // Si la herramienta es "radiator", crear un radiador
    if (tool === 'radiator') {
      const newRadiator: Radiator = {
        id: crypto.randomUUID(),
        type: 'radiator',
        x: coords.x,
        y: coords.y,
        width: 80,
        height: 40,
        power: 1000,
      };

      addRadiator(newRadiator);
      console.log('Radiador creado:', newRadiator);
    }

    // Si la herramienta es "boiler", crear una caldera
    if (tool === 'boiler') {
      const newBoiler: Boiler = {
        id: crypto.randomUUID(),
        type: 'boiler',
        x: coords.x,
        y: coords.y,
        width: 60,
        height: 60,
        power: 24000,
      };

      addBoiler(newBoiler);
      console.log('Caldera creada:', newBoiler);
    }

    // Si la herramienta es "select", intentar seleccionar o arrastrar
    if (tool === 'select') {
      // Buscar si hicimos click en algún radiador (recorrer en orden inverso para priorizar los últimos)
      let foundRadiator: Radiator | null = null;
      
      for (let i = radiators.length - 1; i >= 0; i--) {
        if (isPointInsideRadiator(coords.x, coords.y, radiators[i])) {
          foundRadiator = radiators[i];
          break;
        }
      }

      // Si no se encontró radiador, buscar caldera
      let foundBoiler: Boiler | null = null;
      if (!foundRadiator) {
        for (let i = boilers.length - 1; i >= 0; i--) {
          if (isPointInsideBoiler(coords.x, coords.y, boilers[i])) {
            foundBoiler = boilers[i];
            break;
          }
        }
      }

      // Si no se encontró radiador ni caldera, buscar tubería
      let foundPipeId: string | null = null;
      if (!foundRadiator && !foundBoiler) {
        for (let i = pipes.length - 1; i >= 0; i--) {
          if (isPointNearPipe(coords, pipes[i].points, 10)) {
            foundPipeId = pipes[i].id;
            break;
          }
        }
      }

      if (foundRadiator) {
        // Seleccionar el radiador
        setSelectedElement(foundRadiator.id);
        
        // Activar modo dragging y guardar offset
        setIsDragging(true);
        setDragOffset({
          x: coords.x - foundRadiator.x,
          y: coords.y - foundRadiator.y,
        });

        console.log('Radiador seleccionado:', foundRadiator.id);
      } else if (foundBoiler) {
        // Seleccionar la caldera
        setSelectedElement(foundBoiler.id);
        
        // Activar modo dragging y guardar offset
        setIsDragging(true);
        setDragOffset({
          x: coords.x - foundBoiler.x,
          y: coords.y - foundBoiler.y,
        });

        console.log('Caldera seleccionada:', foundBoiler.id);
      } else if (foundPipeId) {
        // Seleccionar la tubería
        setSelectedElement(foundPipeId);
        setIsDragging(false); // Las tuberías no se pueden arrastrar
        console.log('Tubería seleccionada:', foundPipeId);
      } else {
        // No se encontró ningún elemento, deseleccionar
        setSelectedElement(null);
        setIsDragging(false);
        console.log('Deseleccionado');
      }
    }

    // Si la herramienta es "pipe", iniciar o agregar punto a tubería
    if (tool === 'pipe') {
      const coords = getMouseCoordinates(e);
      
      // Verificar si hay snap a elemento
      let snapElementId: string | undefined;
      let snapElementName = '';
      for (const radiator of radiators) {
        if (isPointNearElement(coords, radiator)) {
          snapElementId = radiator.id;
          snapElementName = 'Radiador';
          console.log('🎯 SNAP detectado a radiador:', radiator.id);
          break;
        }
      }
      if (!snapElementId) {
        for (const boiler of boilers) {
          if (isPointNearElement(coords, boiler)) {
            snapElementId = boiler.id;
            snapElementName = 'Caldera';
            console.log('🎯 SNAP detectado a caldera:', boiler.id);
            break;
          }
        }
      }

      if (!tempPipe) {
        // Iniciar nueva tubería
        const pipeId = startPipe(coords, snapElementId);
        console.log('Tubería iniciada:', { pipeId, fromElementId: snapElementId, snapTo: snapElementName });
      } else {
        // Agregar punto a tubería existente
        addPipePoint(tempPipe.id, coords);
        console.log('Punto agregado a tubería', { snapElementId, snapTo: snapElementName });
      }
    }

    console.log('MouseDown:', {
      tool,
      action: 'down',
      coordinates: coords,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoordinates(e);
    setMousePos(coords);

    // Si estamos arrastrando un elemento seleccionado
    if (isDragging && selectedElementId) {
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      
      // Verificar si el elemento es un radiador
      const isRadiator = radiators.some(r => r.id === selectedElementId);
      if (isRadiator) {
        updateRadiatorPosition(selectedElementId, newX, newY);
      }
      
      // Verificar si el elemento es una caldera
      const isBoiler = boilers.some(b => b.id === selectedElementId);
      if (isBoiler) {
        updateBoilerPosition(selectedElementId, newX, newY);
      }
    }

    // Si hay tubería temporal, mostrar preview
    if (tempPipe && tempPipe.points.length > 0) {
      setPreviewPoint(coords);
    } else {
      setPreviewPoint(null);
    }

    console.log('MouseMove:', {
      tool,
      action: 'move',
      coordinates: coords,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoordinates(e);
    
    // Desactivar dragging
    setIsDragging(false);

    console.log('MouseUp:', {
      tool,
      action: 'up',
      coordinates: coords,
    });
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getMouseCoordinates(e);
    
    if (tool === 'pipe' && tempPipe) {
      // Verificar si el punto final está cerca de un equipo
      const nearRadiator = radiators.find(r => isPointNearElement(coords, r));
      const nearBoiler = boilers.find(b => isPointNearElement(coords, b));
      const toElementId = nearRadiator?.id || nearBoiler?.id;
      
      if (toElementId) {
        console.log('🎯 SNAP final detectado:', {
          toElementId,
          tipo: nearRadiator ? 'Radiador' : 'Caldera'
        });
      }
      
      console.log('Finalizando tubería:', {
        tempPipeId: tempPipe.id,
        fromElementId: tempPipe.fromElementId,
        toElementId,
        totalPoints: tempPipe.points.length + 1
      });
      
      finishPipe(tempPipe.id, coords, toElementId);
      setPreviewPoint(null);
    }

    console.log('DoubleClick:', {
      tool,
      action: 'dblclick',
      coordinates: coords,
    });
  };

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc',
        }}
      />
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(255,255,255,0.8)',
        padding: '5px 10px',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}>
        Tool: {tool} | Mouse: ({mousePos.x.toFixed(0)}, {mousePos.y.toFixed(0)})
      </div>
    </div>
  );
};
