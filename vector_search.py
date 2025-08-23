# vector_search.py
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
import numpy as np

class VectorSearchService:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

    async def search_similar_chunks(self, query: str, user_id: str, 
                                   limit: int = 5, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """Search for similar chunks using vector similarity"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            # Use Supabase's vector similarity search with pgvector
            # This uses the <=> operator for cosine distance
            result = self.supabase.rpc(
                'search_document_chunks',
                {
                    'query_embedding': query_embedding,
                    'user_id_param': user_id,
                    'match_threshold': 1 - threshold,  # Convert similarity to distance
                    'match_count': limit
                }
            ).execute()
            
            if result.data:
                return result.data
            else:
                return []
                
        except Exception as e:
            print(f"Error searching similar chunks: {str(e)}")
            return []

    async def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a user"""
        try:
            result = self.supabase.table('documents').select('*').eq('user_id', user_id).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error getting user documents: {str(e)}")
            return []

    async def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a document and all its chunks"""
        try:
            # Delete chunks first (due to foreign key constraint)
            self.supabase.table('document_chunks').delete().eq('document_id', document_id).eq('user_id', user_id).execute()
            
            # Delete document
            self.supabase.table('documents').delete().eq('id', document_id).eq('user_id', user_id).execute()
            
            return True
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False

    async def get_relevant_context(self, query: str, user_id: str, 
                                  max_chunks: int = 10) -> str:
        """Get relevant context for a query by combining similar chunks"""
        similar_chunks = await self.search_similar_chunks(query, user_id, max_chunks)
        
        if not similar_chunks:
            return ""
        
        # Combine chunks into context
        context_parts = []
        for chunk in similar_chunks:
            context_parts.append(f"[Document: {chunk.get('filename', 'Unknown')}]\n{chunk.get('chunk_text', '')}")
        
        return "\n\n---\n\n".join(context_parts)

    async def get_user_knowledge_summary(self, user_id: str) -> Dict[str, Any]:
        """Get a summary of user's knowledge base"""
        try:
            documents = await self.get_user_documents(user_id)
            
            # Get total chunk count
            chunk_result = self.supabase.table('document_chunks').select('id', count='exact').eq('user_id', user_id).execute()
            total_chunks = chunk_result.count if chunk_result.count else 0
            
            return {
                'total_documents': len(documents),
                'total_chunks': total_chunks,
                'documents': documents
            }
        except Exception as e:
            print(f"Error getting user knowledge summary: {str(e)}")
            return {'total_documents': 0, 'total_chunks': 0, 'documents': []}