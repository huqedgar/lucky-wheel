"use client";

import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/supabase/clients/browser";

interface UseRealtimeInvalidationOptions {
  table: string;
  schema?: string;
  queryKey: readonly unknown[];
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  onPayload?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export function useRealtimeInvalidation({
  table,
  schema = "public",
  queryKey,
  event = "*",
  onPayload,
}: UseRealtimeInvalidationOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:${schema}:${table}`)
      .on(
        "postgres_changes" as never,
        { event, schema, table },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          queryClient.invalidateQueries({ queryKey });
          onPayload?.(payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, queryKey, event, queryClient, onPayload]);
}
