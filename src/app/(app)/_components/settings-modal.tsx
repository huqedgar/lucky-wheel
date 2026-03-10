"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SETTINGS_CODE = process.env.NEXT_PUBLIC_SETTINGS_CODE ?? "1234";
const STORAGE_KEY = "predetermined-winners";

export function getPredeterminedNames(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return parsed.filter((n) => n.trim().length > 0);
  } catch {
    return [];
  }
}

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  remainingPredeterminedCount: number;
  totalPredeterminedCount: number;
}

const SettingsModal = ({
  isOpen,
  onOpenChange,
  onSaved,
  remainingPredeterminedCount,
  totalPredeterminedCount,
}: SettingsModalProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [draft, setDraft] = useState("");

  const handleOpen = (open: boolean) => {
    if (open) {
      const saved = getPredeterminedNames();
      setDraft(saved.join("\n"));
    } else {
      setAuthenticated(false);
      setCode("");
      setDraft("");
    }
    onOpenChange(open);
  };

  const handleSubmitCode = () => {
    if (code === SETTINGS_CODE) {
      setAuthenticated(true);
      setCode("");
      const saved = getPredeterminedNames();
      setDraft(saved.join("\n"));
    } else {
      toast.warning("Mã không đúng!");
    }
  };

  const handleSave = () => {
    const names = draft
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    onSaved();
    toast.success(`Đã lưu ${names.length} người`);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDraft("");
    onSaved();
    toast.success("Đã xóa danh sách");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent className="font-bangers tracking-widest sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-wide">
            {authenticated ? "Cấu hình người chiến thắng" : "Xác thực Settings"}
          </DialogTitle>
        </DialogHeader>

        {!authenticated ? (
          <div className="flex flex-col gap-4 py-4">
            <Input
              type="password"
              placeholder="Nhập mã settings"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitCode()}
            />
            <Button onClick={handleSubmitCode}>Xác nhận</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Nhập tên người chiến thắng (mỗi người một dòng)"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="h-40"
            />

            <div className="text-sm text-muted-foreground">
              Đã cấu hình: {totalPredeterminedCount} người | Còn lại:{" "}
              {remainingPredeterminedCount} người
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSave}>
                Lưu danh sách
              </Button>
              {draft.trim() && (
                <Button variant="destructive" onClick={handleClear}>
                  Xóa
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
