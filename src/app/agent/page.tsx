"use client";

import React, { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Upload,
  Search,
  FileText,
  Trash2,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useUser } from "../userProvider";

const AgenticDocumentDashboard = () => {
  const [activeTab, setActiveTab] = useState<"documents" | "search" | "agent">(
    "documents"
  );

  const [documents, setDocuments] = useState<
    Array<{
      id: string;
      filename: string;
      chunk_count?: number;
      created_at: string;
    }>
  >([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      filename: string;
      similarity_score: number;
      chunk_text: string;
    }>
  >([]);

  const [knowledgeBase, setKnowledgeBase] = useState<{
    total_documents: number;
    total_chunks: number;
    documents: Array<any>;
  }>({
    total_documents: 0,
    total_chunks: 0,
    documents: [],
  });

  const [agentSessions, setAgentSessions] = useState<Array<any>>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [roomName, setRoomName] = useState("");

  const user = useUser();
  const supabase = createSupabaseBrowserClient();

  const [agentName, setAgentName] = useState("");
  const [agentNameSaved, setAgentNameSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE = "https://apiend.spitchlabs.com";

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

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE}/documents/${user?.id}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const response = await fetch(`${API_BASE}/knowledge-base/${user?.id}`);
      const data = await response.json();
      setKnowledgeBase(data);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
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

  useEffect(() => {
    fetchDocuments();
    fetchKnowledgeBase();
    fetchActiveSessions();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/upload-document/${user?.id}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus("Upload successful. Processing in the background.");
        setTimeout(() => {
          fetchDocuments();
          fetchKnowledgeBase();
        }, 1500);
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
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE}/search/${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10,
          threshold: 0.7,
        }),
      });

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/documents/${user?.id}/${documentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchDocuments();
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const startAgentSession = async () => {
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
      <main className="mx-auto max-w-[1360px] px-4 py-8 md:px-6">
        {/* Top header */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Knowledge & Agent Console
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your documents, search your knowledge base, and configure
              your agent.
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

        {/* Stats */}
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

        {/* Tabs */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="border-b border-slate-100 px-4 pt-4">
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-500">
              {[
                { id: "documents", label: "Documents", icon: FileText },
                { id: "search", label: "Search", icon: Search },
                { id: "agent", label: "Agent Sessions", icon: Users },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as typeof activeTab)
                    }
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Documents tab */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                {/* Upload */}
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
                  <Upload className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Upload a document
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    PDF, DOCX and DOC are supported.
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="file-upload"
                  />

                  <label
                    htmlFor="file-upload"
                    className={`mt-4 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition ${
                      isUploading
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

                  {uploadStatus && (
                    <div
                      className={`mt-4 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                        uploadStatus.includes("Error")
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

                {/* Document list */}
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Your documents
                    </h3>
                    <p className="text-xs text-slate-500">
                      {documents.length}{" "}
                      {documents.length === 1 ? "file" : "files"}
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
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
                            {new Date(
                              doc.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search tab */}
            {activeTab === "search" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Search your documents
                  </h3>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSearch()
                      }
                      placeholder="Ask a question or search across your knowledge…"
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
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">
                      Results ({searchResults.length})
                    </h4>
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="font-medium text-slate-900">
                              {result.filename}
                            </p>
                            <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              {(result.similarity_score * 100).toFixed(
                                1
                              )}
                              % match
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">
                            {result.chunk_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Agent tab */}
            {activeTab === "agent" && (
              <div className="space-y-8">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Agent identity
                  </h3>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                    <p className="mb-3 text-xs text-slate-500">
                      Give your sales agent a name. You can reuse this
                      identity when configuring calls or other channels.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g. Spitchlabs Sales Agent"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        disabled={agentNameSaved}
                      />
                      <button
                        onClick={saveAgentName}
                        disabled={
                          agentNameSaved ||
                          loading ||
                          !agentName.trim()
                        }
                        className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                          agentNameSaved
                            ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                            : "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                        }`}
                      >
                        {agentNameSaved
                          ? "Agent created"
                          : "Save agent name"}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Active sessions
                  </h3>
                  {agentSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/80 py-10 text-center">
                      <Users className="mb-3 h-10 w-10 text-slate-200" />
                      <p className="text-sm font-medium text-slate-700">
                        No active agent sessions
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        When you start an agent, it will show up here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {agentSessions.map((session, index) => (
                        <div
                          key={index}
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
                            onClick={() =>
                              stopAgentSession(session.room_name)
                            }
                            className="inline-flex items-center rounded-full bg-rose-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-rose-700"
                          >
                            Stop
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Optional: start session UI (if you still want it) */}
                {/* 
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Start a new agent session
                  </h3>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Session room name"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                </div> 
                */}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AgenticDocumentDashboard;
