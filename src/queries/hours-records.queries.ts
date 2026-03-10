import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "@/lib/query-helpers";
import { createClient } from "@/supabase/clients/browser";
import type { HoursRecord } from "@/validations/hours-record.schema";

export const hoursRecordKeys = createQueryKeys("hoursRecords");

interface HoursRecordsListParams {
  page?: number;
  pageSize?: number;
  source?: string;
  employee_id?: string;
  record_year?: number;
}

export function useHoursRecords(params: HoursRecordsListParams = {}) {
  const { page = 0, pageSize = 10, source, employee_id, record_year } = params;

  return useQuery({
    queryKey: hoursRecordKeys.list({ page, pageSize, source, employee_id, record_year }),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("hours_records")
        .select(
          "*, employee:employees!employee_id(full_name, employee_code), course:courses!course_id(name, code), training_category:training_categories!category_id(name), creator:employees!created_by(full_name), evidence:completion_evidences!evidence_id(employee_course:employee_courses!employee_course_id(course:courses!course_id(name, code), registration:course_registrations!registration_id(external_course_name))), ce_entry:continuing_education_entries!hours_record_id(training_content)",
          { count: "exact" },
        )
        .is("deleted_at", null)
        .order("record_date", { ascending: false });

      if (source) query = query.eq("source", source);
      if (employee_id) query = query.eq("employee_id", employee_id);
      if (record_year) query = query.eq("record_year", record_year);

      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        data: data as (HoursRecord & {
          employee: { full_name: string; employee_code: string } | null;
          course: { name: string; code: string } | null;
          training_category: { name: string } | null;
          creator: { full_name: string } | null;
          evidence: {
            employee_course: {
              course: { name: string; code: string } | null;
              registration: { external_course_name: string | null } | null;
            } | null;
          } | null;
          ce_entry: { training_content: string }[] | null;
        })[],
        count: count ?? 0,
      };
    },
  });
}

export function useHoursRecord(id: string | undefined) {
  return useQuery({
    queryKey: hoursRecordKeys.detail(id!),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("hours_records")
        .select("*")
        .eq("id", id!)
        .is("deleted_at", null)
        .single();
      if (error) throw error;
      return data as HoursRecord;
    },
    enabled: !!id,
  });
}

export function useHoursRecordsByEmployee(employeeId: string | undefined) {
  return useQuery({
    queryKey: [...hoursRecordKeys.all, "by-employee", employeeId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("hours_records")
        .select("*")
        .eq("employee_id", employeeId!)
        .is("deleted_at", null)
        .order("record_date", { ascending: false });
      if (error) throw error;
      return data as HoursRecord[];
    },
    enabled: !!employeeId,
  });
}

// --- Mutations ---

type HoursRecordInput = Omit<HoursRecord, "id" | "created_at" | "updated_at" | "deleted_at">;

export function useCreateHoursRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: HoursRecordInput) => {
      const supabase = createClient();
      const { data, error } = await supabase.from("hours_records").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hoursRecordKeys.all });
    },
  });
}

export function useUpdateHoursRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<HoursRecordInput> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("hours_records")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hoursRecordKeys.all });
    },
  });
}

export function useDeleteHoursRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("hours_records")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hoursRecordKeys.all });
    },
  });
}

export function useBulkDeleteHoursRecords() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("hours_records")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hoursRecordKeys.all });
    },
  });
}

export function useBulkUpdateHoursRecordSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      source,
      created_by,
    }: {
      ids: string[];
      source: string;
      created_by?: string;
    }) => {
      const supabase = createClient();
      const updatePayload: Record<string, unknown> = { source };
      if (source === "manual" && created_by) {
        updatePayload.created_by = created_by;
      }
      const { error } = await supabase.from("hours_records").update(updatePayload).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hoursRecordKeys.all });
    },
  });
}
