import { Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { RefObject } from "react";
import { cn } from "@/lib/utils";
import useDragAndDrop from "@/hooks/useDragAndDrop";
import { toast } from "sonner";

const VideoUpload = ({
  handleFileSelect,
  fileInputRef,
}: {
  handleFileSelect: (file: File) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}) => {
  const { isDragOver, handleDragLeave, handleDragOver, handleDrop } =
    useDragAndDrop({
      onDropCallback: (files) => {
        if (files.length > 1) {
          toast.info("하나의 영상만 업로드할 수 있습니다.");
          return;
        }

        handleFileSelect(files?.[0]);
      },
    });

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
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
      <p className="text-muted-foreground mb-6">
        드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
      </p>

      <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-muted/30 rounded-lg border border-muted/50">
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <p className="text-muted-foreground text-sm font-medium ">
          영상은 하나만 업로드할 수 있습니다.
        </p>
      </div>

      <Button onClick={() => fileInputRef?.current?.click()}>
        <Upload className="h-4 w-4 mr-2" />
        업로드하기
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
