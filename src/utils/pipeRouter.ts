import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment, PipeType } from '../models/PipeSegment';

interface Point {
  x: number;
  y: number;
}

interface GridNode {
  x: number;
  y: number;
  g: number; // Costo desde inicio
  h: number; // Heurística hasta destino
  f: number; // g + h
  parent?: GridNode;
}

const GRID_SIZE = 20; // Resolución de la grid (px)
const OBSTACLE_MARGIN = 30; // Margen alrededor de elementos (px)

/**
 * Calcula distancia Manhattan entre dos puntos
 */
function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Verifica si un punto está dentro de un obstáculo (radiador o caldera)
 */
function isPointInObstacle(
  point: Point,
  radiators: Radiator[],
  boilers: Boiler[],
  excludeId?: string
): boolean {
  // Verificar radiadores
  for (const radiator of radiators) {
    if (radiator.id === excludeId) continue;
    
    const left = radiator.x - OBSTACLE_MARGIN;
    const right = radiator.x + radiator.width + OBSTACLE_MARGIN;
    const top = radiator.y - OBSTACLE_MARGIN;
    const bottom = radiator.y + radiator.height + OBSTACLE_MARGIN;
    
    if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
      return true;
    }
  }
  
  // Verificar calderas
  for (const boiler of boilers) {
    if (boiler.id === excludeId) continue;
    
    const left = boiler.x - OBSTACLE_MARGIN;
    const right = boiler.x + boiler.width + OBSTACLE_MARGIN;
    const top = boiler.y - OBSTACLE_MARGIN;
    const bottom = boiler.y + boiler.height + OBSTACLE_MARGIN;
    
    if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
      return true;
    }
  }
  
  return false;
}

/**
 * Encuentra la caldera más cercana a un radiador
 */
function findNearestBoiler(radiator: Radiator, boilers: Boiler[]): Boiler | null {
  if (boilers.length === 0) return null;
  
  let nearest = boilers[0];
  let minDistance = manhattanDistance(
    { x: radiator.x + radiator.width / 2, y: radiator.y + radiator.height / 2 },
    { x: nearest.x + nearest.width / 2, y: nearest.y + nearest.height / 2 }
  );
  
  for (let i = 1; i < boilers.length; i++) {
    const distance = manhattanDistance(
      { x: radiator.x + radiator.width / 2, y: radiator.y + radiator.height / 2 },
      { x: boilers[i].x + boilers[i].width / 2, y: boilers[i].y + boilers[i].height / 2 }
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = boilers[i];
    }
  }
  
  return nearest;
}

/**
 * Algoritmo A* para encontrar ruta ortogonal entre dos puntos evitando obstáculos
 */
