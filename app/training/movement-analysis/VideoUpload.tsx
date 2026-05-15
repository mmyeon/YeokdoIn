"use client";

import { Input } from "@/components/ui/input/input";
import { cn } from "@/lib/utils";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import { toast } from "sonner";
import { RefObject } from "react";

interface VideoUploadProps {
  onFileSelect: (file: File) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

const VideoUpload = ({ onFileSelect, fileInputRef }: VideoUploadProps) => {
  const { isDragOver, handleDragLeave, handleDragOver, handleDrop } =
    useDragAndDrop({
      onDropCallback: (files) => {
        if (files.length > 1) {
          toast.info("You can only upload one video.");
          return;
        }
        onFileSelect(files[0]);
      },
    });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-var(--tab-bar-height))] max-w-md mx-auto">
      <div className="px-5 pt-8 pb-1">
        <h1 className="text-[28px] font-bold leading-tight">Video Analysis</h1>
        <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
          Break down your lift in 4 quick steps.
        </p>
      </div>

      <div className="px-4 py-4 flex-1 flex">
        <div
          className={cn(
            "w-full flex flex-col items-center justify-center gap-4 rounded-[18px] border-2 border-dashed border-primary p-5",
            "bg-primary/5 transition-colors",
            isDragOver && "bg-primary/10"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-[60px] h-[60px] rounded-2xl bg-primary/10 border border-primary text-primary flex items-center justify-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v13" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 19h14" />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-base font-bold">Upload a video</p>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              Drag &amp; drop, or tap to browse
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-[46px] w-[200px] rounded-full bg-primary text-primary-foreground font-bold text-sm"
          >
            Choose Video
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {["MP4 · MOV", "≤ 2 min", "≤ 200 MB"].map((label) => (
              <span
                key={label}
                className="px-2.5 py-0.5 rounded-full text-[11px] border border-border text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default VideoUpload;
