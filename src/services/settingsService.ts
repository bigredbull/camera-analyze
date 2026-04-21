export interface AppSettings {
  analysisInterval: number; // in seconds
  cameraFacingMode: 'user' | 'environment';
}

const SETTINGS_KEY = "store_analytics_settings";
const DEFAULT_SETTINGS: AppSettings = {
  analysisInterval: 5,
  cameraFacingMode: 'environment'
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
