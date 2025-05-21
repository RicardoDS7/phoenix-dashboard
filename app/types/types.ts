// types.ts (optional file for type definitions)
import type { Timestamp } from 'firebase/firestore';

export interface InsuranceAndMaintenance {
  yearlyInsuranceCosts: number;
  yearlyMaintenanceCosts: number;
}

export interface LineItem {
  description: string;
  qty: string;
  total: string;
  unit: string;
}

export interface SavingsForecast {
  // Because these keys have spaces, use bracket notation in your code
  // or rename them in Firestore
  "NPV Net PPA Savings": number[];
  "NPV Net RTO Savings": number[];
}

export interface TotalNpvSavings {
  "Total NPV PPA Savings": number;
  "Total NPV RTO Savings": number;
}

export interface SolarPerformance {
  annual_solar_production_kwh: number;
  average_self_consumption_percent: number;
  monthly_battery_usage_kwh: number[];
  monthly_direct_solar_usage_kwh: number[];
  monthly_exported_to_grid_kwh: number[];
  monthly_imported_from_grid_kwh: number[];
  monthly_self_consumption_kwh: number[];
  monthly_solar_production_kwh: number[];
  total_exported_to_grid_kwh: number;
  total_imported_from_grid_kwh: number;
  total_self_consumed_energy_kwh: number;
  savings_forecast: SavingsForecast;
  total_npv_savings: TotalNpvSavings;
}

export interface QuoteData {
  InsuranceAndMaintenance: InsuranceAndMaintenance;
  solarPerformance: SolarPerformance;
  quoteDetails: {
    createdAt: Timestamp;          // Firestore Timestamp
    lineItems: LineItem[];
    overallTotal: number;
    solarCapacity: number;
    batteryCapacity: number;
    panelQTY: number;
    quoteName: string;
    selectedCustomer: string;
  };
  // plus any other fields you see in your data
}
