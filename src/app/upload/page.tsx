// app/upload/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { Upload, FileText, Trash2, Search, Eye } from 'lucide-react';

interface Document {
  document_id: string;
  filename: string;
  file_type: string;
  upload_date: string;
  chunk_count: number;
}

interface KnowledgeBaseSummary {
  total_documents: number;
  total_chunks: number;
  documents: Document[];
}

interface SearchResult {
  chunk_text: string;
  filename: string;
  similarity_score: number;
  document_id: string;
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchKnowledgeBase(user.id);
      }
    };
    getUser();
  }, []);

  const fetchKnowledgeBase = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-base/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBase(data);
      }
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      setUploadStatus('Please log in to upload documents');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.doc'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(fileExtension)) {
      setUploadStatus('Invalid file type. Please upload PDF or Word documents only.');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload-document/${user.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`Upload successful! ${result.message}`);
        // Refresh knowledge base after upload
        setTimeout(() => fetchKnowledgeBase(user.id), 2000);
      } else {
        const error = await response.json();
        setUploadStatus(`Upload failed: ${error.detail}`);
      }
    } catch (error) {
      setUploadStatus(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }, [user, API_BASE_URL]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/search/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5,
          threshold: 0.7
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!user || !confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${user.id}/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchKnowledgeBase(user.id);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the document upload feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="mt-2 text-gray-600">Upload and manage your documents for AI processing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the file here...</p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">Drag & drop a document here, or click to select</p>
                    <p className="text-sm text-gray-500">Supports PDF, DOC, and DOCX files</p>
                  </>
                )}
              </div>

              {uploading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-blue-600">Processing...</span>
                </div>
              )}

              {uploadStatus && (
                <div className={`mt-4 p-3 rounded-md ${uploadStatus.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                  {uploadStatus}
                </div>
              )}
            </div>

            {/* Knowledge Base Summary */}
            {knowledgeBase && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{knowledgeBase.total_documents}</div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{knowledgeBase.total_chunks}</div>
                    <div className="text-sm text-gray-600">Text Chunks</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Documents</h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your documents..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
                  {searchResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-600">{result.filename}</span>
                        <span className="text-xs text-gray-500">
                          {(result.similarity_score * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {result.chunk_text.substring(0, 300)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents List */}
              {knowledgeBase?.documents && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Documents</h3>
                  <div className="space-y-3">
                    {knowledgeBase.documents.map((doc) => (
                      <div key={doc.document_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{doc.filename}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(doc.upload_date).toLocaleDateString()} • {doc.chunk_count} chunks
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.document_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}