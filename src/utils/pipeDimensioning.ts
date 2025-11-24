import { PipeSegment } from '../models/PipeSegment';
import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';

/**
 * Calcula el caudal necesario basado en la potencia
 * Fórmula: Caudal (L/h) = Potencia (Kcal/h) / ΔT
 * Donde ΔT típico = 20°C (80°C ida - 60°C retorno)
 */
export function calculateFlowRate(powerKcal: number): number {
  const deltaT = 20; // °C
  return powerKcal / deltaT; // L/h
}

/**
 * Determina el diámetro óptimo de tubería según el caudal
 * Basado en velocidad óptima del agua: 0.5 - 1.5 m/s
 */
export function calculatePipeDiameter(flowRate: number): number {
  // Tabla de dimensionamiento según caudal (L/h)
  if (flowRate <= 300) return 16;  // Hasta 300 L/h → 16mm
  if (flowRate <= 600) return 20;  // 300-600 L/h → 20mm
  if (flowRate <= 1200) return 25; // 600-1200 L/h → 25mm
  if (flowRate <= 2500) return 32; // 1200-2500 L/h → 32mm
  return 40; // Más de 2500 L/h → 40mm
}

/**
 * Encuentra qué radiadores alimenta una tubería específica
 * siguiendo el recorrido desde el punto final de la tubería
 */
function findDownstreamRadiators(
  pipe: PipeSegment,
  allPipes: PipeSegment[],
  radiators: Radiator[]
): Radiator[] {
  const downstreamRadiators: Radiator[] = [];
  
  // Punto final de esta tubería
  const endPoint = pipe.points[pipe.points.length - 1];
  
  // Buscar radiadores cercanos al punto final (tolerancia 15px)
  radiators.forEach(rad => {
    const isVertical = rad.height > rad.width;
    const connectionPoint = {
      x: isVertical ? rad.x + rad.width / 3 : rad.x + 10,
      y: isVertical ? rad.y + 10 : rad.y + rad.height / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(endPoint.x - connectionPoint.x, 2) +
      Math.pow(endPoint.y - connectionPoint.y, 2)
    );
    
    if (distance <= 15) {
      downstreamRadiators.push(rad);
    }
  });
  
  // Buscar tuberías que empiezan donde termina esta
  allPipes.forEach(otherPipe => {
    if (otherPipe.id === pipe.id) return;
    
    const otherStart = otherPipe.points[0];
    const distance = Math.sqrt(
      Math.pow(endPoint.x - otherStart.x, 2) +
      Math.pow(endPoint.y - otherStart.y, 2)
    );
    
    // Si otra tubería empieza aquí, sumar sus radiadores
    if (distance <= 15) {
      const childRadiators = findDownstreamRadiators(otherPipe, allPipes, radiators);
      downstreamRadiators.push(...childRadiators);
    }
  });
  
  return downstreamRadiators;
}

/**
 * Dimensiona automáticamente todas las tuberías según la potencia
 * de los radiadores que alimentan
 */
export function dimensionPipes(
  pipes: PipeSegment[],
  radiators: Radiator[],
  boilers: Boiler[]
): PipeSegment[] {
  if (boilers.length === 0 || radiators.length === 0) {
    console.warn('⚠️ Se necesitan calderas y radiadores para dimensionar');
    return pipes;
  }
  
  // Clonar tuberías para no mutar el original
  const dimensionedPipes = pipes.map(pipe => {
    // Solo dimensionar tuberías de IDA (supply)
    // Las de retorno usan el mismo diámetro
    if (pipe.pipeType !== 'supply') {
      return pipe;
    }
    
    // Encontrar radiadores downstream
    const downstreamRads = findDownstreamRadiators(pipe, pipes, radiators);
    
    // Calcular potencia total
    const totalPower = downstreamRads.reduce((sum, rad) => sum + rad.power, 0);
    
    if (totalPower === 0) {
      return pipe; // Sin radiadores, mantener diámetro actual
    }
    
    // Calcular caudal y diámetro
    const flowRate = calculateFlowRate(totalPower);
    const diameter = calculatePipeDiameter(flowRate);
    
    console.log(
      `📏 Tubería ${pipe.id}: ${downstreamRads.length} rad, ` +
      `${totalPower} Kcal/h, ${Math.round(flowRate)} L/h → ${diameter}mm`
    );
    
    return {
      ...pipe,
      diameter
    };
  });
  
  // Actualizar tuberías de RETORNO con el mismo diámetro que su IDA
  const finalPipes = dimensionedPipes.map(pipe => {
    if (pipe.pipeType === 'return') {
      // Buscar la tubería IDA correspondiente (mismo índice -1 o +1)
      const supplyPipe = dimensionedPipes.find(p => 
        p.pipeType === 'supply' && 
        p.id.replace('supply', '') === pipe.id.replace('return', '')
      );
      
      if (supplyPipe) {
        return {
          ...pipe,
          diameter: supplyPipe.diameter
        };
      }
    }
    return pipe;
  });
  
  console.log(`✅ ${finalPipes.length} tuberías dimensionadas automáticamente`);
  
  return finalPipes;
}

/**
 * Obtiene información de dimensionamiento para mostrar en UI
 */
export function getPipeDimensionInfo(
  pipe: PipeSegment,
  allPipes: PipeSegment[],
  radiators: Radiator[]
): {
  totalPower: number;
  flowRate: number;
  recommendedDiameter: number;
  radiatorCount: number;
} {
  if (pipe.pipeType !== 'supply') {
    // Para tuberías de retorno, buscar la de ida correspondiente
    const supplyPipe = allPipes.find(p => 
      p.pipeType === 'supply' && 
      p.id.replace('supply', '') === pipe.id.replace('return', '')
    );
    
    if (supplyPipe) {
      return getPipeDimensionInfo(supplyPipe, allPipes, radiators);
    }
  }
  
  const downstreamRads = findDownstreamRadiators(pipe, allPipes, radiators);
  const totalPower = downstreamRads.reduce((sum, rad) => sum + rad.power, 0);
  const flowRate = calculateFlowRate(totalPower);
  const recommendedDiameter = calculatePipeDiameter(flowRate);
  
  return {
    totalPower,
    flowRate: Math.round(flowRate),
    recommendedDiameter,
    radiatorCount: downstreamRads.length
  };
}
