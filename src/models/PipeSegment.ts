export interface Point {
  x: number;
  y: number;
}

export interface PipeSegment {
  id: string;
  points: Point[];
  diameter: number;
  material?: string;
  fromElementId?: string | null;
  toElementId?: string | null;
  length?: number;
}
