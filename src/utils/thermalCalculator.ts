import { Room } from '../models/Room';
import { Radiator } from '../models/Radiator';

/**
 * Calcula la potencia requerida para una habitación
 * Formula base: Area × Factor térmico
 * Ajustes: pared exterior +15%, ventanas +0% a +20%
 */
export function calculateRoomPower(room: Room): number {
  // Potencia base: área × factor térmico
  let power = room.area * room.thermalFactor;
  
  // Ajuste por pared exterior (+15%)
  if (room.hasExteriorWall) {
    power *= 1.15;
  }
  
  // Ajuste por nivel de ventanas
  const windowFactors = {
    'sin-ventanas': 1.0,   // Sin ajuste
    'pocas': 1.05,         // +5%
    'normales': 1.10,      // +10%
    'muchas': 1.20         // +20%
  };
  power *= windowFactors[room.windowsLevel];
  
  return Math.round(power);
}

/**
 * Calcula la potencia total instalada en radiadores de una habitación
 */
export function calculateInstalledPower(room: Room, radiators: Radiator[]): number {
  const roomRadiators = radiators.filter(rad => room.radiatorIds.includes(rad.id));
  const totalPower = roomRadiators.reduce((sum, rad) => sum + rad.power, 0);
  return totalPower;
}

/**
 * Verifica si la potencia instalada es suficiente para la habitación
 */
export function isPowerSufficient(room: Room, radiators: Radiator[]): {
  required: number;
  installed: number;
  sufficient: boolean;
  percentage: number;
} {
  const required = calculateRoomPower(room);
  const installed = calculateInstalledPower(room, radiators);
  const percentage = required > 0 ? Math.round((installed / required) * 100) : 0;
  
  return {
    required,
    installed,
    sufficient: installed >= required,
    percentage
  };
}

/**
 * Calcula la potencia de caldera necesaria
 * La caldera debe trabajar al 80% de su capacidad máxima
 * Por lo tanto: Potencia Caldera = Potencia Total Radiadores ÷ 0.80
 */
export function calculateBoilerPower(radiators: Radiator[]): {
  totalRadiatorPower: number;
  recommendedBoilerPower: number;
  workingPercentage: number;
} {
  // Sumar potencia de todos los radiadores
  const totalRadiatorPower = radiators.reduce((sum, rad) => sum + rad.power, 0);
  
  // La caldera debe tener capacidad para que trabaje al 80%
  // Potencia Caldera = Potencia Radiadores ÷ 0.80
  const recommendedBoilerPower = Math.round(totalRadiatorPower / 0.80);
  
  return {
    totalRadiatorPower,
    recommendedBoilerPower,
    workingPercentage: 80
  };
}

/**
 * Convierte Kcal/h a kW (para mostrar en ambas unidades)
 */
export function kcalToKw(kcal: number): number {
  return Math.round((kcal / 860) * 10) / 10; // 1 kW = 860 Kcal/h
}

/**
 * Convierte kW a Kcal/h
 */
export function kwToKcal(kw: number): number {
  return Math.round(kw * 860);
}
