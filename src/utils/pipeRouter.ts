import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment } from '../models/PipeSegment';

interface Point {
  x: number;
  y: number;
}

/**
 * Detecta pared exterior más cercana y reubica radiador centrado en ella
 * Asume que las paredes exteriores son los bordes del canvas o las más alejadas
 */
function repositionRadiatorToExteriorWall(
  radiator: Radiator,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const WALL_MARGIN = 30; // Distancia desde la pared
  
  // Calcular distancias a cada pared
  const distToTop = radiator.y;
  const distToBottom = canvasHeight - (radiator.y + radiator.height);
  const distToLeft = radiator.x;
  const distToRight = canvasWidth - (radiator.x + radiator.width);
  
  // Encontrar pared exterior más cercana (suponiendo que es la más cercana al borde)
  const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
  
  let newX = radiator.x;
  let newY = radiator.y;
  
  if (minDist === distToTop) {
    // Pared superior (exterior) - centrar horizontalmente
    newY = WALL_MARGIN;
    // Mantener X o centrar en la habitación estimada
  } else if (minDist === distToBottom) {
    // Pared inferior (exterior)
    newY = canvasHeight - radiator.height - WALL_MARGIN;
  } else if (minDist === distToLeft) {
    // Pared izquierda (exterior) - centrar verticalmente
    newX = WALL_MARGIN;
  } else {
    // Pared derecha (exterior)
    newX = canvasWidth - radiator.width - WALL_MARGIN;
  }
  
  return { x: newX, y: newY };
}

/**
 * Encuentra el camino más corto ortogonal entre dos puntos
 * Usa solo 2 segmentos (L-shape): horizontal luego vertical o viceversa
 */
function findShortestPath(start: Point, end: Point): Point[] {
  // Opción 1: Ir horizontal primero, luego vertical
  const path1: Point[] = [
    start,
    { x: end.x, y: start.y },
    end
  ];
  
  // Opción 2: Ir vertical primero, luego horizontal
  const path2: Point[] = [
    start,
    { x: start.x, y: end.y },
    end
  ];
  
  // Calcular distancia total (ambas opciones tienen la misma distancia Manhattan)
  // Elegir basándose en cuál crea menos cruces o es más natural
  // Para simplificar, elegimos ir horizontal si la distancia horizontal es mayor
  if (Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)) {
    return path1;
  } else {
    return path2;
  }
}

/**
 * Genera tuberías automáticas con routing optimizado (distancia mínima)
 * También reubica radiadores en paredes exteriores/bajo ventanas
 */
export function generateAutoPipes(
  radiators: Radiator[],
  boilers: Boiler[],
  canvasWidth: number = 1200,
  canvasHeight: number = 800
): {
  pipes: PipeSegment[];
  repositionedRadiators: Array<{ id: string; x: number; y: number }>;
} {
  if (boilers.length === 0) {
    console.warn('⚠️ No hay calderas para conectar');
    return { pipes: [], repositionedRadiators: [] };
  }
  
  if (radiators.length === 0) {
    console.warn('⚠️ No hay radiadores para conectar');
    return { pipes: [], repositionedRadiators: [] };
  }

  const pipes: PipeSegment[] = [];
  const repositionedRadiators: Array<{ id: string; x: number; y: number }> = [];
  let pipeIdCounter = Date.now();
  
  // 1. Caldera principal
  const boiler = boilers[0];
  const boilerCenter = {
    x: boiler.x + boiler.width / 2,
    y: boiler.y + boiler.height / 2
  };

  // 2. Reubicar cada radiador en pared exterior y crear conexiones directas
  radiators.forEach(radiator => {
    // Reubicar radiador a pared exterior
    const newPosition = repositionRadiatorToExteriorWall(radiator, canvasWidth, canvasHeight);
    repositionedRadiators.push({
      id: radiator.id,
      x: newPosition.x,
      y: newPosition.y
    });
    
    // Punto de conexión del radiador (donde están las conexiones dibujadas)
    const radiatorConnection = {
      x: newPosition.x + 10, // Donde dibujamos los puntos de conexión
      y: newPosition.y + radiator.height / 2
    };

    // 3. Crear path más corto desde caldera a radiador
    const shortestPath = findShortestPath(boilerCenter, radiatorConnection);

    // 4. TUBERÍA IDA (roja)
    pipes.push({
      id: `pipe-supply-${pipeIdCounter++}`,
      type: 'pipe',
      pipeType: 'supply',
      points: shortestPath,
      diameter: 20,
      material: 'Multicapa',
    });

    // 5. TUBERÍA RETORNO (azul) - paralela con offset
    const PARALLEL_OFFSET = 8;
    const returnPath = shortestPath.map(p => ({
      x: p.x + PARALLEL_OFFSET,
      y: p.y + PARALLEL_OFFSET
    }));

    pipes.push({
      id: `pipe-return-${pipeIdCounter++}`,
      type: 'pipe',
      pipeType: 'return',
      points: returnPath,
      diameter: 20,
      material: 'Multicapa',
    });
  });

  console.log(`✅ Generadas ${pipes.length} tuberías (${pipes.length / 2} pares IDA/RETORNO)`);
  console.log(`✅ Reubicados ${repositionedRadiators.length} radiadores en paredes exteriores`);
  
  return { pipes, repositionedRadiators };
}
