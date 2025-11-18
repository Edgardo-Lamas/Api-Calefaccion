export interface Point {
  x: number;
  y: number;
}

export interface PipeSegment {
  id: string;
  type: 'pipe';
  points: Point[];
  diameter: number;
  material: string;
  fromElementId?: string | null;
  toElementId?: string | null;
  length?: number;
  zone?: string | null; // ID de la habitación/zona asociada
}
