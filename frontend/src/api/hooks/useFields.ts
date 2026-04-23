import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Field } from "@/lib/types";

export function useFields() {
  return useQuery({
    queryKey: ["fields"],
    queryFn: () => api<Field[]>("/fields/"),
  });
}

export function useField(id: string) {
  return useQuery({
    queryKey: ["field", id],
    queryFn: () => api<Field>(`/fields/${id}/`),
    enabled: !!id,
  });
}

interface CreateFieldData {
  name: string;
  location: string;
  assigned_agent?: string;
}

export function useCreateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFieldData) =>
      api<Field>("/fields/", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/fields/${id}/`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
