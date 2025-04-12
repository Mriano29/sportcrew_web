import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

type Props = {
  onFileAccepted: (file: File) => void;
};

export default function ImageDropzone({ onFileAccepted }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      <p>
        {isDragActive
          ? "Suelta la imagen aquí..."
          : "Arrastra una imagen o haz clic para seleccionar"}
      </p>
    </div>
  );
}
