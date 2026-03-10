"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/supabase/clients/browser";
import { useCurrentEmployee } from "./use-current-employee";

export function useManagedDepartments() {
  const { data: employee } = useCurrentEmployee();
  const role = employee?.system_role;
  const isManager = role === "MANAGER";

  return useQuery({
    queryKey: ["managed-departments", employee?.id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("employee_department_scopes")
        .select("department_id")
        .eq("employee_id", employee!.id);
      if (error) throw error;
      return data.map((d) => d.department_id);
    },
    enabled: !!employee?.id && isManager,
    staleTime: 5 * 60 * 1000,
  });
}
