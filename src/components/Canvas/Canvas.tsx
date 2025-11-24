import { useRef, useState, useEffect } from 'react';
import { useToolsStore } from '../../store/useToolsStore';
import { useElementsStore } from '../../store/useElementsStore';
import { Radiator } from '../../models/Radiator';
import { Boiler } from '../../models/Boiler';
import { isPointNearPipe } from '../../utils/geometry';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Estado para zoom y pan
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  
  const { tool } = useToolsStore();
  const { 
    radiators, 
    boilers,
    pipes,
    addRadiator,
    addBoiler,
    selectedElementId, 
    setSelectedElement, 
    updateRadiatorPosition,
    updateBoilerPosition,
    removeElement,
    backgroundImage,
    backgroundImageOffset,
    backgroundImageDimensions,
    setBackgroundImageDimensions,
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

    // Guardar estado del contexto
    ctx.save();
    
    // Aplicar transformaciones de zoom y pan
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Dibujar imagen de fondo del plano (si existe)
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      
      // Solo dibujar si la imagen ya está cargada
      if (img.complete) {
        // Ajustar imagen al canvas manteniendo aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Guardar dimensiones escaladas si no están guardadas
        if (!backgroundImageDimensions || 
            backgroundImageDimensions.width !== scaledWidth || 
            backgroundImageDimensions.height !== scaledHeight) {
          setBackgroundImageDimensions({ width: scaledWidth, height: scaledHeight });
        }
        
        ctx.globalAlpha = 0.6; // Semi-transparente para que se vean los elementos
        ctx.drawImage(
          img, 
          backgroundImageOffset.x, 
          backgroundImageOffset.y, 
          scaledWidth, 
          scaledHeight
        );
        ctx.globalAlpha = 1.0; // Restaurar opacidad
      } else {
        // Cargar imagen si no está en caché
        img.onload = () => draw();
      }
    }

    // Dibujar todos los radiadores (VISTA SUPERIOR COMPACTA)
    radiators.forEach((radiator) => {
      // Detectar orientación: si height > width, está vertical (rotado 90°)
      const isVertical = radiator.height > radiator.width;
      
      // Fondo del radiador (color rojo/naranja como en planos)
      ctx.fillStyle = '#E57373';
      ctx.fillRect(radiator.x, radiator.y, radiator.width, radiator.height);
      
      // Borde del radiador
      ctx.strokeStyle = '#C62828';
      ctx.lineWidth = 1;
      ctx.strokeRect(radiator.x, radiator.y, radiator.width, radiator.height);

      // Si está seleccionado, dibujar borde resaltado
      if (radiator.id === selectedElementId) {
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.strokeRect(radiator.x - 2, radiator.y - 2, radiator.width + 4, radiator.height + 4);
      }

      // Líneas internas (simulando elementos internos)
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 0.5;
      const numLines = 4;
      
      if (isVertical) {
        // Radiador VERTICAL: líneas horizontales
        const lineSpacing = radiator.height / (numLines + 1);
        for (let i = 1; i <= numLines; i++) {
          const lineY = radiator.y + lineSpacing * i;
          ctx.beginPath();
          ctx.moveTo(radiator.x + 1, lineY);
          ctx.lineTo(radiator.x + radiator.width - 1, lineY);
          ctx.stroke();
        }
      } else {
        // Radiador HORIZONTAL: líneas verticales
        const lineSpacing = radiator.width / (numLines + 1);
        for (let i = 1; i <= numLines; i++) {
          const lineX = radiator.x + lineSpacing * i;
          ctx.beginPath();
          ctx.moveTo(lineX, radiator.y + 1);
          ctx.lineTo(lineX, radiator.y + radiator.height - 1);
          ctx.stroke();
        }
      }

      // Conexiones de tubería (2 puntos pequeños en un extremo)
      const connectionSize = 2;
      const connectionOffset = 5;
      
      if (isVertical) {
        // Conexiones en la parte superior (horizontal)
        // Conexión IDA (arriba izquierda)
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.arc(radiator.x + radiator.width / 3, radiator.y + connectionOffset, connectionSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Conexión RETORNO (arriba derecha)
        ctx.fillStyle = '#29B6F6';
        ctx.beginPath();
        ctx.arc(radiator.x + 2 * radiator.width / 3, radiator.y + connectionOffset, connectionSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Conexiones en el lado izquierdo (vertical)
        // Conexión IDA (izquierda arriba)
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.arc(radiator.x + connectionOffset, radiator.y + radiator.height / 3, connectionSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Conexión RETORNO (izquierda abajo)
        ctx.fillStyle = '#29B6F6';
        ctx.beginPath();
        ctx.arc(radiator.x + connectionOffset, radiator.y + 2 * radiator.height / 3, connectionSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mostrar potencia solo si está seleccionado (para no saturar)
      if (radiator.id === selectedElementId) {
        ctx.fillStyle = '#333';
        ctx.font = '9px Arial';
        ctx.fillText(
          `${radiator.power} Kcal/h`,
          radiator.x + radiator.width + 5,
          radiator.y + radiator.height / 2
        );
      }
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
      const powerKW = (boiler.power / 860).toFixed(1);
      ctx.fillText(
        `${powerKW}kW`,
        boiler.x + 5,
        boiler.y + boiler.height - 5
      );
    });

    // Dibujar tuberías finalizadas (ordenadas por zIndex)
    const sortedPipes = [...pipes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    sortedPipes.forEach((pipe) => {
      if (pipe.points.length < 2) return;

      const isSelected = pipe.id === selectedElementId;
      
      // Color según tipo: IDA = rojo, RETORNO = azul celeste
      let baseColor = pipe.pipeType === 'supply' ? '#D32F2F' : '#29B6F6';
      if (isSelected) baseColor = '#FF9800'; // Naranja si está seleccionada
      
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = isSelected ? 2.5 : 1.5; // Líneas finas y proporcionales
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([]); // Línea sólida

      // Dibujar la tubería con detección de cruces
      ctx.beginPath();
      for (let i = 0; i < pipe.points.length; i++) {
        const point = pipe.points[i];
        
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          // Detectar si este segmento cruza con otras tuberías
          const prevPoint = pipe.points[i - 1];
          const hasCrossing = sortedPipes.some(otherPipe => {
            if (otherPipe.id === pipe.id) return false;
            if ((otherPipe.zIndex || 0) >= (pipe.zIndex || 0)) return false;
            
            // Verificar si hay cruce entre segmentos
            for (let j = 1; j < otherPipe.points.length; j++) {
              const op1 = otherPipe.points[j - 1];
              const op2 = otherPipe.points[j];
              
              // Detección simple de cruce (producto cruzado)
              const d1 = (op2.x - op1.x) * (prevPoint.y - op1.y) - (op2.y - op1.y) * (prevPoint.x - op1.x);
              const d2 = (op2.x - op1.x) * (point.y - op1.y) - (op2.y - op1.y) * (point.x - op1.x);
              const d3 = (point.x - prevPoint.x) * (op1.y - prevPoint.y) - (point.y - prevPoint.y) * (op1.x - prevPoint.x);
              const d4 = (point.x - prevPoint.x) * (op2.y - prevPoint.y) - (point.y - prevPoint.y) * (op2.x - prevPoint.x);
              
              if (d1 * d2 < 0 && d3 * d4 < 0) {
                return true; // Hay cruce
              }
            }
            return false;
          });
          
          if (hasCrossing) {
            // Dibujar gap (salto) en el cruce
            const dx = point.x - prevPoint.x;
            const dy = point.y - prevPoint.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const gapSize = 6; // Tamaño del gap
            
            if (len > gapSize * 2) {
              const midX = (prevPoint.x + point.x) / 2;
              const midY = (prevPoint.y + point.y) / 2;
              const offsetX = (dx / len) * gapSize;
              const offsetY = (dy / len) * gapSize;
              
              // Dibujar hasta antes del gap
              ctx.lineTo(midX - offsetX, midY - offsetY);
              ctx.stroke();
              
              // Saltar el gap
              ctx.beginPath();
              ctx.moveTo(midX + offsetX, midY + offsetY);
              ctx.lineTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
      }
      ctx.stroke();

      // Solo mostrar puntos de control si está seleccionada
      if (isSelected) {
        pipe.points.forEach((point) => {
          ctx.fillStyle = '#FF9800';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
    
    // Restaurar estado del contexto
    ctx.restore();
  };

  // Redibujar cuando cambien los radiadores, calderas, pipes, backgroundImage o la selección
  useEffect(() => {
    draw();
  }, [radiators, boilers, pipes, selectedElementId, zoom, panOffset, backgroundImage]);

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
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Aplicar transformaciones inversas de zoom y pan
    const x = (clientX - panOffset.x) / zoom;
    const y = (clientY - panOffset.y) / zoom;

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
        width: 60,  // Vista superior: más angosto
        height: 12, // Vista superior: muy bajo (franja)
        power: 1500, // Kcal/h
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
        power: 20640, // Kcal/h (24kW × 860)
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
        setIsDragging(false);
        console.log('Tubería seleccionada:', foundPipeId);
      } else {
        // No se encontró ningún elemento
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

  // Funciones para zoom
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 5)); // Max zoom 5x
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.1)); // Min zoom 0.1x
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Encuadrar todos los elementos en el canvas
  const handleFitAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Si no hay elementos, solo resetear
    if (radiators.length === 0 && boilers.length === 0 && pipes.length === 0) {
      handleResetZoom();
      return;
    }

    // Calcular bounding box de todos los elementos
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Radiadores
    radiators.forEach(rad => {
      minX = Math.min(minX, rad.x);
      minY = Math.min(minY, rad.y);
      maxX = Math.max(maxX, rad.x + rad.width);
      maxY = Math.max(maxY, rad.y + rad.height);
    });

    // Calderas
    boilers.forEach(boiler => {
      minX = Math.min(minX, boiler.x);
      minY = Math.min(minY, boiler.y);
      maxX = Math.max(maxX, boiler.x + boiler.width);
      maxY = Math.max(maxY, boiler.y + boiler.height);
    });

    // Tuberías
    pipes.forEach(pipe => {
      pipe.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    // Calcular centro y dimensiones del bounding box
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const contentCenterX = minX + contentWidth / 2;
    const contentCenterY = minY + contentHeight / 2;

    // Calcular zoom para que todo quepa con margen
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const margin = 50; // Margen en píxeles

    const zoomX = (canvasWidth - margin * 2) / contentWidth;
    const zoomY = (canvasHeight - margin * 2) / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, 5); // No más de 5x

    // Calcular offset para centrar
    const newPanX = canvasWidth / 2 - contentCenterX * newZoom;
    const newPanY = canvasHeight / 2 - contentCenterY * newZoom;

    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };

  // Calcular distancia entre dos puntos táctiles
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handler para touch start (inicio de toque)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom con dos dedos
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastTouchDistance(distance);
      // También habilitar pan con dos dedos
      setIsPanning(true);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setLastPanPoint({ x: midX, y: midY });
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Con un dedo, iniciar pan si no hay un drag activo
      // Esto permite pan en cualquier modo cuando no arrastras un elemento
      setLastPanPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  // Handler para touch move (movimiento de toque)
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      // Pinch-to-zoom con dos dedos
      if (lastTouchDistance !== null) {
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = distance / lastTouchDistance;
        setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom * scale)));
        setLastTouchDistance(distance);
      }
      
      // Pan simultáneo con el punto medio de los dos dedos
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dx = midX - lastPanPoint.x;
      const dy = midY - lastPanPoint.y;
      
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setLastPanPoint({ x: midX, y: midY });
      e.preventDefault();
    } else if (e.touches.length === 1 && !isDragging) {
      // Pan con un dedo solo si no estamos arrastrando un elemento
      const touch = e.touches[0];
      const dx = touch.clientX - lastPanPoint.x;
      const dy = touch.clientY - lastPanPoint.y;
      
      // Solo hacer pan si el movimiento es significativo (más de 5px)
      // Esto evita interferir con clicks/taps
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        setIsPanning(true);
        setPanOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
      }
      
      setLastPanPoint({
        x: touch.clientX,
        y: touch.clientY
      });
    }
  };

  // Handler para touch end (fin de toque)
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
    }
    if (e.touches.length === 0) {
      setIsPanning(false);
    }
  };

  // Handler para wheel (zoom con rueda del mouse)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom * (1 + delta))));
  };

  // Determinar el cursor según el estado
  const getCursor = () => {
    if (tool === 'select' && isDragging) return 'grabbing';
    if (tool === 'select') {
      // Verificar si el mouse está sobre algún elemento
      const overElement = radiators.some(r => isPointInsideRadiator(mousePos.x, mousePos.y, r)) ||
                          boilers.some(b => isPointInsideBoiler(mousePos.x, mousePos.y, b)) ||
                          pipes.some(p => isPointNearPipe(mousePos, p.points, 10));
      
      if (overElement) return 'grab';
      return 'default';
    }
    if (tool === 'radiator' || tool === 'boiler') return 'copy';
    return 'default';
  };

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc',
          cursor: getCursor(),
          touchAction: 'none', // Prevenir scroll nativo en touch
        }}
      />
      
      {/* Controles de Zoom */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '2px solid #2196F3',
            background: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          title="Acercar (Zoom In)"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '2px solid #2196F3',
            background: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          title="Alejar (Zoom Out)"
        >
          −
        </button>
        <button
          onClick={handleResetZoom}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '2px solid #757575',
            background: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          title="Restablecer Zoom"
        >
          ⟲
        </button>
        <button
          onClick={handleFitAll}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '2px solid #4CAF50',
            background: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          title="Encuadrar Todo"
        >
          ⊡
        </button>
      </div>
      
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(255,255,255,0.8)',
        padding: '5px 10px',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}>
        Tool: {tool} | Zoom: {(zoom * 100).toFixed(0)}% | Mouse: ({mousePos.x.toFixed(0)}, {mousePos.y.toFixed(0)})
      </div>
    </div>
  );
};
