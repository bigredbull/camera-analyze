import { AnalyticRecord } from "../types";

const STORAGE_KEY = "store_analytics_data";

export const storageService = {
  saveRecord: (record: AnalyticRecord) => {
    const records = storageService.getRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },
  
  getRecords: (): AnalyticRecord[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  clearRecords: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
