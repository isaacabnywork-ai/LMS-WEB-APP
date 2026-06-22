"use client";

import React, { useState, useRef } from "react";
import { updateProfile, uploadProfileImage } from "@/app/actions/settings";

export default function SettingsClient({ user }: { 
  user: { name: string; email: string; bio: string; phone: string; image: string; role: string } 
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    phone: user.phone,
    image: user.image
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      let currentImage = formData.image;
      
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        const result = await uploadProfileImage(fileData);
        currentImage = result.url;
        setFormData(prev => ({ ...prev, image: currentImage }));
        setSelectedFile(null);
      }

      await updateProfile({ ...formData, image: currentImage });
      setSaveMessage("Settings saved successfully!");
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to save settings.");
    }
    setIsSaving(false);
  };

  return (
    <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-foreground/10 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-8 pb-8 border-b border-foreground/10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-500 shadow-xl flex items-center justify-center border-4 border-white dark:border-slate-800">
              {previewUrl || formData.image ? (
                <img src={previewUrl || formData.image} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-white font-bold">{formData.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-white text-xs font-bold uppercase tracking-wider">Upload</span>
            </div>
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-sm font-bold text-foreground/70 mb-2 uppercase tracking-wider">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-foreground font-semibold py-2 px-4 rounded-xl border border-foreground/10 transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Choose Image...
              </button>
              {selectedFile && <p className="text-xs text-foreground/60 mt-2">Selected: {selectedFile.name}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-foreground/10 rounded-lg text-xs font-bold uppercase tracking-wider">{user.role}</span>
              <span className="text-sm font-medium text-foreground/50">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground/70 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground/70 uppercase tracking-wider">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-foreground/70 uppercase tracking-wider">Bio</label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a little about yourself..."
            className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium resize-none"
          />
        </div>

        <div className="pt-6 border-t border-foreground/10 flex items-center justify-between">
          <p className={`font-semibold text-sm ${saveMessage.includes("success") ? "text-teal-500" : "text-rose-500"}`}>
            {saveMessage}
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
