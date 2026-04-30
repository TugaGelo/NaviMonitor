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

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within a SettingsProvider");
    return context;
};
