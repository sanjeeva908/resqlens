"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";

interface SceneUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function SceneUploader({ onFileSelect, disabled = false }: SceneUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandle = useCallback(
    (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setValidationError("Unsupported format. Please upload JPEG, PNG, WebP, or GIF.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setValidationError("File exceeds maximum allowed size (10 MB).");
        return;
      }
      setValidationError(null);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) validateAndHandle(file);
    },
    [disabled, validateAndHandle]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndHandle(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-red-400 bg-red-500/10 scale-[1.01]"
            : "border-gray-700/80 bg-gray-900/40 hover:border-gray-500 hover:bg-gray-900/60"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
          id="scene-file-input"
        />

        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-800 border border-gray-700 text-gray-300 shadow-inner">
            <Upload className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Drop scene image or <span className="text-red-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG, WebP up to 10MB
            </p>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
