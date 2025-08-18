const getFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileInfoDisplay = ({ file }: { file: File }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="font-medium">선택된 파일:</span>
      <span className="text-sm text-muted-foreground">
        {file.name} ({getFileSize(file.size)})
      </span>
    </div>
  );
};

export default FileInfoDisplay;