function findPath(
  start: Point,
  end: Point,
  radiators: Radiator[],
  boilers: Boiler[],
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  // Redondear a la grid
  const startNode: GridNode = {
    x: Math.round(start.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(start.y / GRID_SIZE) * GRID_SIZE,
    g: 0,
    h: manhattanDistance(start, end),
    f: manhattanDistance(start, end),
  };
  
  const endNode: GridNode = {
    x: Math.round(end.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(end.y / GRID_SIZE) * GRID_SIZE,
    g: 0,
    h: 0,
    f: 0,
  };
  
  const openList: GridNode[] = [startNode];
  const closedSet = new Set<string>();
  
  // Direcciones ortogonales (arriba, derecha, abajo, izquierda)
  const directions = [
    { x: 0, y: -GRID_SIZE },  // Arriba
    { x: GRID_SIZE, y: 0 },   // Derecha
    { x: 0, y: GRID_SIZE },   // Abajo
    { x: -GRID_SIZE, y: 0 },  // Izquierda
  ];
  
  let iterations = 0;
  const MAX_ITERATIONS = 10000; // Prevenir bucles infinitos
  
  while (openList.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    
    // Encontrar nodo con menor f
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;
    
    const currentKey = `${current.x},${current.y}`;
    
    // Si llegamos al destino
    if (Math.abs(current.x - endNode.x) < GRID_SIZE && Math.abs(current.y - endNode.y) < GRID_SIZE) {
      // Reconstruir path
      const path: Point[] = [];
      let node: GridNode | undefined = current;
      
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      
      // Simplificar path eliminando puntos intermedios en líneas rectas
      return simplifyPath(path);
    }
    
    closedSet.add(currentKey);
    
    // Explorar vecinos
    for (const dir of directions) {
      const neighborX = current.x + dir.x;
      const neighborY = current.y + dir.y;
      
      // Verificar límites del canvas
      if (neighborX < 0 || neighborX > canvasWidth || neighborY < 0 || neighborY > canvasHeight) {
        continue;
      }
      
      const neighborKey = `${neighborX},${neighborY}`;
      
      if (closedSet.has(neighborKey)) {
        continue;
      }
      
      // Verificar obstáculos
      if (isPointInObstacle({ x: neighborX, y: neighborY }, radiators, boilers)) {
        continue;
      }
      
      const g = current.g + GRID_SIZE;
      const h = manhattanDistance({ x: neighborX, y: neighborY }, endNode);
      const f = g + h;
      
      // Verificar si ya está en openList con mejor costo
      const existingIndex = openList.findIndex(n => n.x === neighborX && n.y === neighborY);
      
      if (existingIndex >= 0) {
        if (g < openList[existingIndex].g) {
          openList[existingIndex].g = g;
          openList[existingIndex].f = f;
          openList[existingIndex].parent = current;
        }
      } else {
        openList.push({
          x: neighborX,
          y: neighborY,
          g,
          h,
          f,
          parent: current,
        });
      }
    }
  }
  
  // Si no se encuentra path, devolver línea directa
  console.warn('⚠️ No se encontró path A*, usando línea directa');
  return [start, end];
}

/**
 * Simplifica un path eliminando puntos intermedios en líneas rectas
 */
function simplifyPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;
  
  const simplified: Point[] = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];
    
    // Si no están en la misma línea recta, agregar el punto
    const isHorizontalLine = prev.y === current.y && current.y === next.y;
    const isVerticalLine = prev.x === current.x && current.x === next.x;
    
    if (!isHorizontalLine && !isVerticalLine) {
      simplified.push(current);
    }
  }
  
  simplified.push(path[path.length - 1]);
  
  return simplified;
}

/**
 * Genera tuberías automáticas conectando radiadores a calderas
 */
export function generateAutoPipes(
  radiators: Radiator[],
  boilers: Boiler[],
  canvasWidth: number = 1200,
  canvasHeight: number = 800
): PipeSegment[] {
  if (boilers.length === 0) {
    console.warn('⚠️ No hay calderas para conectar');
    return [];
  }
  
  const pipes: PipeSegment[] = [];
  let pipeIdCounter = Date.now();
  
  // Para cada radiador, crear tubería de IDA y RETORNO a la caldera más cercana
  for (const radiator of radiators) {
    const nearestBoiler = findNearestBoiler(radiator, boilers);
    
    if (!nearestBoiler) continue;
    
    // Punto de conexión en el radiador (centro inferior)
    const radiatorPoint: Point = {
      x: radiator.x + radiator.width / 2,
      y: radiator.y + radiator.height,
    };
    
    // Punto de conexión en la caldera (centro superior)
    const boilerPoint: Point = {
      x: nearestBoiler.x + nearestBoiler.width / 2,
      y: nearestBoiler.y,
    };
    
    // TUBERÍA DE IDA (supply - roja)
    const supplyPath = findPath(
      boilerPoint,
      radiatorPoint,
      radiators,
      boilers,
      canvasWidth,
      canvasHeight
    );
    
    pipes.push({
      id: `pipe-supply-${pipeIdCounter++}`,
      type: 'pipe',
      pipeType: 'supply' as PipeType,
      points: supplyPath,
      diameter: 20,
      material: 'Multicapa',
    });
    
    // TUBERÍA DE RETORNO (return - azul)
    // Offset para que no se superpongan visualmente
    const returnRadiatorPoint: Point = {
      x: radiatorPoint.x + 15,
      y: radiatorPoint.y,
    };
    
    const returnBoilerPoint: Point = {
      x: boilerPoint.x + 15,
      y: boilerPoint.y,
    };
    
    const returnPath = findPath(
      returnRadiatorPoint,
      returnBoilerPoint,
      radiators,
      boilers,
      canvasWidth,
      canvasHeight
    );
    
    pipes.push({
      id: `pipe-return-${pipeIdCounter++}`,
      type: 'pipe',
      pipeType: 'return' as PipeType,
      points: returnPath,
      diameter: 20,
      material: 'Multicapa',
    });
  }
  
  console.log(`✅ Generadas ${pipes.length} tuberías automáticas (${pipes.length / 2} pares IDA/RETORNO)`);
  
  return pipes;
}
