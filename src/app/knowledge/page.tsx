"use client";

import React, { useState } from "react";

type KnowledgeBaseStatus = "ready" | "processing";

interface KnowledgeBaseFile {
  id: number;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  status: KnowledgeBaseStatus;
}

const KnowledgeBasePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseFile | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSubmitting(true);

    // Simulate local "create"
    const now = new Date();
    const newKB: KnowledgeBaseFile = {
      id: Date.now(),
      fileName: selectedFile.name,
      fileSize: formatFileSize(selectedFile.size),
      fileType: selectedFile.type || "Unknown",
      uploadedAt: now.toISOString(),
      status: "ready",
    };

    // Just store locally for now
    setTimeout(() => {
      setKnowledgeBase(newKB);
      setIsSubmitting(false);
      setSelectedFile(null);
      setIsModalOpen(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <main className="mx-auto flex max-w-[1360px] flex-col px-4 pb-10 pt-8 md:px-6 lg:pt-10">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Knowledge Base
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Upload PDFs or Excel files that your agents can use as a source of
              truth. We&apos;ll keep everything organized in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 5v14m7-7H5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Upload knowledge base
          </button>
        </header>

        {/* Content layout */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {/* Left: status / card */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              {/* accent bar */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/60" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Current knowledge base
                  </p>
                  {knowledgeBase ? (
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      {knowledgeBase.fileName}
                    </h2>
                  ) : (
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      No file uploaded yet
                    </h2>
                  )}
                </div>

                {knowledgeBase && (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      knowledgeBase.status === "ready"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                    {knowledgeBase.status === "ready"
                      ? "Ready to use"
                      : "Processing"}
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    File
                  </p>
                  {knowledgeBase ? (
                    <>
                      <p className="font-medium text-slate-900">
                        {knowledgeBase.fileName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {knowledgeBase.fileSize}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Upload a PDF or Excel workbook to get started.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Type
                  </p>
                  <p className="text-sm text-slate-700">
                    {knowledgeBase
                      ? knowledgeBase.fileType ||
                        (knowledgeBase.fileName.endsWith(".pdf")
                          ? "PDF document"
                          : "Spreadsheet")
                      : "PDF · XLSX · CSV"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Last updated
                  </p>
                  <p className="text-sm text-slate-700">
                    {knowledgeBase
                      ? new Date(knowledgeBase.uploadedAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 6v6l3 3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {knowledgeBase
                    ? "This file will be used as a reference for your agents."
                    : "Nothing uploaded yet. Your agents will fall back to default responses."}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  {knowledgeBase ? "Replace file" : "Upload file"}
                </button>
              </div>
            </div>

            {/* History / placeholder list (local dummy, just UI) */}
            <div className="overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Upload activity
                </p>
                <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-medium text-slate-50">
                  Local only
                </span>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                {knowledgeBase ? (
                  <>
                    <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">
                          {knowledgeBase.fileName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {formatFileSize(
                            Number(
                              knowledgeBase.fileSize
                                .replace("MB", "")
                                .replace("KB", "")
                                .trim()
                            ) || 0
                          )}{" "}
                          ·{" "}
                          {new Date(knowledgeBase.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Active
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Once you upload a knowledge base, we’ll show a local upload
                    history here.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: helper / guidelines */}
          <aside className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="pointer-events-none absolute -right-20 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <h3 className="text-sm font-semibold text-slate-900">
                Upload guidelines
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                A clean, structured file helps agents answer faster and more
                accurately.
              </p>

              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  Use PDFs for handbooks, playbooks, and FAQs.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  Use Excel/CSV for product lists, pricing tables, and
                  structured data.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  Avoid scanned images without text — they won&apos;t be
                  readable yet.
                </li>
              </ul>
            </div>

            {/* <div className="rounded-3xl border border-slate-200 bg-slate-900 px-4 py-4 text-xs text-slate-50">
              <p className="font-semibold text-primary">
                Coming soon: live sync
              </p>
              <p className="mt-1 text-slate-200">
                This page is wired for local state only right now. When your API
                is ready, you can:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Persist uploads to your backend</li>
                <li>Show processing states from your pipeline</li>
                <li>Version and roll back knowledge base files</li>
              </ul>
            </div> */}
          </aside>
        </section>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Upload knowledge base
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose a PDF or Excel file. We’ll keep it local for now
                    until the backend is connected.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) setIsModalOpen(false);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-700">
                    File
                  </p>
                  <p className="mb-2 text-[11px] text-slate-500">
                    Supported formats:{" "}
                    <span className="font-medium">.pdf, .xlsx, .csv</span>
                  </p>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center text-xs text-slate-500 transition hover:border-primary/60 hover:bg-primary/5">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 16V4m0 0l-3.5 3.5M12 4l3.5 3.5M6 16v1a3 3 0 003 3h6a3 3 0 003-3v-1"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-slate-900">
                      {selectedFile
                        ? selectedFile.name
                        : "Click to choose file"}
                    </span>
                    <span className="mt-1 text-[11px] text-slate-500">
                      Max 10MB · One file at a time
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.xlsx,.xls,.csv"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    This upload is <span className="font-semibold">local</span>{" "}
                    until the API is ready.
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || isSubmitting}
                    className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && (
                      <span className="mr-2 inline-flex h-3 w-3 animate-spin rounded-full border-[2px] border-primary-foreground/40 border-t-transparent" />
                    )}
                    {isSubmitting ? "Uploading…" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KnowledgeBasePage;
