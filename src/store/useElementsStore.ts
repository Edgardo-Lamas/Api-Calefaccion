import { create } from 'zustand';
import { Radiator } from '../models/Radiator';
import { Boiler } from '../models/Boiler';
import { PipeSegment } from '../models/PipeSegment';
import { ElementBase } from '../models/ElementBase';

interface ElementsStore {
  radiators: Radiator[];
  boilers: Boiler[];
  pipes: PipeSegment[];
  selectedElementId: string | null;
  addRadiator: (radiator: Radiator) => void;
  setSelectedElement: (id: string | null) => void;
  updateRadiatorPosition: (id: string, x: number, y: number) => void;
  addElement: (element: Radiator | Boiler | PipeSegment) => void;
  updateElement: (id: string, updates: Partial<ElementBase>) => void;
  removeElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
}

export const useElementsStore = create<ElementsStore>((set) => ({
  radiators: [],
  boilers: [],
  pipes: [],
  selectedElementId: null,
  
  addRadiator: (radiator) => {
    set((state) => ({
      radiators: [...state.radiators, radiator],
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
}));
