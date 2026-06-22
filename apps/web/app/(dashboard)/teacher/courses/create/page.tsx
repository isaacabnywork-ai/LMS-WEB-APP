"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/app/actions/teacher";
import { uploadFile } from "@/app/actions/upload";

export default function TeacherCourseCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [sectionBgPreview, setSectionBgPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      // 1. Upload thumbnail
      let thumbnailUrl = "";
      const thumbFile = formData.get("thumbnail") as File;
      if (thumbFile && thumbFile.size > 0) {
        const uploadData = new FormData(); uploadData.append("file", thumbFile);
        thumbnailUrl = await uploadFile(uploadData, "courses");
      }

      // 2. Upload courseHeaderImage
      let courseHeaderImage = "";
      const headerFile = formData.get("courseHeaderImage") as File;
      if (headerFile && headerFile.size > 0) {
        const uploadData = new FormData(); uploadData.append("file", headerFile);
        courseHeaderImage = await uploadFile(uploadData, "courses/headers");
      }

      // 3. Upload sectionBackgroundImage
      let sectionBackgroundImage = "";
      const bgFile = formData.get("sectionBackgroundImage") as File;
      if (bgFile && bgFile.size > 0) {
        const uploadData = new FormData(); uploadData.append("file", bgFile);
        sectionBackgroundImage = await uploadFile(uploadData, "courses/backgrounds");
      }

      // 4. Submit all data
      const result = await createCourse({
        title: formData.get("title") as string,
        shortName: formData.get("shortName") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        thumbnailUrl,
        status: formData.get("status") as string,
        startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
        endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
        idNumber: formData.get("idNumber") as string,
        format: formData.get("format") as string,
        numberOfSections: parseInt(formData.get("numberOfSections") as string) || 4,
        hiddenSections: formData.get("hiddenSections") as string,
        courseLayout: formData.get("courseLayout") as string,
        courseHeaderImage,
        sectionSummaryLength: parseInt(formData.get("sectionSummaryLength") as string) || 100,
        sectionBackgroundImage,
        headerBgPosition: formData.get("headerBgPosition") as string,
        headerBgSize: formData.get("headerBgSize") as string,
        headerOverlayOpacity: parseInt(formData.get("headerOverlayOpacity") as string) || 100,
      });

      if (result.success) {
        router.push(`/teacher/courses/${result.courseId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create course");
      setIsLoading(false);
    }
  }

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-6 mt-10">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="h-px bg-foreground/10 flex-1 ml-4"></div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up mt-10 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold font-heading text-foreground tracking-tight mb-2">Add a new course</h1>
      </div>

      <div className="glass-panel p-10 rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <div className="text-red-500 font-semibold p-4 bg-red-500/10 rounded-xl">{error}</div>}
          
          <SectionHeader title="General" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold opacity-80 mb-2">Course full name <span className="text-red-500">*</span></label>
              <input name="title" type="text" required className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course short name</label>
              <input name="shortName" type="text" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course category</label>
              <select name="category" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                <option value="Regulatory & Compliance">Regulatory & Compliance</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course visibility</label>
              <select name="status" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                <option value="published">Show</option>
                <option value="draft">Hide</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course ID number</label>
              <input name="idNumber" type="text" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course start date</label>
              <input name="startDate" type="date" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course end date</label>
              <input name="endDate" type="date" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          <SectionHeader title="Description" />
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course summary</label>
              <textarea 
                name="description" rows={6} 
                className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none resize-none font-sans"
              />
            </div>

            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course image</label>
              <label className="relative border-2 border-dashed border-foreground/20 hover:border-teal-400 bg-black/5 dark:bg-white/5 hover:bg-teal-500/5 rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] overflow-hidden">
                <input type="file" name="thumbnail" accept="image/*" onChange={(e) => handleImageChange(e, setPreviewImage)} className="hidden" />
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                  <>
                    <svg className="w-10 h-10 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span className="font-semibold">You can drag and drop files here to add them.</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <SectionHeader title="Course format" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Format</label>
              <select name="format" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                <option value="Edwiser course formats">Edwiser course formats</option>
                <option value="Weekly format">Weekly format</option>
                <option value="Topics format">Topics format</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Number of sections</label>
              <select name="numberOfSections" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Hidden sections</label>
              <select name="hiddenSections" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                <option value="Hidden sections are completely invisible">Hidden sections are completely invisible</option>
                <option value="Hidden sections are shown in collapsed form">Hidden sections are shown in collapsed form</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course layout</label>
              <select name="courseLayout" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                <option value="Show one section per page">Show one section per page</option>
                <option value="Show all sections on one page">Show all sections on one page</option>
              </select>
            </div>
          </div>

          <SectionHeader title="Appearance" />
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold opacity-80 mb-2">Course Header Image</label>
              <label className="relative border-2 border-dashed border-foreground/20 hover:border-teal-400 bg-black/5 dark:bg-white/5 hover:bg-teal-500/5 rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[150px] overflow-hidden">
                <input type="file" name="courseHeaderImage" accept="image/*" onChange={(e) => handleImageChange(e, setHeaderPreview)} className="hidden" />
                {headerPreview ? (
                  <img src={headerPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span className="font-semibold text-sm">Drop files here to upload</span>
                  </>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold opacity-80 mb-2">Set the section/activities summary maximum length</label>
                <input name="sectionSummaryLength" type="number" defaultValue="100" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold opacity-80 mb-2">Course header background image position</label>
                <select name="headerBgPosition" defaultValue="center" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                  <option value="center">center</option>
                  <option value="top">top</option>
                  <option value="bottom">bottom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold opacity-80 mb-2">Course header background image size</label>
                <select name="headerBgSize" defaultValue="cover" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                  <option value="cover">cover</option>
                  <option value="contain">contain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold opacity-80 mb-2">Change the header overlay opacity</label>
                <input name="headerOverlayOpacity" type="number" defaultValue="100" className="w-full bg-black/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold opacity-80 mb-2">Section background image</label>
                <label className="relative border-2 border-dashed border-foreground/20 hover:border-teal-400 bg-black/5 dark:bg-white/5 hover:bg-teal-500/5 rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden">
                  <input type="file" name="sectionBackgroundImage" accept="image/*" onChange={(e) => handleImageChange(e, setSectionBgPreview)} className="hidden" />
                  {sectionBgPreview ? (
                    <img src={sectionBgPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : (
                    <span className="font-semibold text-sm">Upload background image</span>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-foreground/10 flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="px-8 py-4 rounded-xl font-bold opacity-80 hover:opacity-100 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-teal-500/20 disabled:opacity-50">
              {isLoading ? "Saving..." : "Save and display"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
