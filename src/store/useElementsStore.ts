import { create } from 'zustand';
import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment, Point } from '../models/PipeSegment';
import { ElementBase } from '../models/ElementBase';

interface ElementsStore {
  radiators: Radiator[];
  boilers: Boiler[];
  pipes: PipeSegment[];
  tempPipe: PipeSegment | null;
  selectedElementId: string | null;
  addRadiator: (radiator: Radiator) => void;
  addBoiler: (boiler: Boiler) => void;
  setSelectedElement: (id: string | null) => void;
  updateRadiatorPosition: (id: string, x: number, y: number) => void;
  updateBoilerPosition: (id: string, x: number, y: number) => void;
  startPipe: (startPoint: Point, fromElementId?: string) => string;
  addPipePoint: (tempPipeId: string, point: Point) => void;
  finishPipe: (tempPipeId: string, endPoint: Point, toElementId?: string) => void;
  cancelPipe: (tempPipeId: string) => void;
  addElement: (element: Radiator | Boiler | PipeSegment) => void;
  updateElement: (id: string, updates: Partial<ElementBase>) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  clearAll: () => void;
}

export const useElementsStore = create<ElementsStore>((set) => ({
  radiators: [],
  boilers: [],
  pipes: [],
  tempPipe: null,
  selectedElementId: null,
  
  addRadiator: (radiator) => {
    set((state) => ({
      radiators: [...state.radiators, radiator],
    }));
  },

  addBoiler: (boiler) => {
    set((state) => ({
      boilers: [...state.boilers, boiler],
    }));
  },

  setSelectedElement: (id) => {
    set({ selectedElementId: id });
  },

  updateRadiatorPosition: (id, x, y) => {
    set((state) => ({
      radiators: state.radiators.map((radiator) =>
        radiator.id === id ? { ...radiator, x, y } : radiator
      ),
    }));
  },

  updateBoilerPosition: (id, x, y) => {
    set((state) => ({
      boilers: state.boilers.map((boiler) =>
        boiler.id === id ? { ...boiler, x, y } : boiler
      ),
    }));
  },

  startPipe: (startPoint, fromElementId) => {
    const newPipeId = crypto.randomUUID();
    const newPipe: PipeSegment = {
      id: newPipeId,
      points: [startPoint],
      diameter: 16,
      material: 'copper',
      fromElementId: fromElementId || null,
      toElementId: null,
    };
    set({ tempPipe: newPipe });
    return newPipeId;
  },

  addPipePoint: (tempPipeId, point) => {
    set((state) => {
      if (!state.tempPipe || state.tempPipe.id !== tempPipeId) return state;
      
      // Evitar puntos duplicados consecutivos
      const lastPoint = state.tempPipe.points[state.tempPipe.points.length - 1];
      if (lastPoint.x === point.x && lastPoint.y === point.y) return state;

      return {
        tempPipe: {
          ...state.tempPipe,
          points: [...state.tempPipe.points, point],
        },
      };
    });
  },

  finishPipe: (tempPipeId, endPoint, toElementId) => {
    set((state) => {
      if (!state.tempPipe || state.tempPipe.id !== tempPipeId) return state;
      
      // Agregar punto final si no es duplicado
      let finalPoints = [...state.tempPipe.points];
      const lastPoint = finalPoints[finalPoints.length - 1];
      if (lastPoint.x !== endPoint.x || lastPoint.y !== endPoint.y) {
        finalPoints.push(endPoint);
      }

      // Validar mínimo 2 puntos
      if (finalPoints.length < 2) {
        console.log('❌ Tubería rechazada: menos de 2 puntos');
        return { tempPipe: null };
      }

      // Calcular longitud
      let length = 0;
      for (let i = 0; i < finalPoints.length - 1; i++) {
        const dx = finalPoints[i + 1].x - finalPoints[i].x;
        const dy = finalPoints[i + 1].y - finalPoints[i].y;
        length += Math.sqrt(dx * dx + dy * dy);
      }

      const finishedPipe: PipeSegment = {
        ...state.tempPipe,
        points: finalPoints,
        toElementId: toElementId || null,
        length,
      };

      console.log('✅ Tubería finalizada:', {
        id: finishedPipe.id,
        fromElementId: finishedPipe.fromElementId,
        toElementId: finishedPipe.toElementId,
        points: finishedPipe.points.length,
        length: Math.round(finishedPipe.length || 0)
      });

      return {
        pipes: [...state.pipes, finishedPipe],
        tempPipe: null,
      };
    });
  },

  cancelPipe: (tempPipeId) => {
    set((state) => {
      if (!state.tempPipe || state.tempPipe.id !== tempPipeId) return state;
      return { tempPipe: null };
    });
  },
  
  addElement: (element) => {
    // TODO: Implement
  },
  
  updateElement: (id, updates) => {
    // TODO: Implement
  },
  
  removeElement: (id) => {
    set((state) => ({
      radiators: state.radiators.filter((radiator) => radiator.id !== id),
      boilers: state.boilers.filter((boiler) => boiler.id !== id),
      pipes: state.pipes.filter((pipe) => pipe.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    }));
  },
  
  moveElement: (id, x, y) => {
    // TODO: Implement
  },

  clearAll: () => {
    set({
      radiators: [],
      boilers: [],
      pipes: [],
      tempPipe: null,
      selectedElementId: null,
    });
  },
}));
