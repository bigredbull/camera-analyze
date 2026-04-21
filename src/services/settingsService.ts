export type AIProvider = 'gemini' | 'openai';

export interface AppSettings {
  analysisInterval: number;
  cameraFacingMode: 'user' | 'environment';
  aiProvider: AIProvider;
  openaiKey?: string;
  offlineMode: boolean;
}

const SETTINGS_KEY = "store_analytics_settings";
const DEFAULT_SETTINGS: AppSettings = {
  analysisInterval: 10,
  cameraFacingMode: 'environment',
  aiProvider: 'gemini',
  offlineMode: false
};

export const settingsService = {
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },
  
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
