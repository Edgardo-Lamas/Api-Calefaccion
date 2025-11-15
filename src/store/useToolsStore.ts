import { create } from 'zustand';

type Tool = 'select' | 'radiator' | 'boiler' | 'pipe';

interface ToolsStore {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

export const useToolsStore = create<ToolsStore>((set) => ({
  tool: 'select',
  
  setTool: (tool) => {
    set({ tool });
  },
}));
