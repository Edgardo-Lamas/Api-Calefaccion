import { ElementBase } from './ElementBase';

export interface Boiler extends ElementBase {
  type: 'boiler';
  power: number;
  width: number;
  height: number;
  floor?: 'ground' | 'first'; // Planta donde está ubicado
}
