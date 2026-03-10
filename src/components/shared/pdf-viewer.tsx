"use client";

import { useCallback, useState } from "react";
import { useFullscreen } from "@/hooks";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
  IconLoader2,
  IconMaximize,
  IconMinimize,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = "/library/pdf.worker.min.mjs";

interface PdfViewerProps {
  fileUrl: string;
  className?: string;
  errorMessage?: string;
  showFullscreen?: boolean;
}

export function PdfViewer({
  fileUrl,
  className,
  errorMessage,
  showFullscreen = false,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.3);
  const {
    isFullscreen,
    isClosing,
    isVisible,
    toggle: toggleFullscreen,
    ref,
  } = useFullscreen<HTMLDivElement>();

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.4));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.3);
  }, []);

  return (
    <>
      {showFullscreen && isVisible && (
        <div
          className={cn(
            "fixed inset-0 z-60 bg-background/80 backdrop-blur-md duration-300",
            isClosing ? "animate-out fade-out-0" : "animate-in fade-in-0",
          )}
          onClick={toggleFullscreen}
          aria-hidden
        />
      )}
      <div
        ref={showFullscreen ? ref : undefined}
        className={cn("flex flex-col overflow-hidden rounded-lg border bg-background", className)}
      >
        {/* Controls */}
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <span className="min-w-20 text-center text-sm">
              {pageNumber} / {numPages || "..."}
            </span>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="secondary" size="icon-sm" onClick={zoomOut} disabled={scale <= 0.4}>
              <IconMinus className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" className="min-w-14 px-2" onClick={resetZoom}>
              {Math.round(scale * 100)}%
            </Button>
            <Button variant="secondary" size="icon-sm" onClick={zoomIn} disabled={scale >= 3.0}>
              <IconPlus className="size-4" />
            </Button>
          </div>

          {showFullscreen && (
            <Button variant="secondary" size="icon-sm" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <IconMinimize className="size-4" />
              ) : (
                <IconMaximize className="size-4" />
              )}
            </Button>
          )}
        </div>

        {/* PDF Content */}
        <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-4">
          <div className="relative">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex min-h-96 items-center justify-center">
                  <IconLoader2 className="size-8 animate-spin text-primary" />
                </div>
              }
              error={
                <div className="flex min-h-96 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <IconFileText className="size-12" />
                  <p className="text-sm">{errorMessage ?? "Cannot load PDF"}</p>
                </div>
              }
              className="mx-auto w-fit"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div className="flex min-h-96 items-center justify-center">
                    <IconLoader2 className="size-6 animate-spin text-primary" />
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      </div>
    </>
  );
}
