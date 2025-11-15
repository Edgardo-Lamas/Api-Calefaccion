import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment } from '../models/PipeSegment';

/**
 * Calcula la potencia total de todos los radiadores
 */
export const calculateTotalPower = (radiators: Radiator[]): number => {
  // TODO: Implement
  return 0;
};

/**
 * Calcula la longitud de un segmento de tubería
 */
export const calculatePipeLength = (pipe: PipeSegment): number => {
  // TODO: Implement
  return 0;
};

/**
 * Calcula la pérdida de carga en una tubería
 */
export const calculatePressureLoss = (
  pipe: PipeSegment,
  flowRate: number
): number => {
  // TODO: Implement
  return 0;
};

/**
 * Verifica si la potencia de la caldera es suficiente
 */
export const isBoilerPowerSufficient = (
  boiler: Boiler,
  radiators: Radiator[]
): boolean => {
  // TODO: Implement
  return false;
};
