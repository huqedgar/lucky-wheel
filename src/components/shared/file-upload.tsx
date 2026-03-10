"use client";

import { useCallback, useRef, useState } from "react";
import { IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Per-type Size Limits ──────────────────────────────────────────────────

const MB = 1024 * 1024;

/** Giới hạn dung lượng theo nhóm file — đồng bộ với SEED_FILE_TYPES */
const FILE_SIZE_LIMITS = {
  document: 20 * MB, // 20 MB — PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, CSV
  image: 10 * MB, //    10 MB — JPG, JPEG, PNG, GIF, WEBP, SVG
  video: 200 * MB, // 200 MB — MP4, MOV, AVI, WEBM
  audio: 50 * MB, //   50 MB — MP3
  archive: 100 * MB, // 100 MB — ZIP, RAR
} as const;

type FileSizeCategory = keyof typeof FILE_SIZE_LIMITS;

const CATEGORY_LABELS: Record<FileSizeCategory, string> = {
  document: "tài liệu",
  image: "hình ảnh",
  video: "video",
  audio: "âm thanh",
  archive: "file nén",
};

function getFileSizeCategory(mimeType: string): FileSizeCategory {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/zip" || mimeType === "application/vnd.rar") return "archive";
  return "document";
}

function getMaxSizeForType(mimeType: string): number {
  return FILE_SIZE_LIMITS[getFileSizeCategory(mimeType)];
}

/** Overall max = largest per-type limit (used as dropzone safety net) */
const OVERALL_MAX_SIZE = Math.max(...Object.values(FILE_SIZE_LIMITS));

// ─── Accepted File Types ───────────────────────────────────────────────────

/** Định dạng file cho phép — đồng bộ với SEED_FILE_TYPES */
const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/csv": [".csv"],
  // Media
  "image/*": [],
  "video/*": [],
  "audio/*": [],
  // Archives
  "application/zip": [".zip"],
  "application/vnd.rar": [".rar"],
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toUpperCase() ?? "FILE";
}

// ─── Size Limit Hint ───────────────────────────────────────────────────────

function getCategoriesFromAccept(accept: Record<string, string[]>): Set<FileSizeCategory> {
  const cats = new Set<FileSizeCategory>();
  for (const mime of Object.keys(accept)) {
    if (mime.startsWith("image/")) cats.add("image");
    else if (mime.startsWith("video/")) cats.add("video");
    else if (mime.startsWith("audio/")) cats.add("audio");
    else if (mime === "application/zip" || mime === "application/vnd.rar") cats.add("archive");
    else cats.add("document");
  }
  return cats;
}

function buildSizeHint(accept: Record<string, string[]>): string {
  const cats = getCategoriesFromAccept(accept);
  return Array.from(cats)
    .map((cat) => `${CATEGORY_LABELS[cat]} ≤${FILE_SIZE_LIMITS[cat] / MB}MB`)
    .join(" · ");
}

// ─── Component ─────────────────────────────────────────────────────────────

interface FileUploadProps {
  onChange?: (files: File[]) => void;
  accept?: Record<string, string[]>;
  /** Single size limit for all types. When omitted, per-type limits apply automatically. */
  maxSize?: number;
  disabled?: boolean;
  multiple?: boolean;
}

