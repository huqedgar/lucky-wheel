"use client";

import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/lib/query-helpers";
import { createClient } from "@/supabase/clients/browser";

export const currentEmployeeKeys = createQueryKeys("currentEmployee");

export interface CurrentEmployee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  department_id: string | null;
  position_id: string | null;
  system_role: "SUPERADMIN" | "ADMIN" | "MANAGER" | "STAFF";
  employment_status: string;
}

export function useCurrentEmployee() {
  return useQuery({
    queryKey: currentEmployeeKeys.all,
    queryFn: async (): Promise<CurrentEmployee | null> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("employees")
        .select(
          "id, employee_code, full_name, email, avatar_url, department_id, position_id, system_role, employment_status",
        )
        .eq("auth_id", user.id)
        .is("deleted_at", null)
        .single();

      if (error) throw error;
      return data as CurrentEmployee;
    },
    staleTime: 5 * 60 * 1000,
  });
}
