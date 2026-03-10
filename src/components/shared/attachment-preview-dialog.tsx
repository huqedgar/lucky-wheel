"use client";

import * as React from "react";
import { IconDownload, IconFile, IconLoader2, IconPaperclip } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageViewer } from "@/components/shared/image-viewer";
import { PdfViewer } from "@/components/shared/pdf-viewer";
import { cn } from "@/lib/utils";
import { createClient } from "@/supabase/clients/browser";
import type { Attachment } from "@/validations/attachment.schema";

// ─── Helpers ───────────────────────────────────────────────────────────────

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function isImageFile(attachment: Attachment): boolean {
  if (attachment.mime_type) return IMAGE_MIME_TYPES.includes(attachment.mime_type);
  const path = attachment.storage_path.toLowerCase();
  return (
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".png") ||
    path.endsWith(".gif") ||
    path.endsWith(".webp")
  );
}

export function isPdfFile(attachment: Attachment): boolean {
  if (attachment.mime_type) return attachment.mime_type === "application/pdf";
  return attachment.storage_path.toLowerCase().endsWith(".pdf");
}

export function formatAttachmentSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface AttachmentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: Attachment[];
}

export function AttachmentPreviewDialog({
  open,
  onOpenChange,
  attachments,
}: AttachmentPreviewDialogProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [signedUrl, setSignedUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const current = attachments[selectedIndex];

  // Fetch signed URL when attachment changes
  React.useEffect(() => {
    if (!open || !current) {
      setSignedUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSignedUrl(null);

    const supabase = createClient();
    supabase.storage
      .from(current.storage_bucket)
      .createSignedUrl(current.storage_path, 3600)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // Fallback to public URL
          const { data: pub } = supabase.storage
            .from(current.storage_bucket)
            .getPublicUrl(current.storage_path);
          setSignedUrl(pub.publicUrl);
        } else {
          setSignedUrl(data.signedUrl);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, current]);

  // Reset index & image state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      setImageLoaded(false);
    }
  }, [open]);

  // Reset image loaded state when switching attachments
  React.useEffect(() => {
    setImageLoaded(false);
  }, [selectedIndex]);

  if (!current) return null;

  const isPdf = isPdfFile(current);
  const isImage = isImageFile(current);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden",
          isPdf ? "sm:max-w-5xl" : "sm:max-w-2xl",
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <IconPaperclip className="size-4" />
            Tệp Đính Kèm
            {attachments.length > 1 && (
              <Badge variant="secondary" className="ml-1">
                {selectedIndex + 1}/{attachments.length}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {current.file_name}
            {current.file_size ? ` (${formatAttachmentSize(current.file_size)})` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {isImage ? (
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {(loading || !imageLoaded) && (
                <Skeleton className="mx-auto aspect-[4/3] w-full max-w-sm rounded-lg" />
              )}
              {signedUrl && (
                <ImageViewer>
                  <img
                    src={signedUrl}
                    alt={current.file_name}
                    className={cn(
                      "mx-auto max-h-[55vh] rounded-lg border border-border/50 object-contain shadow-sm",
                      (loading || !imageLoaded) && "h-0 overflow-hidden opacity-0",
                    )}
                    onLoad={() => setImageLoaded(true)}
                  />
                </ImageViewer>
              )}
            </div>
          ) : loading ? (
            isPdf ? (
              <div className="flex flex-col gap-3 p-1">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="min-h-64 flex-1 rounded-lg" />
              </div>
            ) : (
              <div className="flex items-center justify-center p-4">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            )
          ) : signedUrl ? (
            isPdf ? (
              <PdfViewer fileUrl={signedUrl} className="min-h-0 flex-1" />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
                <IconFile className="size-12" />
                <p className="text-sm">{current.file_name}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(signedUrl, "_blank")}
                >
                  <IconDownload className="size-4" />
                  Tải xuống
                </Button>
              </div>
            )
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Không thể tải tệp
            </div>
          )}
        </div>

        {/* Multi-attachment navigation */}
        {attachments.length > 1 && (
          <div className="flex items-center justify-center gap-2 border-t pt-3">
            {attachments.map((att, idx) => (
              <Button
                key={att.id}
                variant={idx === selectedIndex ? "default" : "outline"}
                size="sm"
                className="max-w-40 truncate"
                onClick={() => setSelectedIndex(idx)}
              >
                {att.file_name}
              </Button>
            ))}
          </div>
        )}

        <DialogFooter className="shrink-0">
          {signedUrl && (
            <Button variant="outline" onClick={() => window.open(signedUrl, "_blank")}>
              <IconDownload className="size-4" />
              Tải xuống
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
