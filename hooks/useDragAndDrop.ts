import { useState } from "react";

const useDragAndDrop = ({
  onDropCallback,
}: {
  onDropCallback: (files: File[]) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
    onDropCallback(Array.from(files) as File[]);
  };

  return {
    isDragOver,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
};

export default useDragAndDrop;
