"use client";
import React, { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Upload,
  Search,
  FileText,
  Trash2,
  Play,
  Square,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser"; // Your auth hook
import { useUser } from "../userProvider";

const AgenticDocumentDashboard = () => {
  // State management // Mock user
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState({
    total_documents: 0,
    total_chunks: 0,
    documents: [],
  });
  const [agentSessions, setAgentSessions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [roomName, setRoomName] = useState("");
  // const { user, loading } = useSupabaseUser();
  const user = useUser();
  const supabase = createSupabaseBrowserClient();


  //agent name
  const [agentName, setAgentName] = useState("");
  const [agentNameSaved, setAgentNameSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("agent_name")
        .eq("id", user.id)
        .single();

      if (!error && data?.agent_name) {
        setAgentName(data.agent_name);
        setAgentNameSaved(true);
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const saveAgentName = async () => {
    if (!user || agentName.trim() === "") return;

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id,agent_name: agentName })
      .eq("id", user.id);

    if (!error) {
      setAgentNameSaved(true);
    } else {
      console.error("Failed to save agent name:", error.message);
    }
  };

  const API_BASE = "https://apiend.spitchlabs.com"; // Adjust this to your API URL

  // Fetch user documents
  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE}/documents/${user.id}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch knowledge base summary
  const fetchKnowledgeBase = async () => {
    try {
      const response = await fetch(`${API_BASE}/knowledge-base/${user.id}`);
      const data = await response.json();
      setKnowledgeBase(data);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    }
  };

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/agent/sessions`);
      const data = await response.json();
      setAgentSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchDocuments();
    fetchKnowledgeBase();
    fetchActiveSessions();
  }, []);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
        setUploadStatus("Upload successful! Processing in background...");
        setTimeout(() => {
          fetchDocuments();
          fetchKnowledgeBase();
        }, 2000);
      } else {
        setUploadStatus(`Error: ${result.detail}`);
      }
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  // Handle document search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

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
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/documents/${user.id}/${documentId}`,
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

  // Start agent session
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
          user_id: user.id,
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

  // Stop agent session
  const stopAgentSession = async (roomName) => {
    try {
      const response = await fetch(
        `${API_BASE}/agent/stop/${user.id}/${roomName}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
<<<<<<< HEAD
      {/* <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-black p-3 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  Spitchlabs AI
                </h1>
                <p className="text-gray-600">Create your Sales Agent</p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-primary">{user.email}</p>
                <p className="text-xs text-gray-500">Authenticated User</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{user.email[0].toUpperCase()}</span>
              </div>
            </div> */}
      {/*    </div>
        </div>
      </div> */}
=======
     
>>>>>>> 13ec699286ac80eb07d4530d5520a9d6af46d9c0

      {/* Stats Cards */}
      {/* <div className="max-w-7xl mx-auto px-6 py-8"> */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Documents
                </p>
                <p className="text-3xl font-bold text-primary">
                  {knowledgeBase.total_documents}
                </p>
              </div>

              <FileText className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="bg-white p-6 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Knowledge Chunks
                </p>
                <p className="text-3xl font-bold text-primary">
                  {knowledgeBase.total_chunks}
                </p>
              </div>
              <Activity className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Active Sessions
                </p>
                <p className="text-3xl font-bold text-primary">
                  {agentSessions.length}
                </p>
              </div>
              <Users className="w-12 h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white mb-8">
          <div>
            <nav className="flex space-x-8 px-6">
              {[
                { id: "documents", label: "Documents", icon: FileText },
                { id: "search", label: "Search", icon: Search },
                { id: "agent", label: "Agent Sessions", icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    Upload Document
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Support for PDF, DOCX, and DOC files
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
                    className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r bg-primary  hover:bg-black/40 cursor-pointer transition-all ${
                      isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUploading ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isUploading ? "Uploading..." : "Choose File"}
                  </label>
                  {uploadStatus && (
                    <div
                      className={`mt-4 p-3 rounded-lg ${
                        uploadStatus.includes("Error")
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {uploadStatus.includes("Error") ? (
                          <AlertCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        {uploadStatus}
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents List */}
                <div>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Your Documents
                  </h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-medium text-primary mb-1 truncate">
                            {doc.filename}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Chunks: {doc.chunk_count || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Search Tab */}
            {activeTab === "search" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Search Your Documents
                  </h3>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Enter your search query..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-6 py-3 bg-primary text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                    >
                      {isSearching ? (
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-primary mb-4">
                      Search Results ({searchResults.length})
                    </h4>
                    <div className="space-y-4">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-primary">
                              {result.filename}
                            </h5>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {(result.similarity_score * 100).toFixed(1)}%
                              match
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {result.chunk_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Agent Sessions Tab */}
            {activeTab === "agent" && (
              <div className="space-y-6">
<<<<<<< HEAD
                <div>
                  <h3 className="text-lg font-medium text-primary mb-4">
                    Agent Sessions
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-medium text-primary mb-4">
                      Start New Session
                    </h4>
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Enter agent name..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        onClick={startAgentSession}
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/50 transition-colors flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Session
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div>
                  <h4 className="text-md font-medium text-primary mb-4">
                    Active Sessions
                  </h4>
                  {agentSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No active agent sessions</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {agentSessions.map((session, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between"
                        >
                          <div>
                            <h5 className="font-medium text-primary">
                              {session.room_name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Session ID: {session.session_id}
                            </p>
                          </div>
                          <button
                            onClick={() => stopAgentSession(session.room_name)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Stop
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
=======
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Agent Sessions
        </h3>
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-4">Create Agent</h4>

          <div className="flex space-x-4 items-center">
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={agentNameSaved}
            />

            <button
              onClick={saveAgentName}
              disabled={agentNameSaved || loading || !agentName.trim()}
              className={`px-6 py-3 rounded-xl flex items-center transition-colors ${
                agentNameSaved
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white hover:bg-green-700"
              }`}
            >
              {agentNameSaved ? "Agent Created" : "Save Agent Name"}
            </button>
          </div>
        </div>
      </div>
    </div>
>>>>>>> 13ec699286ac80eb07d4530d5520a9d6af46d9c0
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticDocumentDashboard;
