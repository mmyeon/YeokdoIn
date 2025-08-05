import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { RefObject, useState } from "react";
import { cn } from "@/lib/utils";

const VideoUpload = ({
  handleFileSelect,
  fileInputRef,
}: {
  handleFileSelect: (file: File) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

      <h3 className="text-lg font-semibold mb-2">비디오 파일을 업로드하세요</h3>
      <p className="text-muted-foreground mb-4">
        드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
      </p>

      <Button onClick={() => fileInputRef?.current?.click()} className="w-full">
        <Upload className="h-4 w-4 mr-2" />
        비디오 선택
      </Button>

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
