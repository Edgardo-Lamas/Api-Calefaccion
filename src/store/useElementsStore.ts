import { create } from 'zustand';
import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment, Point, PipeType } from '../models/PipeSegment';
import { ElementBase } from '../models/ElementBase';
import { Project } from '../utils/projectStorage';
import { Room } from '../models/Room';

interface ElementsStore {
  radiators: Radiator[];
  boilers: Boiler[];
  pipes: PipeSegment[];
  rooms: Room[];
  tempPipe: PipeSegment | null;
  selectedElementId: string | null;
  projectName: string;
  currentFloor: 'ground' | 'first'; // Planta actual
  backgroundImage: string | null; // DEPRECATED - usar floorPlans
  backgroundImageOffset: { x: number; y: number };
  backgroundImageDimensions: { width: number; height: number } | null;
  floorPlans: {
    ground: { image: string | null; offset: { x: number; y: number }; dimensions: { width: number; height: number } | null };
    first: { image: string | null; offset: { x: number; y: number }; dimensions: { width: number; height: number } | null };
  };
  floorHeight: number; // Altura entre plantas en metros (para calcular tuberías verticales)
  addRadiator: (radiator: Radiator) => void;
  addBoiler: (boiler: Boiler) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  assignRadiatorToRoom: (radiatorId: string, roomId: string) => void;
  unassignRadiatorFromRoom: (radiatorId: string, roomId: string) => void;
  setSelectedElement: (id: string | null) => void;
  updateRadiatorPosition: (id: string, x: number, y: number, width?: number, height?: number) => void;
  rotateRadiator: (id: string) => void;
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
  setBackgroundImageOffset: (offset: { x: number; y: number }) => void;
  setBackgroundImageDimensions: (dimensions: { width: number; height: number } | null) => void;
  setCurrentFloor: (floor: 'ground' | 'first') => void;
  setFloorPlan: (floor: 'ground' | 'first', imageDataUrl: string | null) => void;
  setFloorPlanOffset: (floor: 'ground' | 'first', offset: { x: number; y: number }) => void;
  setFloorPlanDimensions: (floor: 'ground' | 'first', dimensions: { width: number; height: number } | null) => void;
  setFloorHeight: (height: number) => void;
  clearAll: () => void;
  loadProject: (project: Project) => void;
  setProjectName: (name: string) => void;
}

export const useElementsStore = create<ElementsStore>((set) => ({
  radiators: [],
  boilers: [],
  pipes: [],
  rooms: [],
  tempPipe: null,
  selectedElementId: null,
  projectName: 'Proyecto sin nombre',
  currentFloor: 'ground',
  backgroundImage: null,
  backgroundImageOffset: { x: 0, y: 0 },
  backgroundImageDimensions: null,
  floorPlans: {
    ground: { image: null, offset: { x: 0, y: 0 }, dimensions: null },
    first: { image: null, offset: { x: 0, y: 0 }, dimensions: null },
  },
  floorHeight: 2.8, // Altura estándar entre plantas
  
  addRadiator: (radiator) => {
    set((state) => ({
      radiators: [...state.radiators, { ...radiator, floor: state.currentFloor }],
    }));
  },

  addBoiler: (boiler) => {
    set((state) => ({
      boilers: [...state.boilers, { ...boiler, floor: state.currentFloor }],
    }));
  },

  addRoom: (room) => {
    set((state) => ({
      rooms: [...state.rooms, { ...room, floor: state.currentFloor }],
    }));
  },

  updateRoom: (id, updates) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
    }));
  },

  removeRoom: (id) => {
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
    }));
  },

  assignRadiatorToRoom: (radiatorId, roomId) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, radiatorIds: [...room.radiatorIds, radiatorId] }
          : room
      ),
    }));
  },

  unassignRadiatorFromRoom: (radiatorId, roomId) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, radiatorIds: room.radiatorIds.filter(id => id !== radiatorId) }
          : room
      ),
    }));
  },

  setSelectedElement: (id) => {
    set({ selectedElementId: id });
  },

  updateRadiatorPosition: (id, x, y, width, height) => {
    set((state) => ({
      radiators: state.radiators.map((radiator) =>
        radiator.id === id 
          ? { ...radiator, x, y, ...(width !== undefined && { width }), ...(height !== undefined && { height }) }
          : radiator
      ),
    }));
  },

  rotateRadiator: (id) => {
    set((state) => ({
      radiators: state.radiators.map((radiator) =>
        radiator.id === id
          ? { ...radiator, width: radiator.height, height: radiator.width }
          : radiator
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

  setBackgroundImageOffset: (offset) => {
    set({ backgroundImageOffset: offset });
  },

  setBackgroundImageDimensions: (dimensions) => {
    set({ backgroundImageDimensions: dimensions });
  },

  setCurrentFloor: (floor) => {
    set({ currentFloor: floor });
    console.log(`🏢 Cambiado a ${floor === 'ground' ? 'Planta Baja' : 'Planta Alta'}`);
  },

  setFloorPlan: (floor, imageDataUrl) => {
    set((state) => ({
      floorPlans: {
        ...state.floorPlans,
        [floor]: {
          ...state.floorPlans[floor],
          image: imageDataUrl,
        },
      },
    }));
    console.log(`✅ Plano de ${floor === 'ground' ? 'Planta Baja' : 'Planta Alta'} ${imageDataUrl ? 'cargado' : 'eliminado'}`);
  },

  setFloorPlanOffset: (floor, offset) => {
    set((state) => ({
      floorPlans: {
        ...state.floorPlans,
        [floor]: {
          ...state.floorPlans[floor],
          offset,
        },
      },
    }));
  },

  setFloorPlanDimensions: (floor, dimensions) => {
    set((state) => ({
      floorPlans: {
        ...state.floorPlans,
        [floor]: {
          ...state.floorPlans[floor],
          dimensions,
        },
      },
    }));
  },

  setFloorHeight: (height) => {
    set({ floorHeight: height });
    console.log(`📏 Altura entre plantas: ${height}m`);
  },

  clearAll: () => {
    set({
      radiators: [],
      boilers: [],
      pipes: [],
      rooms: [],
      tempPipe: null,
      selectedElementId: null,
      currentFloor: 'ground',
      backgroundImage: null,
      backgroundImageOffset: { x: 0, y: 0 },
      backgroundImageDimensions: null,
      floorPlans: {
        ground: { image: null, offset: { x: 0, y: 0 }, dimensions: null },
        first: { image: null, offset: { x: 0, y: 0 }, dimensions: null },
      },
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
