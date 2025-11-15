import { ElementBase } from './ElementBase';

export interface Radiator extends ElementBase {
  type: 'radiator';
  power: number;
  width: number;
  height: number;
}
