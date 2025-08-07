import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Mod } from '../types';

interface ModContextType {
  selectedMod: Mod | null;
  setSelectedMod: (mod: Mod | null) => void;
  isModSelected: boolean;
  enabledSections: string[];
  setEnabledSections: (sections: string[]) => void;
}

const ModContext = createContext<ModContextType | undefined>(undefined);

export const useModContext = () => {
  const context = useContext(ModContext);
  if (context === undefined) {
    throw new Error('useModContext must be used within a ModProvider');
  }
  return context;
};

interface ModProviderProps {
  children: ReactNode;
}

export const ModProvider: React.FC<ModProviderProps> = ({ children }) => {
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [enabledSections, setEnabledSections] = useState<string[]>([]);

  const value = {
    selectedMod,
    setSelectedMod,
    isModSelected: selectedMod !== null,
    enabledSections,
    setEnabledSections,
  };

  return (
    <ModContext.Provider value={value}>
      {children}
    </ModContext.Provider>
  );
};
