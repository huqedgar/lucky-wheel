"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerInput } from "@/components/shared/date-picker-input";
import { LoadingButton } from "@/components/shared/loading-button";
import { CHANGE_TYPE_OPTIONS } from "@/lib/constants/transfer-history.constants";
import { useDepartmentOptions } from "@/queries/departments.queries";
import { usePositionOptions } from "@/queries/positions.queries";
import {
  transferHistoryFormOpts,
  transferHistorySchema,
  type TransferHistoryFormValues,
} from "@/validations/transfer-history.schema";

interface TransferHistoryFormProps {
  employeeId: string;
  defaultValues?: TransferHistoryFormValues;
  onSubmit: (values: TransferHistoryFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function TransferHistoryForm({
  employeeId,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TransferHistoryFormProps) {
  const { data: departmentOptions = [] } = useDepartmentOptions();
  const { data: positionOptions = [] } = usePositionOptions();

  const form = useForm({
    ...transferHistoryFormOpts,
    defaultValues: defaultValues ?? {
      ...transferHistoryFormOpts.defaultValues,
      employee_id: employeeId,
    },
    validators: {
      onSubmit: transferHistorySchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ ...value, employee_id: employeeId });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field name="change_type">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Loại thay đổi</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(v) =>
                  field.handleChange(
                    (v as "department" | "position" | "both" | "other") ?? "department",
                  )
                }
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue>
                    {CHANGE_TYPE_OPTIONS.find((o) => o.value === field.state.value)?.label ??
                      field.state.value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CHANGE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="effective_date">
        {(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Ngày hiệu lực</FieldLabel>
              <DatePickerInput
                id={field.name}
                value={field.state.value || undefined}
                onChange={(_, dateString) => field.handleChange(dateString || "")}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>

      <form.Field name="from_department_id">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Từ Khoa/Phòng</FieldLabel>
            <Select
              value={field.state.value ?? ""}
              onValueChange={(v) => field.handleChange(v || null)}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue>
                  {field.state.value
                    ? (departmentOptions.find((d) => d.id === field.state.value)?.name ??
                      "Đang tải...")
                    : "Chọn khoa/phòng"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </form.Field>

      <form.Field name="to_department_id">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Đến Khoa/Phòng</FieldLabel>
            <Select
              value={field.state.value ?? ""}
              onValueChange={(v) => field.handleChange(v || null)}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue>
                  {field.state.value
                    ? (departmentOptions.find((d) => d.id === field.state.value)?.name ??
                      "Đang tải...")
                    : "Chọn khoa/phòng"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </form.Field>

      <form.Field name="from_position_id">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Từ Chức vụ</FieldLabel>
            <Select
              value={field.state.value ?? ""}
              onValueChange={(v) => field.handleChange(v || null)}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue>
                  {field.state.value
                    ? (positionOptions.find((p) => p.id === field.state.value)?.name ??
                      "Đang tải...")
                    : "Chọn chức vụ"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.code} - {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </form.Field>

      <form.Field name="to_position_id">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Đến Chức vụ</FieldLabel>
            <Select
              value={field.state.value ?? ""}
              onValueChange={(v) => field.handleChange(v || null)}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue>
                  {field.state.value
                    ? (positionOptions.find((p) => p.id === field.state.value)?.name ??
                      "Đang tải...")
                    : "Chọn chức vụ"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.code} - {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </form.Field>

      <form.Field name="decision_number">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Số quyết định</FieldLabel>
            <Input
              id={field.name}
              placeholder="VD: QĐ-2024-001"
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value || null)}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="reason">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Lý do</FieldLabel>
            <Input
              id={field.name}
              placeholder="Nhập lý do điều chuyển..."
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value || null)}
            />
          </Field>
        )}
      </form.Field>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <LoadingButton type="submit" loading={isSubmitting}>
          Lưu
        </LoadingButton>
      </div>
    </form>
  );
}
