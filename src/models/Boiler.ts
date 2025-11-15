import { ElementBase } from './ElementBase';

export interface Boiler extends ElementBase {
  type: 'boiler';
  power: number;
}
