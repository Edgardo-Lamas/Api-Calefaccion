import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Promotion {
  id: string;
  name: string;
  discount: number; // porcentaje de descuento
  enabled: boolean;
}

export interface CompanyInfo {
  logo: string | null; // base64 o URL
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  promotions: Promotion[];
}

interface CompanyStore {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  addPromotion: (promotion: Promotion) => void;
  updatePromotion: (id: string, updates: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  getActivePromotions: () => Promotion[];
}

const defaultCompanyInfo: CompanyInfo = {
  logo: null,
  companyName: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  promotions: [],
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      companyInfo: defaultCompanyInfo,
      
      updateCompanyInfo: (info) =>
        set((state) => ({
          companyInfo: { ...state.companyInfo, ...info },
        })),
      
      addPromotion: (promotion) =>
        set((state) => ({
          companyInfo: {
            ...state.companyInfo,
            promotions: [...state.companyInfo.promotions, promotion],
          },
        })),
      
      updatePromotion: (id, updates) =>
        set((state) => ({
          companyInfo: {
            ...state.companyInfo,
            promotions: state.companyInfo.promotions.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          },
        })),
      
      deletePromotion: (id) =>
        set((state) => ({
          companyInfo: {
            ...state.companyInfo,
            promotions: state.companyInfo.promotions.filter((p) => p.id !== id),
          },
        })),
      
      getActivePromotions: () =>
        get().companyInfo.promotions.filter((p) => p.enabled),
    }),
    {
      name: 'company-storage',
    }
  )
);
