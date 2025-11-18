import { create } from 'zustand';
import { useElementsStore } from './useElementsStore';
import { PipeType } from '../models/PipeSegment';

type Tool = 'select' | 'radiator' | 'boiler' | 'pipe';

interface ToolsStore {
  tool: Tool;
  pipeType: PipeType; // IDA o RETORNO
  setTool: (tool: Tool) => void;
  setPipeType: (pipeType: PipeType) => void;
}

export const useToolsStore = create<ToolsStore>((set) => ({
  tool: 'select',
  pipeType: 'supply', // Por defecto IDA (rojo)
  
  setTool: (tool) => {
    // Cancelar tubería temporal si existe al cambiar de herramienta
    const elementsStore = useElementsStore.getState();
    if (elementsStore.tempPipe) {
      console.log('🧹 Limpiando tempPipe al cambiar herramienta');
      elementsStore.cancelPipe(elementsStore.tempPipe.id);
    }
    
    set({ tool });
    console.log('Herramienta cambiada a:', tool);
  },
  
  setPipeType: (pipeType) => {
    set({ pipeType });
    console.log('Tipo de tubería cambiado a:', pipeType === 'supply' ? 'IDA (rojo)' : 'RETORNO (azul)');
  },
}));
