"use client";

import { IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDashboardSettings } from "./use-dashboard-settings";

export function DashboardSettings() {
  const {
    sidebarVariant,
    showRail,
    stickyHeader,
    setSidebarVariant,
    setShowRail,
    setStickyHeader,
  } = useDashboardSettings();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="group/toggle extend-touch-target size-8" />
        }
      >
        <IconSettings className="size-4" />
        <span className="sr-only">Cài Đặt Dashboard</span>
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="end">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium">Cài Đặt Thanh Bên</span>
            <p className="text-xs text-muted-foreground">Tuỳ chỉnh giao diện thanh bên.</p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Kiểu Dáng</Label>
              <ToggleGroup
                value={[sidebarVariant]}
                onValueChange={(v) => {
                  if (v.length > 0) setSidebarVariant(v[v.length - 1] as typeof sidebarVariant);
                }}
                variant="outline"
                size="sm"
                className="grid w-full grid-cols-3"
              >
                <ToggleGroupItem value="sidebar">Mặc Định</ToggleGroupItem>
                <ToggleGroupItem value="floating">Nổi</ToggleGroupItem>
                <ToggleGroupItem value="inset">Nhúng</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid gap-1.5">
              <Label>Phần Trên Cố Định</Label>
              <ToggleGroup
                value={[String(stickyHeader)]}
                onValueChange={(v) => {
                  if (v.length > 0) setStickyHeader(v[v.length - 1] === "true");
                }}
                variant="outline"
                size="sm"
                className="grid w-full grid-cols-2"
              >
                <ToggleGroupItem value="true">Có</ToggleGroupItem>
                <ToggleGroupItem value="false">Không</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid gap-1.5">
              <Label>Hiển Thị Thanh Bên</Label>
              <ToggleGroup
                value={[String(showRail)]}
                onValueChange={(v) => {
                  if (v.length > 0) setShowRail(v[v.length - 1] === "true");
                }}
                variant="outline"
                size="sm"
                className="grid w-full grid-cols-2"
              >
                <ToggleGroupItem value="true">Có</ToggleGroupItem>
                <ToggleGroupItem value="false">Không</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