export function FileUpload({
  onChange,
  accept = ACCEPTED_FILE_TYPES,
  maxSize,
  disabled = false,
  multiple = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const filesRef = useRef<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateFiles = useCallback(
    (next: File[]) => {
      filesRef.current = next;
      setFiles(next);
      onChange?.(next);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (newFiles: File[]) => {
      if (multiple) {
        const existingNames = new Set(filesRef.current.map((f) => f.name));
        const unique = newFiles.filter((f) => !existingNames.has(f.name));
        updateFiles([...filesRef.current, ...unique]);
      } else {
        updateFiles(newFiles);
      }
    },
    [multiple, updateFiles],
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      updateFiles(filesRef.current.filter((_, i) => i !== index));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [updateFiles],
  );

  const handleClearAll = useCallback(() => {
    updateFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [updateFiles]);

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  /** Per-type size validator (skipped when caller provides a single maxSize) */
  const fileSizeValidator = useCallback(
    (file: File) => {
      if (maxSize) return null; // Caller overrides — let dropzone's maxSize handle it
      const limit = getMaxSizeForType(file.type);
      if (file.size > limit) {
        const label = CATEGORY_LABELS[getFileSizeCategory(file.type)];
        return {
          code: "file-too-large",
          message: `File "${file.name}" (${label}) quá lớn. Giới hạn: ${formatFileSize(limit)}`,
        };
      }
      return null;
    },
    [maxSize],
  );

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    noClick: true,
    accept,
    maxSize: maxSize ?? OVERALL_MAX_SIZE,
    disabled,
    validator: fileSizeValidator,
    onDrop: handleDrop,
    onDropRejected: (rejections) => {
      for (const rejection of rejections) {
        const error = rejection.errors[0];
        if (error?.code === "file-too-large") {
          // Per-type validator provides a descriptive message; single maxSize doesn't
          if (maxSize) {
            toast.error(
              `File "${rejection.file.name}" quá lớn. Giới hạn: ${Math.round(maxSize / MB)}MB`,
            );
          } else {
            toast.error(error.message);
          }
        } else if (error?.code === "file-invalid-type") {
          toast.error(`File "${rejection.file.name}" không được hỗ trợ`);
        } else {
          toast.error(error?.message ?? "File không hợp lệ");
        }
      }
    },
  });

  const acceptStr = Object.entries(accept)
    .flatMap(([mime, exts]) => [mime, ...exts])
    .join(",");

  const sizeHintText = maxSize ? `Tối đa ${Math.round(maxSize / MB)}MB` : buildSizeHint(accept);

  return (
    <div className="w-full" {...getRootProps()}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptStr}
        onChange={(e) => {
          const selected = Array.from(e.target.files || []);
          if (selected.length > 0) handleDrop(selected);
          e.target.value = "";
        }}
        className="hidden"
        disabled={disabled}
      />

      {multiple ? (
        <div className="space-y-2">
          {/* Dropzone — always visible */}
          <div
            onClick={handleClick}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
              files.length > 0 ? "px-4 py-4" : "px-6 py-8",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full transition-colors",
                files.length > 0 ? "mb-1.5 size-8" : "mb-3 size-10",
                isDragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <IconUpload className={files.length > 0 ? "size-4" : "size-5"} />
            </div>
            <p
              className={cn(
                "font-medium text-foreground",
                files.length > 0 ? "text-xs" : "text-sm",
              )}
            >
              {isDragActive ? "Thả tệp vào đây" : "Kéo thả hoặc nhấp để thêm tệp"}
            </p>
            {files.length === 0 && (
              <p className="mt-1 text-center text-xs text-muted-foreground">{sizeHintText}</p>
            )}
          </div>

          {/* File list header */}
          {files.length > 1 && !disabled && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{files.length} tệp đã chọn</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-auto px-2 py-1 text-xs text-destructive hover:text-destructive"
              >
                <IconTrash className="size-3" />
                Xóa tất cả
              </Button>
            </div>
          )}

          {/* File list */}
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={file.name + file.size}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2.5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <span className="text-[0.6rem] leading-none font-bold text-primary">
                    {getFileExtension(file.name)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                  >
                    <IconX className="size-3.5" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // Single mode: toggle between dropzone and preview
        <AnimatePresence mode="wait">
          {files[0] ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <span className="text-[0.65rem] leading-none font-bold text-primary">
                  {getFileExtension(files[0].name)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{files[0].name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatFileSize(files[0].size)}
                </p>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(0);
                  }}
                >
                  <IconX className="size-4" />
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClick}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <div
                className={cn(
                  "mb-3 flex size-10 items-center justify-center rounded-full transition-colors",
                  isDragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                <IconUpload className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Thả tệp vào đây" : "Kéo thả hoặc nhấp để chọn tệp"}
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">{sizeHintText}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
