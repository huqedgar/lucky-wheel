export const CHANGE_TYPE_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  department: { label: "Chuyển Khoa/Phòng", variant: "default" },
  position: { label: "Chuyển Chức Vụ", variant: "secondary" },
  both: { label: "Chuyển Khoa + Chức Vụ", variant: "default" },
  other: { label: "Khác", variant: "outline" },
};

export const CHANGE_TYPE_OPTIONS = [
  { value: "department", label: "Chuyển Khoa/Phòng" },
  { value: "position", label: "Chuyển Chức Vụ" },
  { value: "both", label: "Chuyển Khoa + Chức Vụ" },
  { value: "other", label: "Khác" },
] as const;
