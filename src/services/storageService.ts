import { AnalyticRecord, PendingCapture } from "../types";

const STORAGE_KEY = "store_analytics_data";
const PENDING_KEY = "store_analytics_pending";

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
  },

  savePendingCapture: (capture: PendingCapture) => {
    const pending = storageService.getPendingCaptures();
    pending.push(capture);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  },

  getPendingCaptures: (): PendingCapture[] => {
    const data = localStorage.getItem(PENDING_KEY);
    return data ? JSON.parse(data) : [];
  },

  removePendingCapture: (id: string) => {
    const pending = storageService.getPendingCaptures().filter(c => c.id !== id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  }
};
