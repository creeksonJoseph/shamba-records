import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Plant, Stage, PlantUpdate } from "@/lib/types";

export function usePlants() {
  return useQuery({
    queryKey: ["plants"],
    queryFn: () => api<Plant[]>("/plants/"),
  });
}

export function usePlant(id: string) {
  return useQuery({
    queryKey: ["plant", id],
    queryFn: () => api<Plant>(`/plants/${id}/`),
    enabled: !!id,
  });
}

interface CreatePlantData {
  field: string;
  crop_type: string;
  planting_date: string;
  expected_days: number;
}

export function useCreatePlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlantData) =>
      api<Plant>("/plants/", {
        method: "POST",
        body: data,
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["plants"] });
      qc.invalidateQueries({ queryKey: ["field", variables.field] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

interface UpdateStageData {
  id: string;
  new_stage: Stage;
  observation?: string;
}

export function useUpdateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, new_stage, observation }: UpdateStageData) =>
      api<Plant>(`/plants/${id}/stage/`, {
        method: "PATCH",
        body: { new_stage, observation },
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["plant", variables.id] });
      qc.invalidateQueries({ queryKey: ["plants"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

interface FlagPlantData {
  id: string;
  override: "at_risk" | "healthy" | null;
  reason?: string;
}

export function useFlagPlant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, override, reason }: FlagPlantData) =>
      api<Plant>(`/plants/${id}/flag/`, {
        method: "PATCH",
        body: { override, reason },
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["plant", variables.id] });
      qc.invalidateQueries({ queryKey: ["plants"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

interface AddObservationData {
  id: string;
  observation: string;
}

export function useAddObservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observation }: AddObservationData) =>
      api<PlantUpdate>(`/plants/${id}/updates/`, {
        method: "POST",
        body: { observation },
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["plant", variables.id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
