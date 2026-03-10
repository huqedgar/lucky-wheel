"use client";

import * as React from "react";
import { IconFile, IconPaperclip } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AttachmentPreviewDialog,
  formatAttachmentSize,
} from "@/components/shared/attachment-preview-dialog";
import { useAttachmentsByReference } from "@/queries/attachments.queries";
import type { Attachment } from "@/validations/attachment.schema";

interface AttachmentSectionProps {
  referenceType: string;
  referenceId: string | undefined;
  title?: string;
  viewLabel?: string;
}

export function AttachmentSection({
  referenceType,
  referenceId,
  title = "Tệp đính kèm",
  viewLabel = "Xem",
}: AttachmentSectionProps) {
  const { data: attachments, isLoading } = useAttachmentsByReference(referenceType, referenceId);
  const [previewAtt, setPreviewAtt] = React.useState<Attachment | null>(null);

  if (isLoading || !attachments || attachments.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IconPaperclip className="size-4" />
            {title}
            <Badge variant="secondary">{attachments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-3 rounded-md border p-3">
                <IconFile className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{att.file_name}</p>
                  {att.file_size && (
                    <p className="text-xs text-muted-foreground">
                      {formatAttachmentSize(att.file_size)}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => setPreviewAtt(att)}>
                  {viewLabel}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AttachmentPreviewDialog
        open={!!previewAtt}
        onOpenChange={(open) => !open && setPreviewAtt(null)}
        attachments={previewAtt ? [previewAtt] : []}
      />
    </>
  );
}
