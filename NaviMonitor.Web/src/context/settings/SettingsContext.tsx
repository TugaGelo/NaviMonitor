/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { useAuth } from '../auth/AuthContext';

interface UserSettings {
  userId: string;
  distanceUnit: 'km' | 'mi';
  volumeUnit: 'L' | 'gal';
  currency: 'PHP' | 'USD';
  fuelTypes: string[];
  serviceTypes: string[];
}

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (newSettings: UserSettings) => Promise<void>;
  refreshSettings: () => Promise<void>;
  formatDist: (km: number) => string;
  formatVol: (liters: number) => string;
  formatEconomy: (km: number, liters: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/settings');
      const data = response.data;
      
      setSettings({
        ...data,
        fuelTypes: JSON.parse(data.fuelTypesJson || '[]'),
        serviceTypes: JSON.parse(data.serviceTypesJson || '[]')
      });
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSettings]);

  const updateSettings = async (newSettings: UserSettings) => {
    try {
      const payload = {
        ...newSettings,
        fuelTypesJson: JSON.stringify(newSettings.fuelTypes),
        serviceTypesJson: JSON.stringify(newSettings.serviceTypes)
      };
      await api.put('/settings', payload);
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to update settings", error);
      throw error;
    }
  };
  
  const formatDist = useCallback((km: number) => {
    const val = settings?.distanceUnit === 'mi' ? km * 0.621371 : km;
    const unit = settings?.distanceUnit === 'mi' ? 'mi' : 'km';
    return `${val.toFixed(0)} ${unit}`;
  }, [settings?.distanceUnit]);

  const formatVol = useCallback((liters: number) => {
    const val = settings?.volumeUnit === 'gal' ? liters * 0.264172 : liters;
    const unit = settings?.volumeUnit === 'gal' ? 'gal' : 'L';
    return `${val.toFixed(2)} ${unit}`;
  }, [settings?.volumeUnit]);

  const formatEconomy = useCallback((km: number, liters: number) => {
    if (km === 0 || liters === 0) return "0.00";
    
    if (settings?.distanceUnit === 'mi') {
      const miles = km * 0.621371;
      const gallons = liters * 0.264172;
      return `${(miles / gallons).toFixed(1)} MPG`;
    }
    
    return `${(liters / (km / 100)).toFixed(1)} L/100km`;
  }, [settings?.distanceUnit]);

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        loading, 
        updateSettings, 
        refreshSettings: fetchSettings,
        formatDist,
        formatVol,
        formatEconomy
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
