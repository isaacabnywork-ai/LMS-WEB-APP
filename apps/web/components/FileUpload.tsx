"use client";

import React, { useState, useRef } from "react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
  defaultPreviewUrl?: string | null;
}

export function FileUpload({ onUpload, accept = "image/*", label = "Choose File", defaultPreviewUrl }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultPreviewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview instantly
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Get presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, finalUrl } = await res.json();

      // 2. Upload file directly to S3 (or local fallback)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }

      // 3. Success! Pass final URL back to parent
      onUpload(finalUrl);
      if (!file.type.startsWith("image/")) {
        setPreview(finalUrl); // For video/documents, show the URL as "preview" text
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isUploading ? "border-teal-500 bg-teal-500/5 opacity-50 cursor-not-allowed" : "border-foreground/20 hover:border-teal-500 hover:bg-teal-500/5"
        }`}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={inputRef}
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        {preview && accept.includes("image") ? (
          <div className="flex flex-col items-center">
            <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-full mb-3 shadow-md border-4 border-white dark:border-black" />
            <p className="text-sm font-semibold text-teal-600">{isUploading ? "Uploading..." : "Click to change"}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center mb-3">
              {isUploading ? (
                <svg className="w-6 h-6 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-6 h-6 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              )}
            </div>
            <p className="font-medium">{isUploading ? "Uploading..." : label}</p>
            <p className="text-xs text-foreground/50 mt-1">Supports {accept}</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
    </div>
  );
}
