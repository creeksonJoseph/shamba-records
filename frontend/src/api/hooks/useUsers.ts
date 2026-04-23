import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AuthUser, type Role } from "@/lib/api";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api<AuthUser[]>("/users/"),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/users/${id}/`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) =>
      api<AuthUser>("/users/", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
