export interface DemographicData {
  child: number;
  teen: number;
  adult: number;
  senior: number;
}

export interface GenderData {
  male: number;
  female: number;
}

export interface AnalyticRecord {
  id: string;
  timestamp: string; // ISO string
  totalPeople: number;
  ageDistribution: DemographicData;
  genderDistribution: GenderData;
  rawAnalysis?: string;
}

export interface ChartDataPoint {
  time: string;
  count: number;
}
