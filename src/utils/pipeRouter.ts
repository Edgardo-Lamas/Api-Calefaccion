import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment } from '../models/PipeSegment';

interface Point {
  x: number;
  y: number;
}

/**
 * Detecta pared exterior más cercana y reubica radiador centrado en ella
 * Los radiadores se colocan PARALELOS a la pared (horizontal en paredes top/bottom, vertical en left/right)
 * DENTRO del área del plano, no en los bordes del canvas
 */
function repositionRadiatorToExteriorWall(
  radiator: Radiator,
  planoWidth: number,
  planoHeight: number,
  planoOffsetX: number,
  planoOffsetY: number
): { x: number; y: number; width: number; height: number; isRotated: boolean } {
  const WALL_MARGIN = 30; // Distancia desde la pared INTERIOR del plano
  
  // Dimensiones originales (vista superior: 60x12)
  const originalWidth = 60;
  const originalHeight = 12;
  
  // Calcular límites del plano
  const planoLeft = planoOffsetX;
  const planoRight = planoOffsetX + planoWidth;
  const planoTop = planoOffsetY;
  const planoBottom = planoOffsetY + planoHeight;
  
  // Calcular distancias a cada borde DEL PLANO
  const distToTop = Math.abs(radiator.y - planoTop);
  const distToBottom = Math.abs((radiator.y + radiator.height) - planoBottom);
  const distToLeft = Math.abs(radiator.x - planoLeft);
  const distToRight = Math.abs((radiator.x + radiator.width) - planoRight);
  
  // Encontrar pared exterior más cercana
  const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
  
  let newX = radiator.x;
  let newY = radiator.y;
  let width = originalWidth;
  let height = originalHeight;
  let isRotated = false;
  
  if (minDist === distToTop) {
    // Pared superior - radiador HORIZONTAL (paralelo a la pared)
    newY = planoTop + WALL_MARGIN;
    width = originalWidth;  // Largo horizontal
    height = originalHeight; // Ancho vertical
  } else if (minDist === distToBottom) {
    // Pared inferior - radiador HORIZONTAL
    newY = planoBottom - originalHeight - WALL_MARGIN;
    width = originalWidth;
    height = originalHeight;
  } else if (minDist === distToLeft) {
    // Pared izquierda - radiador VERTICAL (perpendicular, rotado 90°)
    newX = planoLeft + WALL_MARGIN;
    width = originalHeight;  // Intercambiar: ancho se vuelve alto
    height = originalWidth;  // Largo se vuelve ancho
    isRotated = true;
  } else {
    // Pared derecha - radiador VERTICAL
    newX = planoRight - originalHeight - WALL_MARGIN;
    width = originalHeight;
    height = originalWidth;
    isRotated = true;
  }
  
  return { x: newX, y: newY, width, height, isRotated };
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
 * Los radiadores permanecen en su posición actual - NO se reubican
 */
export function generateAutoPipes(
  radiators: Radiator[],
  boilers: Boiler[]
): {
  pipes: PipeSegment[];
  repositionedRadiators: Array<{ id: string; x: number; y: number; width?: number; height?: number }>;
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
  let pipeIdCounter = Date.now();
  
  // 1. Caldera principal
  const boiler = boilers[0];
  const boilerCenter = {
    x: boiler.x + boiler.width / 2,
    y: boiler.y + boiler.height / 2
  };

  // 2. Calcular paths completos para cada radiador
  interface RadiatorPath {
    radiatorId: string;
    connection: Point;
    path: Point[];
    isVertical: boolean;
  }
  
  const radiatorPaths: RadiatorPath[] = radiators.map(radiator => {
    const isVertical = radiator.height > radiator.width;
    const connection = {
      x: isVertical ? radiator.x + radiator.width / 3 : radiator.x + 10,
      y: isVertical ? radiator.y + 10 : radiator.y + radiator.height / 2
    };
    const path = findShortestPath(boilerCenter, connection);
    
    return { radiatorId: radiator.id, connection, path, isVertical };
  });

  // 3. Detectar puntos de ramificación (donde los paths se dividen)
  // Un path L-shape tiene 3 puntos: [start, corner, end]
  // Los paths se ramifican en el "corner" si comparten la misma dirección inicial
  
  const PARALLEL_OFFSET = 8;
  
  // Agrupar radiadores por dirección inicial desde la caldera
  const pathGroups = new Map<string, RadiatorPath[]>();
  
  radiatorPaths.forEach(rp => {
    // La dirección se define por el segundo punto (corner)
    const corner = rp.path[1];
    const key = `${corner.x},${corner.y}`;
    
    if (!pathGroups.has(key)) {
      pathGroups.set(key, []);
    }
    pathGroups.get(key)!.push(rp);
  });

  // 4. Generar tuberías segmentadas
  pathGroups.forEach((group) => {
    if (group.length === 1) {
      // Solo 1 radiador en esta dirección: tubería completa desde caldera
      const rp = group[0];
      
      // IDA
      pipes.push({
        id: `pipe-supply-${pipeIdCounter++}`,
        type: 'pipe',
        pipeType: 'supply',
        points: rp.path,
        diameter: 16, // Default sin dimensionar
        material: 'Multicapa',
        floor: boiler.floor, // Asignar planta de la caldera
      });
      
      // RETORNO
      const returnPath = rp.path.map(p => ({
        x: p.x + PARALLEL_OFFSET,
        y: p.y + PARALLEL_OFFSET
      }));
      pipes.push({
        id: `pipe-return-${pipeIdCounter++}`,
        type: 'pipe',
        pipeType: 'return',
        points: returnPath,
        diameter: 16, // Default sin dimensionar
        material: 'Multicapa',
        floor: boiler.floor, // Asignar planta de la caldera
      });
      
    } else {
      // Múltiples radiadores comparten el tramo inicial
      // Crear: 1 tramo común + N tramos individuales
      
      const commonStart = group[0].path[0]; // Caldera
      const commonCorner = group[0].path[1]; // Punto de ramificación
      
      // TRAMO COMÚN (caldera → punto de ramificación)
      const commonPath = [commonStart, commonCorner];
      
      pipes.push({
        id: `pipe-supply-common-${pipeIdCounter++}`,
        type: 'pipe',
        pipeType: 'supply',
        points: commonPath,
        diameter: 16, // Default sin dimensionar - se calculará luego
        material: 'Multicapa',
        floor: boiler.floor, // Asignar planta de la caldera
      });
      
      const commonReturnPath = commonPath.map(p => ({
        x: p.x + PARALLEL_OFFSET,
        y: p.y + PARALLEL_OFFSET
      }));
      pipes.push({
        id: `pipe-return-common-${pipeIdCounter++}`,
        type: 'pipe',
        pipeType: 'return',
        points: commonReturnPath,
        diameter: 16, // Default sin dimensionar
        material: 'Multicapa',
        floor: boiler.floor, // Asignar planta de la caldera
      });
      
      // TRAMOS INDIVIDUALES (ramificación → cada radiador)
      group.forEach(rp => {
        const branchPath = [commonCorner, rp.path[2]]; // Desde ramificación hasta radiador
        
        pipes.push({
          id: `pipe-supply-${pipeIdCounter++}`,
          type: 'pipe',
          pipeType: 'supply',
          points: branchPath,
          diameter: 16, // Default sin dimensionar
          material: 'Multicapa',
          floor: boiler.floor, // Asignar planta de la caldera
        });
        
        const branchReturnPath = branchPath.map(p => ({
          x: p.x + PARALLEL_OFFSET,
          y: p.y + PARALLEL_OFFSET
        }));
        pipes.push({
          id: `pipe-return-${pipeIdCounter++}`,
          type: 'pipe',
          pipeType: 'return',
          points: branchReturnPath,
          diameter: 16, // Default sin dimensionar
          material: 'Multicapa',
          floor: boiler.floor, // Asignar planta de la caldera
        });
      });
    }
  });

  console.log(`✅ Generadas ${pipes.length} tuberías (${pipes.length / 2} pares IDA/RETORNO)`);
  console.log(`📍 ${pathGroups.size} grupos de ramificación detectados`);
  console.log(`📍 Radiadores mantienen su posición actual (no reubicados)`);
  
  return { pipes, repositionedRadiators: [] };
}
