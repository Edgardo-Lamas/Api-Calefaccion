import { useRef, useState, useEffect } from 'react';
import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';
import { Radiator } from '../../models/Radiator';
import { Boiler } from '../../models/Boiler';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { tool } = useToolsStore();
  const { 
    radiators, 
    boilers,
    addRadiator, 
    addBoiler,
    selectedElementId, 
    setSelectedElement, 
    updateRadiatorPosition,
    updateBoilerPosition,
    removeElement 
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
  };

  // Redibujar cuando cambien los radiadores, calderas o la selección
  useEffect(() => {
    draw();
  }, [radiators, boilers, selectedElementId]);

  // Redibujar al montar y al redimensionar
  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  // Listener de teclado para eliminar elementos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detectar teclas Delete o Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault(); // Evitar navegación hacia atrás en el navegador
        removeElement(selectedElementId);
        console.log('Elemento eliminado:', selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, removeElement]);

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
      } else {
        // No se encontró ningún elemento, deseleccionar
        setSelectedElement(null);
        setIsDragging(false);
        console.log('Deseleccionado');
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

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
