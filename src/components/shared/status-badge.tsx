import { Badge } from "@/components/ui/badge";

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}

interface StatusBadgeProps {
  status: string;
  statusMap: Record<string, StatusConfig>;
}

export function StatusBadge({ status, statusMap }: StatusBadgeProps) {
  const config = statusMap[status];
  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
