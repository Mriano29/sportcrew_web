import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

// Define props expected by the component
type Props = {
  onFileAccepted: (file: File) => void; // Callback when a file is accepted
};

export default function ImageDropzone({ onFileAccepted }: Props) {
  // Callback function triggered when a file is dropped or selected
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // If at least one file is accepted, call the parent callback with the first file
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted] // Dependency array to memoize the function correctly
  );

  // Set up the dropzone using react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, 
    accept: { "image/*": [] }, 
    multiple: false, 
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
        isDragActive ? "border-blue-500 bg-accent" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} /> {/* Hidden input for file selection */}
      <p>
        {isDragActive
          ? "Drop your image here"
          : "Drag an image or click to select one"}
      </p>
    </div>
  );
}
