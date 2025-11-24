import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment } from '../models/PipeSegment';

interface Point {
  x: number;
  y: number;
}

/**
 * Calcula distancia Manhattan entre dos puntos
 */
function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Genera tuberías automáticas con circuito perimetral realista
 * Basado en planos reales: circuito principal + derivaciones tipo T
 */
export function generateAutoPipes(
  radiators: Radiator[],
  boilers: Boiler[]
): PipeSegment[] {
  if (boilers.length === 0) {
    console.warn('⚠️ No hay calderas para conectar');
    return [];
  }
  
  if (radiators.length === 0) {
    console.warn('⚠️ No hay radiadores para conectar');
    return [];
  }

  const pipes: PipeSegment[] = [];
  let pipeIdCounter = Date.now();
  
  // 1. Tomar la caldera principal (la primera)
  const boiler = boilers[0];
  const boilerCenter = {
    x: boiler.x + boiler.width / 2,
    y: boiler.y + boiler.height / 2
  };

  // 2. Calcular bounding box de todos los radiadores
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  radiators.forEach(rad => {
    minX = Math.min(minX, rad.x);
    minY = Math.min(minY, rad.y);
    maxX = Math.max(maxX, rad.x + rad.width);
    maxY = Math.max(maxY, rad.y + rad.height);
  });

  // Margen perimetral
  const MARGIN = 40;
  minX -= MARGIN;
  minY -= MARGIN;
  maxX += MARGIN;
  maxY += MARGIN;

  // 3. Crear circuito principal perimetral (rectángulo que recorre todo)
  const perimeterPath: Point[] = [
    { x: minX, y: minY },         // Esquina superior izquierda
    { x: maxX, y: minY },         // Esquina superior derecha  
    { x: maxX, y: maxY },         // Esquina inferior derecha
    { x: minX, y: maxY },         // Esquina inferior izquierda
    { x: minX, y: minY },         // Volver al inicio (cerrar circuito)
  ];

  // 4. Conectar caldera al circuito principal (punto más cercano)
  const closestPointOnPerimeter = findClosestPointOnPath(boilerCenter, perimeterPath);
  
  // Tubería de conexión: caldera → circuito principal
  const boilerToPerimeter: Point[] = [
    boilerCenter,
    { x: boilerCenter.x, y: closestPointOnPerimeter.y }, // Ir vertical primero
    closestPointOnPerimeter
  ];

  // 5. Generar circuito IDA (rojo)
  pipes.push({
    id: `pipe-supply-main-${pipeIdCounter++}`,
    type: 'pipe',
    pipeType: 'supply',
    points: [...boilerToPerimeter, ...perimeterPath],
    diameter: 25, // Tubería principal más gruesa
    material: 'Multicapa',
  });

  // 6. Generar circuito RETORNO (azul) - paralelo con offset
  const PARALLEL_OFFSET = 8;
  const returnPath = perimeterPath.map(p => ({
    x: p.x + PARALLEL_OFFSET,
    y: p.y + PARALLEL_OFFSET
  }));
  
  const returnBoilerToPerimeter = boilerToPerimeter.map(p => ({
    x: p.x + PARALLEL_OFFSET,
    y: p.y + PARALLEL_OFFSET
  }));

  pipes.push({
    id: `pipe-return-main-${pipeIdCounter++}`,
    type: 'pipe',
    pipeType: 'return',
    points: [...returnBoilerToPerimeter, ...returnPath],
    diameter: 25,
    material: 'Multicapa',
  });

  // 7. Derivar cada radiador al circuito más cercano (conexión tipo T)
  radiators.forEach(radiator => {
    const radCenter = {
      x: radiator.x + radiator.width / 2,
      y: radiator.y + radiator.height
    };

    // Encontrar punto más cercano en el circuito perimetral
    const closestOnPerimeter = findClosestPointOnPath(radCenter, perimeterPath);

    // Derivación IDA (rojo)
    const supplyBranch: Point[] = [
      closestOnPerimeter,
      { x: closestOnPerimeter.x, y: radCenter.y }, // Vertical
      { x: radCenter.x, y: radCenter.y }           // Horizontal hasta radiador
    ];

    pipes.push({
      id: `pipe-supply-branch-${pipeIdCounter++}`,
      type: 'pipe',
      pipeType: 'supply',
      points: supplyBranch,
      diameter: 20,
      material: 'Multicapa',
    });

    // Derivación RETORNO (azul) - paralela
    const returnBranch: Point[] = supplyBranch.map((p, idx) => ({
      x: p.x + (idx === supplyBranch.length - 1 ? 0 : PARALLEL_OFFSET),
      y: p.y + PARALLEL_OFFSET
    }));

    pipes.push({
      id: `pipe-return-branch-${pipeIdCounter++}`,
      type: 'pipe',
      pipeType: 'return',
      points: returnBranch,
      diameter: 20,
      material: 'Multicapa',
    });
  });

  console.log(`✅ Generado circuito perimetral + ${radiators.length * 2} derivaciones (${pipes.length} tuberías totales)`);
  
  return pipes;
}

/**
 * Encuentra el punto más cercano en un path a un punto dado
 */
function findClosestPointOnPath(point: Point, path: Point[]): Point {
  let closest = path[0];
  let minDistance = manhattanDistance(point, closest);

  for (let i = 1; i < path.length; i++) {
    const distance = manhattanDistance(point, path[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closest = path[i];
    }
  }

  return closest;
}
