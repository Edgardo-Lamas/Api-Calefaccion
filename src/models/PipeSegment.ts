export interface Point {
  x: number;
  y: number;
}

export interface PipeSegment {
  id: string;
  points: Point[];
  diameter: number;
  material: string;
}
