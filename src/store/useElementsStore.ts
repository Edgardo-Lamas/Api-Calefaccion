import { create } from 'zustand';
import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment, Point, PipeType } from '../models/PipeSegment';
import { ElementBase } from '../models/ElementBase';
import { Project } from '../utils/projectStorage';

interface ElementsStore {
  radiators: Radiator[];
  boilers: Boiler[];
  pipes: PipeSegment[];
  tempPipe: PipeSegment | null;
  selectedElementId: string | null;
  projectName: string;
  backgroundImage: string | null;
  addRadiator: (radiator: Radiator) => void;
  addBoiler: (boiler: Boiler) => void;
  setSelectedElement: (id: string | null) => void;
  updateRadiatorPosition: (id: string, x: number, y: number) => void;
  updateBoilerPosition: (id: string, x: number, y: number) => void;
  startPipe: (startPoint: Point, pipeType: PipeType, fromElementId?: string) => string;
  addPipePoint: (tempPipeId: string, point: Point) => void;
  finishPipe: (tempPipeId: string, endPoint: Point, toElementId?: string) => void;
  cancelPipe: (tempPipeId: string) => void;
  addElement: (element: Radiator | Boiler | PipeSegment) => void;
  updateElement: (id: string, updates: Partial<ElementBase>) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  setPipes: (pipes: PipeSegment[]) => void;
  setBackgroundImage: (imageDataUrl: string | null) => void;
  clearAll: () => void;
  loadProject: (project: Project) => void;
  setProjectName: (name: string) => void;
}

export const useElementsStore = create<ElementsStore>((set) => ({
  radiators: [],
  boilers: [],
  pipes: [],
  tempPipe: null,
  selectedElementId: null,
  projectName: 'Proyecto sin nombre',
  backgroundImage: null,
  
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

  startPipe: (startPoint, pipeType, fromElementId) => {
    const newPipeId = crypto.randomUUID();
    const newPipe: PipeSegment = {
      id: newPipeId,
      type: 'pipe',
      pipeType: pipeType, // IDA o RETORNO
      points: [startPoint],
      diameter: 16,
      material: 'PEX',
      fromElementId: fromElementId || null,
      toElementId: null,
      zone: null, // TODO: Implementar zonas/habitaciones
      zIndex: 0, // Por defecto, se puede cambiar para cruces
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
        alert('Debes trazar al menos dos puntos de tubería.');
        return { tempPipe: null };
      }

      // Calcular longitud en píxeles
      let lengthPixels = 0;
      for (let i = 0; i < finalPoints.length - 1; i++) {
        const dx = finalPoints[i + 1].x - finalPoints[i].x;
        const dy = finalPoints[i + 1].y - finalPoints[i].y;
        lengthPixels += Math.sqrt(dx * dx + dy * dy);
      }

      // Convertir a metros (escala aproximada: 50 píxeles = 1 metro)
      const PIXELS_PER_METER = 50;
      const lengthMeters = lengthPixels / PIXELS_PER_METER;

      const finishedPipe: PipeSegment = {
        ...state.tempPipe,
        points: finalPoints,
        toElementId: toElementId || null,
        length: lengthMeters,
      };

      console.log('✅ Tubería finalizada:', {
        id: finishedPipe.id,
        fromElementId: finishedPipe.fromElementId,
        toElementId: finishedPipe.toElementId,
        points: finishedPipe.points.length,
        lengthMeters: lengthMeters.toFixed(1) + ' m'
      });

      // Trigger evento onPipeCreated para cálculos adicionales
      // TODO: Implementar callback para actualizar cálculos (pérdidas de carga, etc.)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pipeCreated', { 
          detail: finishedPipe 
        }));
      }

      // Mostrar mensaje con la longitud creada
      alert(`Longitud creada: ${lengthMeters.toFixed(1)} m`);

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
    // TODO: Implement generically if needed
    console.log('addElement called:', element);
  },
  
  updateElement: (id, updates) => {
    set((state) => {
      // Verificar si es radiador
      const isRadiator = state.radiators.some(r => r.id === id);
      if (isRadiator) {
        return {
          radiators: state.radiators.map((radiator) =>
            radiator.id === id ? { ...radiator, ...updates } as Radiator : radiator
          ),
        };
      }
      
      // Verificar si es caldera
      const isBoiler = state.boilers.some(b => b.id === id);
      if (isBoiler) {
        return {
          boilers: state.boilers.map((boiler) =>
            boiler.id === id ? { ...boiler, ...updates } as Boiler : boiler
          ),
        };
      }
      
      // Verificar si es tubería
      const isPipe = state.pipes.some(p => p.id === id);
      if (isPipe) {
        return {
          pipes: state.pipes.map((pipe) =>
            pipe.id === id ? { ...pipe, ...updates } as PipeSegment : pipe
          ),
        };
      }
      
      return state;
    });
    
    console.log('Elemento actualizado:', { id, updates });
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

  setPipes: (pipes) => {
    set({ pipes });
    console.log(`✅ ${pipes.length} tuberías actualizadas en el store`);
  },

  setBackgroundImage: (imageDataUrl) => {
    set({ backgroundImage: imageDataUrl });
    console.log(imageDataUrl ? '✅ Imagen de plano cargada' : '🧼 Imagen de plano eliminada');
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

  loadProject: (project: Project) => {
    set({
      radiators: project.radiators,
      boilers: project.boilers,
      pipes: project.pipes,
      projectName: project.projectName,
      tempPipe: null,
      selectedElementId: null,
    });
    console.log('✅ Proyecto cargado en store:', project.projectName);
  },

  setProjectName: (name: string) => {
    set({ projectName: name });
  },
}));
