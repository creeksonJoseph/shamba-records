import type { AuthUser } from "./api";

export type Stage = "planted" | "growing" | "ready" | "harvested";
export type Status = "active" | "at_risk" | "completed";

export interface Field {
  id: string;
  name: string;
  location: string;
  assigned_agent: AuthUser | null;
  created_by: AuthUser | null;
  created_at?: string;
}

export interface PlantUpdate {
  id: string;
  observation: string;
  new_stage?: Stage | null;
  created_at: string;
  created_by?: AuthUser | null;
}

export interface Plant {
  id: string;
  field: Field | { id: string; name: string };
  crop_type: string;
  planting_date: string;
  expected_days: number;
  notes?: string | null;
  stage: Stage;
  status: Status;
  updates?: PlantUpdate[];
  created_at?: string;
}

export interface DashboardData {
  total_fields: number;
  total_plants: number;
  by_status: Record<Status, number>;
  by_stage: Record<Stage, number>;
  at_risk_plants: Plant[];
  recent_updates: (PlantUpdate & { plant?: { id: string; crop_type: string } })[];
}
