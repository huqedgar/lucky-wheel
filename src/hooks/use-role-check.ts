"use client";

import { useCurrentEmployee } from "./use-current-employee";
import { useManagedDepartments } from "./use-managed-departments";

export function useRoleCheck() {
  const { data: employee } = useCurrentEmployee();
  const role = employee?.system_role ?? "STAFF";
  const { data: managedDepartmentIds } = useManagedDepartments();

  return {
    role,
    isAdmin: role === "ADMIN" || role === "SUPERADMIN",
    isSuperAdmin: role === "SUPERADMIN",
    isManager: role === "MANAGER",
    isAdminOrAbove: role === "ADMIN" || role === "SUPERADMIN",
    isManagerOrAbove: role === "MANAGER" || role === "ADMIN" || role === "SUPERADMIN",
    employeeId: employee?.id ?? null,
    departmentId: employee?.department_id ?? null,
    managedDepartmentIds: managedDepartmentIds ?? null,
  };
}
