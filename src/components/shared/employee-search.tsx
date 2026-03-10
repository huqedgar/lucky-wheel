"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { useEmployeeOptions, type EmployeeOption } from "@/queries/employees.queries";

interface EmployeeSearchProps {
  value: string;
  onChange: (employeeId: string) => void;
  /** Lock to read-only display (e.g. when editing). */
  disabled?: boolean;
  placeholder?: string;
}

/** Build searchable string: code + name + department. */
function toSearchString(emp: EmployeeOption): string {
  const parts = [emp.employee_code, emp.full_name];
  if (emp.department_name) parts.push(emp.department_name);
  return parts.join(" ");
}

/**
 * Shared employee search combobox with type-ahead filtering.
 * Searches by mã NV, họ tên, and khoa/phòng.
 * Designed for large lists (5000+ employees).
 */
export function EmployeeSearch({
  value,
  onChange,
  disabled = false,
  placeholder = "Tìm theo mã, tên, khoa phòng...",
}: EmployeeSearchProps) {
  const { data: employees = [] } = useEmployeeOptions();

  const empMap = React.useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);

  if (disabled) {
    const emp = empMap.get(value);
    return <Input value={emp ? `${emp.employee_code} - ${emp.full_name}` : value} disabled />;
  }

  return (
    <Combobox
      value={value || null}
      onValueChange={(val) => onChange((val as string) ?? "")}
      itemToStringValue={(id) => {
        const emp = empMap.get(id as string);
        return emp ? toSearchString(emp) : (id as string);
      }}
    >
      <ComboboxInput placeholder={placeholder} showClear className="w-full" />
      <ComboboxContent>
        <ComboboxList>
          {employees.map((emp) => (
            <ComboboxItem key={emp.id} value={emp.id}>
              <div className="flex w-full items-center gap-2">
                <span className="shrink-0 text-muted-foreground">{emp.employee_code}</span>
                <span className="truncate font-medium">{emp.full_name}</span>
                {emp.department_name && (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {emp.department_name}
                  </span>
                )}
              </div>
            </ComboboxItem>
          ))}
        </ComboboxList>
        <ComboboxEmpty>Không tìm thấy nhân viên</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
