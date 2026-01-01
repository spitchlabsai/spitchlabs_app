"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

import { useUser } from "../userProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type DocumentRecord = {
  id: string;
  filename: string;
  chunk_count?: number;
  created_at: string;
};

type KnowledgeBaseSummary = {
  total_documents: number;
  total_chunks: number;
  documents: Array<{
    id: string;
    filename: string;
    chunk_count?: number;
  }>;
};

type SearchResult = {
  filename: string;
  similarity_score: number;
  chunk_text: string;
};

const KnowledgeBasePage: React.FC = () => {
  const user = useUser();
  const supabase = createSupabaseBrowserClient();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseSummary>({
    total_documents: 0,
    total_chunks: 0,
    documents: [],
  });
  const [agentSessions, setAgentSessions] = useState<any[]>([]);
  const [agentName, setAgentName] = useState("");
  const [agentNameSaved, setAgentNameSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [coldCallScript, setColdCallScript] = useState("");
  const [isUpdatingScript, setIsUpdatingScript] = useState(false);
  const [scriptUpdateStatus, setScriptUpdateStatus] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("agent_name")
        .eq("id", user?.id)
        .single();

      if (!error && data?.agent_name) {
        setAgentName(data.agent_name);
        setAgentNameSaved(true);
      }

      setLoading(false);
    };

    loadProfile();
  }, [user, supabase]);

  useEffect(() => {
    if (!user?.id) return;
    fetchDocuments();
    fetchKnowledgeBase();
    fetchActiveSessions();
    fetchColdCallScript();
  }, [user?.id]);

  const fetchDocuments = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE}/documents/${user.id}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchKnowledgeBase = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE}/knowledge-base/${user.id}`);
      const data = await response.json();
      setKnowledgeBase(data);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    }
  };

  const fetchColdCallScript = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE}/get-script/${user.id}`);
      const data = await response.json();
      setColdCallScript(data.script || "");
    } catch (error) {
      console.error("Error fetching script:", error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/agent/sessions`);
      const data = await response.json();
      setAgentSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const saveAgentName = async () => {
    if (!user || agentName.trim() === "") return;

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user?.id, agent_name: agentName })
      .eq("id", user?.id);

    if (!error) {
      setAgentNameSaved(true);
    } else {
      console.error("Failed to save agent name:", error.message);
    }
  };

  const handleUpdateScript = async () => {
    if (!user?.id) return;
    setIsUpdatingScript(true);
    setScriptUpdateStatus("Updating...");
    try {
      const response = await fetch(`${API_BASE}/update-script/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: coldCallScript }),
      });
      if (response.ok) {
        setScriptUpdateStatus("Script updated successfully.");
      } else {
        const data = await response.json();
        setScriptUpdateStatus(`Error: ${data.detail || "Failed to update"}`);
      }
    } catch (error) {
      setScriptUpdateStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsUpdatingScript(false);
      setTimeout(() => setScriptUpdateStatus(""), 3000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/upload-document/${user.id}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus("Upload successful. Processing in the background.");
        setTimeout(() => {
          fetchDocuments();
          fetchKnowledgeBase();
        }, 1200);
      } else {
        setUploadStatus(`Error: ${result.detail}`);
      }
    } catch (error) {
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user?.id) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE}/search/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10,
          threshold: 0.7,
        }),
      });

      const results = await response.json();
      // Handle both array and object formats for robustness
      setSearchResults(Array.isArray(results) ? results : (results?.results || []));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`${API_BASE}/documents/${user.id}/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDocuments();
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const startAgentSession = async () => {
    if (!user?.id) {
      alert("Please sign in to start a session.");
      return;
    }
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/agent/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          room_name: roomName,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        fetchActiveSessions();
        setRoomName("");
      }
    } catch (error) {
      console.error("Agent start error:", error);
    }
  };

  const stopAgentSession = async (roomNameParam: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/agent/stop/${user?.id}/${roomNameParam}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        fetchActiveSessions();
      }
    } catch (error) {
      console.error("Agent stop error:", error);
    }
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <main className="mx-auto flex max-w-[1360px] flex-col px-4 pb-10 pt-8 md:px-6 lg:pt-10">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Knowledge Base
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Upload documents, search across your knowledge base, and keep an eye
              on active agent sessions in one place.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
                {userInitial}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user.email}
                </p>
                <p className="text-xs text-slate-500">Signed in</p>
              </div>
            </div>
          )}
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total Documents
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                  {knowledgeBase.total_documents}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-slate-900">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Knowledge Chunks
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                  {knowledgeBase.total_chunks}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/5 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Active Sessions
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
                  {agentSessions.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/5 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 ">
          <div className="space-y-6">
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Upload a document
                  </p>
                  <p className="text-sm text-slate-600">
                    PDF, DOCX and DOC are supported. We&apos;ll process it and add it to
                    your knowledge base.
                  </p>
                </div>
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition ${isUploading
                    ? "cursor-not-allowed bg-slate-300 text-slate-600"
                    : "cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                >
                  {isUploading ? (
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? "Uploading…" : "Choose file"}
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload"
                />
              </div>
              {uploadStatus && (
                <div
                  className={`mt-4 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${uploadStatus.includes("Error")
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                    }`}
                >
                  {uploadStatus.includes("Error") ? (
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {uploadStatus}
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Your documents
                </h3>
                <p className="text-xs text-slate-500">
                  {documents.length} {documents.length === 1 ? "file" : "files"}
                </p>
              </div>

              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 py-10 text-center">
                  <FileText className="mb-3 h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium text-slate-700">
                    No documents yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload a file to start building your knowledge base.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/5 text-slate-900">
                          <FileText className="h-4 w-4" />
                        </div>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-slate-400 transition hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h4 className="line-clamp-2 text-sm font-medium text-slate-900">
                        {doc.filename}
                      </h4>
                      <p className="mt-2 text-xs text-slate-500">
                        Chunks:{" "}
                        <span className="font-medium">
                          {doc.chunk_count || 0}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Cold Call Script
                </h3>
                <p className="text-xs text-slate-500">
                  Manage the script your agent follows during cold calls.
                </p>
                <textarea
                  value={coldCallScript}
                  onChange={(e) => setColdCallScript(e.target.value)}
                  placeholder="Enter the sales script for your agent..."
                  className="min-h-[200px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {scriptUpdateStatus && (
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${scriptUpdateStatus.includes("Error")
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                          }`}
                      >
                        {scriptUpdateStatus.includes("Error") ? (
                          <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {scriptUpdateStatus}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleUpdateScript}
                    disabled={isUpdatingScript}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isUpdatingScript ? (
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    {isUpdatingScript ? "Updating..." : "Update Script"}
                  </button>
                </div>
              </div>
            </div>

            {/* <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Search your documents
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ask a question or search across your knowledge base.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Find answers fast…"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isSearching ? (
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    {isSearching ? "Searching…" : "Search"}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.filename}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">
                          {result.filename}
                        </p>
                        <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {(result.similarity_score * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700">
                        {result.chunk_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          </div>

          {/* <aside className="space-y-6"> */}
          {/* <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900/80" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Knowledge base snapshot
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {knowledgeBase.total_documents > 0
                      ? "Active knowledge base"
                      : "No file uploaded yet"}
                  </h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-slate-900">
                  <Layers className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-xs uppercase tracking-[0.08em] text-slate-500">
                    Documents
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {knowledgeBase.total_documents}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-xs uppercase tracking-[0.08em] text-slate-500">
                    Chunks
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {knowledgeBase.total_chunks}
                  </span>
                </div>
              </div>

              {knowledgeBase.documents?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Latest uploads
                  </p>
                  {knowledgeBase.documents.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs"
                    >
                      <span className="line-clamp-1 text-slate-800">
                        {doc.filename}
                      </span>
                      <span className="text-slate-500">
                        {doc.chunk_count || 0} chunks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div> */}

          {/* <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Agent identity
              </h3>
              <p className="mb-3 text-xs text-slate-500">
                Give your agent a name to use across calls and other channels.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Spitchlabs Sales Agent"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed"
                  disabled={agentNameSaved}
                />
                <button
                  onClick={saveAgentName}
                  disabled={agentNameSaved || loading || !agentName.trim()}
                  className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                    agentNameSaved
                      ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                      : "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                  }`}
                >
                  {agentNameSaved ? "Agent created" : "Save agent name"}
                </button>
              </div>
            </div> */}

          {/* <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Active sessions
                </h3>
                <span className="rounded-full bg-slate-900/5 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                  {agentSessions.length} live
                </span>
              </div>

              {agentSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 py-8 text-center">
                  <Users className="mb-2 h-8 w-8 text-slate-200" />
                  <p className="text-sm font-medium text-slate-700">
                    No active agent sessions
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Start a session to see it listed here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentSessions.map((session, index) => (
                    <div
                      key={`${session.room_name}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {session.room_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Session ID: {session.session_id}
                        </p>
                      </div>
                      <button
                        onClick={() => stopAgentSession(session.room_name)}
                        className="inline-flex items-center rounded-full bg-rose-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-rose-700"
                      >
                        Stop
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Start new session
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Session room name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  <button
                    onClick={startAgentSession}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start session
                  </button>
                </div>
              </div>
            </div> */}
          {/* </aside> */}
        </section>
      </main>
    </div>
  );
};

export default KnowledgeBasePage;
